pragma solidity ^0.4.24;

interface IStaking {
    /**
     * Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * Emitted when the user submit an appeal.
     */
    event Appeal(address indexed account, uint256 value, uint256 blockHeight);

    /**
     * Emitted when the user user deposit money.
     */
    event Deposit(address indexed account, address selectedWorker, uint256 value);

    /**
     * Emitted when the user withdraw money.
     */
    event Withdraw(address indexed account, address selectedWorker, uint256 value, uint256 blockHeight);

    /**
     * User deposit money to the system, system select a worker then send the money to it.
     * Then record the amount to the user's account.
     * If the user's withdrawn account has money, he can't deposit.
     * Emits a {Deposit} event.
     */
    function deposit(uint256 amount) external;

    /**
     * User withdraw money. The system select a worker and emit a Event to notify it.
     * Move the withdrawn money to the withdrawn account, wait until the worker refund.
     * If the user's appeal account has money, he can't withdraw.
     * Emits a {Withdraw} event.
     */
    function withdraw(uint256 amount) external;

    /**
     * When the user's withdrawn account has money, 
     * and the block height minus withdrawn height greater than 6, 
     * the user can submit an appeal.
     * Emits an {Appeal} event.
     */
    function appeal() external;

    /**
     * Returns the amount of balance owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * Returns the amount of withdrawn balance owned by `account`.
     */
    function getWithdrawnBalance(address account) external view returns (uint256);

    /**
     * Returns the amount of appealed balance owned by `account`.
     */
    function getAppealedBalance(address account) external view returns (uint256);

    /**
     * Returns the amount of interest owned by `account`.
     */
    function getInterest(address account) external view returns (uint256);

    /**
     * Moves `amount` tokens from the caller's account to `recipient`.
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);
}
