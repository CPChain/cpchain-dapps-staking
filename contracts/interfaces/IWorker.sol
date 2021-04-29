pragma solidity ^0.4.24;

interface IWorker {
    /**
     * Emitted when worker refund money.
     */
    event RefundMoney(address worker, address addr, uint256 amount, uint256 fee);

    /**
     * Worker refund money to user when user submit withdraw request.
     * Emits a {RefundMoney} event.
     */
    function refund(address addr) external payable;

    /**
     * Returns the amount of balance owned by `account`.
     */
    function workerBalanceOf(address account) external view returns (uint256);
}
