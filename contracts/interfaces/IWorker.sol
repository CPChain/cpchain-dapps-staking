pragma solidity ^0.4.24;

interface IWorker {
    /**
     * Emitted when worker refund money.
     */
    event RefundMoney(address worker, address addr, uint256 amount);

    /**
     * Worker refund money to user when user submit withdraw request.
     * Emits a {RefundMoney} event.
     */
    function refund(address addr) external payable;
}
