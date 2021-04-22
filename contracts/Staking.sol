pragma solidity ^0.4.24;

import "./lib/safeMath.sol";
import "./lib/set.sol";

import "./interfaces/IAdmin.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IWorker.sol";

contract Staking is IAdmin, IStaking, IWorker {
    using Set for Set.Data;
    using SafeMath for uint256;

    address owner; // owner has permissions to modify parameters
    bool public enabled = true; // if upgrade contract, then the old contract should be disabled

    // workers
    struct Worker {
        uint256 balance;
        bool existed;
    }

    mapping(address=>Worker) internal workers;
    Set.Data private workers_list; // for iterations.

    // users
    struct User {
        uint256 balance;
        uint256 withdrawnBalance; // If the withdrawn-balance not empty, you can't withdraw.
        uint256 appealedBalance; // If the appeal-balane not empty, you can't withdraw.
        uint256 lastWithdrawnHeight; // When you submit a appeal, your height should greater than the lastWithdrawnHeight.
        address lastSelectedWorker; // The worker specified.
        uint256 interest; // interest amount
    }

    mapping(address=>User) internal users;
    Set.Data private users_list; // for iterations.

    // paramaeters
    uint256 withdraw_fee_numerator = 0; // fee of withdraw
    uint256 withdraw_fee_denominator = 10000; // true_fee = value * withdraw_fee_numerator / withdraw_fee_denominator
    uint256 worker_balance_limit = 1000000 ether; // The upper limit for worker balance
    uint256 user_balance_limit = 10000 ether; // The upper limit per users
    uint256 tx_upper_limit = 10000 ether; // The upper limit per tx
    uint256 tx_lower_limit = 1 ether; // The lower limit per tx
    uint256 withdraw_upper_limit = 10000 ether; // The upper limit when withdraw
    bool allowOwnerBeContract = false; // If allow the owner be a contract

    modifier onlyOwner() {require(msg.sender == owner);_;}
    modifier onlyEnabled() {require(enabled);_;}
    modifier haveWorkers() {require(workers_list.getAll().length > 0, "There are not workers now");_;}

    constructor () public {
        owner = msg.sender;
    }

    // owner can enable and disable rnode contract
    function enableContract() public onlyOwner {
        enabled = true;
    }

    function disableContract() public onlyOwner {
        enabled = false;
    }

    // judge if an address is a contract address
    function isContract(address addr) public view returns (bool) {
        uint size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }

    // User
    /**
     * User deposit money to the system, system select a worker then send the money to it.
     * Then record the amount to the user's account.
     * If the user's withdrawn account has money, he can't deposit.
     * Emits a {Deposit} event.
     */
    function deposit() payable external onlyEnabled haveWorkers {
        require(msg.value >= tx_lower_limit, "Amount less than the lower limit");
        require(msg.value <= tx_upper_limit, "Amount greater than the upper limit");
        if(users_list.contains(msg.sender)) {
            // check the upper limit
            uint256 balance = users[msg.sender].balance + msg.value;
            require(balance <= user_balance_limit, "User's balance greater than the upper limit");
        } else {
            users[msg.sender].balance = 0;
            users_list.insert(msg.sender);
        }
        // select worker, find the minest account
        address[] memory items = workers_list.getAll();
        address selected = items[0];
        for(uint i = 1; i < items.length; i++) {
            if (workers[items[i]].balance < workers[selected].balance) {
                selected = items[i];
            }
        }
        // check upper limit of the worker
        require((workers[selected].balance + msg.value) < worker_balance_limit, "Amount greater than worker's upper limit");

        // transfer
        selected.transfer(msg.value);
        
        // worker balance
        workers[selected].balance = workers[selected].balance.add(msg.value);

        // user balance
        users[msg.sender].balance = users[msg.sender].balance.add(msg.value);

        // emit event
        emit Deposit(msg.sender, selected, msg.value);
    }

    /**
     * User withdraw money. The system select a worker and emit a Event to notify it.
     * Move the withdrawn money to the withdrawn account, wait until the worker refund.
     * If the user's appeal account has money, he can't withdraw.
     * Emits a {Withdraw} event.
     */
    function withdraw(uint256 amount) external onlyEnabled haveWorkers {
        require(amount <= withdraw_upper_limit, "Amount greater than the upper limit");
        require(users_list.contains(msg.sender), "You did't deposit money");
        require(amount < users[msg.sender].balance, "Amount greater than deposited money");
        require(users[msg.sender].withdrawnBalance == 0, "You have a unhandled withdrawn transaction");
        require(users[msg.sender].appealedBalance == 0, "You have a unhandled appealed transaction");
        // select worker
        address[] memory items = workers_list.getAll();
        address selected = items[0];
        for(uint i = 1; i < items.length; i++) {
            if (workers[items[i]].balance > workers[selected].balance) {
                selected = items[i];
            }
        }

        // transfer the balance to the withdrawn balance
        users[msg.sender].balance -= amount;
        users[msg.sender].withdrawnBalance = amount;
        users[msg.sender].lastWithdrawnHeight = block.number;
        users[msg.sender].lastSelectedWorker = selected;

        // emit event
        emit Withdraw(msg.sender, selected, amount, block.number);
    }

    /**
     * When the user's withdrawn account has money, 
     * and the block height minus withdrawn height greater than 6, 
     * the user can submit an appeal.
     * Emits an {Appeal} event.
     */
    function appeal() external onlyEnabled {
        require(users_list.contains(msg.sender), "You did't deposit money");
        require(users[msg.sender].appealedBalance == 0, "You have a unhandled appealed transaction");
        require(users[msg.sender].withdrawnBalance > 0, "You haven't a unhandled withdrawn transaction");
        require(block.number - users[msg.sender].lastWithdrawnHeight >= 6, "You can't appeal until there are 6 blocks that have been generated after withdrew");
        users[msg.sender].appealedBalance = users[msg.sender].withdrawnBalance;
        users[msg.sender].withdrawnBalance = 0;
        emit Appeal(msg.sender, users[msg.sender].appealedBalance, block.number);
    }

    /**
     * Returns the amount of balance owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256) {
        if(!users_list.contains(account)) {
            return 0;
        }
        return users[account].balance;
    }

    /**
     * Returns the amount of withdrawn balance owned by `account`.
     */
    function getWithdrawnBalance(address account) external view returns (uint256) {
        if(!users_list.contains(account)) {
            return 0;
        }
        return users[account].withdrawnBalance;
    }

    /**
     * Returns the amount of appealed balance owned by `account`.
     */
    function getAppealedBalance(address account) external view returns (uint256) {
        if(!users_list.contains(account)) {
            return 0;
        }
        return users[account].appealedBalance;
    }

    /**
     * Returns the amount of interest owned by `account`.
     */
    function getInterest(address account) external view returns (uint256) {
        if(!users_list.contains(account)) {
            return 0;
        }
        return users[account].interest;
    }

    /**
     * Moves `amount` tokens from the caller's account to `recipient`.
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external onlyEnabled returns (bool) {
        require(users_list.contains(msg.sender), "You haven't deposited money");
        require(users[msg.sender].balance >= amount, "You balance is less than value");
        users[recipient].balance += amount;
        users[msg.sender].balance -= amount;
        emit Transfer(msg.sender, recipient, amount);
    }

    // Worker
    /**
     * Worker refund money to user when user submit withdraw request.
     * Emits a {RefundMoney} event.
     */
    function refund(address addr) external payable {
        require(workers_list.contains(msg.sender), "You're not a worker");
        require(users_list.contains(addr), "The addr is not an user");
        require(users[addr].withdrawnBalance > 0, "The withdrawn balance should greater than 0");
        require(users[addr].withdrawnBalance == msg.value, "The value is not equal to the withdrawn balance");
        require(users[addr].lastSelectedWorker == msg.sender, "You're not the selected worker");
        addr.transfer(msg.value);
        users[addr].withdrawnBalance = 0;
        workers[msg.sender].balance -= msg.value;
        emit RefundMoney(msg.sender, addr, msg.value); 
    }

    // Admin

    /**
     * Add new worker to the system.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {AddWorker} event.
     */
    function addWorker(address account) external onlyOwner onlyEnabled {
        require(!workers[account].existed, "The worker has already existed!");
        workers[account] = Worker({balance: 0, existed: true});
        workers_list.insert(account);
        emit AddWorker(account);
    }
    
    /**
     * Remove a existed worker from system.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {RemoveWorker} event.
     */
    function removeWorker(address account) external onlyOwner onlyEnabled {
        require(workers[account].existed, "The worker not existed!");
        delete workers[account];
        workers_list.remove(account);
        emit RemoveWorker(account);
    }

    /**
     * Check an address whether the worker.
     */
    function isWorker(address account) external view returns (bool) {
        return workers[account].existed;
    }

    /**
     * Stats the interest that all workers earned yesterday and distributed by the ratio of balance of all addresses.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {StatsInterest} event.
     */
    function statsInterest(uint256 interest) external onlyOwner onlyEnabled {
        // TODO
    }

    /**
     * Set the fee when withdraw money. The unit of the param is 1/10000. And the param should greater than 0 and less than 100 (0 - 1%)
     */
    function setWithdrawFee(uint256 fee) external onlyOwner onlyEnabled {
        require(fee <= 100, "The fee should greater than 0 and less than 100 (0 - 1%)");
        withdraw_fee_numerator = fee;
    }

    /**
     * Set the upper limit when withdraw
     */
    function setWithdrawnUpperLimit(uint256 limit) external onlyOwner onlyEnabled {
        require(limit >= 1 ether, "The upper limit should be greater than 1 CPC");
        withdraw_upper_limit = limit;
    }

    /**
     * Set the upper limit of worker's balance.
     */
    function setWorkerBalanceLimit(uint256 limit) external onlyOwner onlyEnabled {
        require(limit >= 1 ether, "The upper limit should greater than 1 CPC");
        worker_balance_limit = limit;
    }

    /**
     * Set the upper limit of user's balance.
     */
    function setUserBalanceLimit(uint256 limit) external onlyOwner onlyEnabled {
        require(limit >= 1 ether, "The upper limit should greater than 1 CPC");
        user_balance_limit = limit;
    }

    /**
     * Set the upper limit per tx.
     */
    function setTxUpperLimit(uint256 limit) external onlyOwner onlyEnabled {
        require(limit >= 1 ether, "The upper limit should greater than 1 CPC");
        tx_upper_limit = limit;
    }

    /**
     * Set the lower limit per tx.
     */
    function setTxLowerLimit(uint256 limit) external onlyOwner onlyEnabled {
        require(limit >= 1 ether, "The lower limit should greater than 1 CPC");
        tx_lower_limit = limit;
    }

    function setAllowOwnerBeContract(bool allow) external onlyOwner {
        allowOwnerBeContract = allow;
    }

    /**
     * Change the owner of the contract. If the address is a contract, the contract should be IAdmin.
     */
    function changeOwner(address new_owner) external onlyOwner onlyEnabled {
        if(isContract(new_owner)) {
            require(allowOwnerBeContract, "Don't allow contract be the owner");
        }
        owner = new_owner;
    }

    /**
     * When a user didn't receive the amount after he withdrew, he can submit an appeal.
     * Admin call this function to refund.
     * Emits a {AdminAppealRefund} event.
     */
    function AppealRefund(address addr) payable external onlyOwner onlyEnabled {
        require(users_list.contains(addr), "The addr is not an user");
        require(users[addr].appealedBalance > 0, "The withdrawn balane should greater than 0");
        require(users[addr].appealedBalance == msg.value, "The value is not equal to the withdrawn balance");
        require(block.number - users[addr].lastWithdrawnHeight >= 6, "You can't appeal until there are 6 blocks that have been generated after withdrew");
        addr.transfer(msg.value);
        users[addr].appealedBalance = 0;
        emit AdminAppealRefund(addr, msg.value);
    }

    /**
     * This operation will be executed when someone do a wrong operate, e.g., send CPC directly to the contract.
     * Use this function to refund CPC to the owner.
     */
    function refundToOwner() public onlyOwner {
        owner.transfer(address(this).balance);
    }
}
