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
  it("Transfer in the contract", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address1 = accounts[5];
    const address2 = accounts[6];
    await init(instance);
    // Deposit
    await instance.deposit({from: address1, value: cpc_10})
    await instance.deposit({from: address2, value: cpc_10})

    // Stats Interest
    await instance.transfer(address2, cpc_10, {from: address1})

  })
})
