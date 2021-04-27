const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  async function init(instance) {
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
      "Count should be 1"
    );
  }
  async function get_workers_balance() {
    let data = {};
    for (let i = 0; i < workers.length; i++) {
      data[workers[i]] = await web3.eth.getBalance(workers[i]);
    }
    return data;
  }
  it("Deposit 10 CPC then withdraw then refund", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    await init(instance);
    // Deposit
    await instance.deposit({from: address, value: cpc_10})

    // Withdraw
    await instance.withdraw(cpc_10, {from: address})

    // workers[0] Refund
    await instance.refund(address, {from: workers[0], value: cpc_10})

  })


})
