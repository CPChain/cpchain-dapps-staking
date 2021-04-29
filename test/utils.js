const truffleAssert = require("truffle-assertions");

var BN = web3.utils.BN;

exports.cpc = (val) => {
  return web3.utils.toWei(String(val), "ether")
}

// Initialize workers
exports.init_workers = async function (workers, instance) {
  // Add a worker
  for (let i = 0; i < workers.length; i++) {
    const worker = workers[i];
    await instance.addWorker(worker);
    assert.equal(
      await instance.isWorker(worker),
      true,
      "This address should be worker"
    );
  }
  assert.equal(
    await instance.workersCnt(),
    workers.length,
    "Count should be " + workers.length
  );
}

exports.get_workers_balance = async function(workers) {
  let data = {};
  for (let i = 0; i < workers.length; i++) {
    data[workers[i]] = await web3.eth.getBalance(workers[i]);
  }
  return data;
}

exports.getBalance = async (address) => {
  return await web3.eth.getBalance(address)
}

exports.getGasUsedInCPC = async (tx) => {
  let tx_origin = await web3.eth.getTransaction(tx.tx);
  let gasPrice = tx_origin.gasPrice;

  return new BN(tx.receipt.gasUsed).mul(new BN(gasPrice)).toString();
}

exports.checkBalance = async (address, expected) => {
  assert.equal(await web3.eth.getBalance(address), expected, "Balance is error")
}

exports.checkNormalBalance = async (instance, address, expected) => {
  if (typeof(expected) !== 'string') {
    expected = expected.toString()
  }
  assert.equal((await instance.balanceOf(address)).toString(), expected, "The balance of user in the contract is error")
}

exports.checkWorkerBalance = async (instance, address, expected) => {
  if (typeof(expected) !== 'string') {
    expected = expected.toString()
  }
  assert.equal((await instance.workerBalanceOf(address)).toString(), expected, "The balance of worker in thr contract is error")
}

exports.checkTotalBalance = async (instance, expected) => {
  assert.equal((await instance.total_balance()).toString(), expected, "Total balance is error")
}

exports.checkWithdrawnBalance = async (instance, address, expected) => {
  assert.equal((await instance.getWithdrawnBalance(address)).toString(), expected, "The withdrawnbBalance of user in the contract is error")
}

exports.checkAppealedBalance = async (instance, address, expected) => {
  assert.equal((await instance.getAppealedBalance(address)).toString(), expected, "The appealedBalance of user in the contract is error")
}

exports.checkWorkerAddress = (expected, actual) => {
  assert.equal(expected, actual, "The selected worker is error")
}

exports.EVENT_DEPOSIT = "Deposit"

exports.EVENT_WITHDRAW = "Withdraw"

exports.EVENT_REFUND_MONEY = "RefundMoney"

exports.EVENT_APPEAL = "Appeal"

exports.EVENT_ADMIN_APPEAL_REFUND = "AdminAppealRefund"

exports.EVENT_STATS_INTEREST = "StatsInterest"

exports.EVENT_TRANSFER = "Transfer"

exports.checkEvent = async (tx, event, cb) => {
  let result;
  truffleAssert.eventEmitted(tx, event, (ev) => {
    result = ev
    return true
  });
  await cb(result)
}

exports.add = (a, b) => {
  return new BN(a).add(new BN(b))
}

exports.lastestBlockNumber = async () => {
  return (await web3.eth.getBlock('latest')).number
}

exports.timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

exports.checkInterest = async (instance, address, interest) => {
  assert.equal(await instance.getInterest(address), interest, "Interest of address is error")
}

exports.getEvent = (tx, event) => {
  let result;
  truffleAssert.eventEmitted(tx, event, (ev) => {
    result = ev
    return true
  });
  return result
}
