pragma solidity ^0.4.24;

interface IAdmin {
    /**
     * Emitted when an new worker be added.
     */
    event AddWorker(address account);

    /**
     * Emitted when a worker be removed.
     */
    event RemoveWorker(address account);

    /**
     * Emitted when the admin call the statsInterest
     */
    event StatsInterest(uint256 amount, uint256 total_balance, uint256 address_cnt, uint256 height);

    /**
     * Emitted when admin refund.
     */
    event AdminAppealRefund(address user, uint256 amount);

    /**
     * Add new worker to the system.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {AddWorker} event.
     */
    function addWorker(address account) external;
    
    /**
     * Remove a existed worker from system.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {RemoveWorker} event.
     */
    function removeWorker(address account) external;

    /**
     * Check an address whether the worker.
     */
    function isWorker(address account) external view returns (bool);

    /**
     * Stats the interest that all workers earned yesterday and distributed by the ratio of balance of all addresses.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {StatsInterest} event.
     */
    function statsInterest(uint256 interest) external;

    /**
     * Set the fee when withdraw money. The unit of the param is 1/10000. And the param should greater than 0 and less than 100 (0 - 1%)
     */
    function setWithdrawFee(uint256 fee) external;

    /**
     * Set the upper limit of worker's balance.
     */
    function setWorkerBalanceLimit(uint256 limit) external;

    /**
     * Set the upper limit of user's balance.
     */
    function setUserBalanceLimit(uint256 limit) external;

    /**
     * Set the upper limit per tx.
     */
    function setTxUpperLimit(uint256 limit) external;

    /**
     * Set the lower limit per tx.
     */
    function setTxLowerLimit(uint256 limit) external;

    /**
     * Change the owner of the contract. If the address is a contract, the contract should be IAdmin.
     */
    function changeOwner(address owner) external;

    /**
     * When a user didn't receive the amount after he withdrew, he can submit an appeal.
     * Admin call this function to refund.
     * Emits a {AdminAppealRefund} event.
     */
    function AppealRefund(address user, uint256 amount) payable external;
}
