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

    // paramaeters
    uint256 withdraw_fee_numerator = 0; // fee of withdraw
    uint256 withdraw_fee_denominator = 10000; // true_fee = value * withdraw_fee_numerator / withdraw_fee_denominator
    uint256 worker_balance_limit = 1000000 ether; // The upper limit for worker balance
    uint256 user_balance_limit = 10000 ether; // The upper limit per users
    uint256 tx_upper_limit = 10000 ether; // The upper limit per tx
    uint256 tx_lower_limit = 1 ether; // The lower limit per tx
    bool allowOwnerBeContract = false; // If allow the owner be a contract

    modifier onlyOwner() {require(msg.sender == owner);_;}
    modifier onlyEnabled() {require(enabled);_;}

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

    // Admin
    /**
     * Add new worker to the system.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {AddWorker} event.
     */
    function addWorker(address account) external onlyOwner onlyEnabled {
        require(!workers[account].existed, "The worker has already existed!");
        workers[account] = Worker({balance: 0, existed: true});
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
    function AppealRefund(address user, uint256 amount) payable external onlyOwner onlyEnabled {
        // TODO
    }

    /**
     * This operation will be executed when someone do a wrong operate, e.g., send CPC directly to the contract.
     * Use this function to refund CPC to the owner.
     */
    function refundToOwner() public onlyOwner {
        owner.transfer(address(this).balance);
    }
}
