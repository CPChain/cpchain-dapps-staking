const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils");

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  it("Admin stats interest", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    await utils.init_workers(workers, instance);

    // Distribute when total_balance is 0
    try {
      await instance.statsInterest(utils.cpc(10));
      assert.fail();
    } catch (error) {
      assert.ok(error.toString().includes("The total balance is empty now"));
    }

    // Deposit
    await instance.deposit({ from: address, value: cpc_10 });

    // Stats Interest
    let tx = await instance.statsInterest(utils.cpc(10));
    await utils.checkEvent(tx, utils.EVENT_STATS_INTEREST, async (e) => {
      assert.equal(e.amount, utils.cpc(10), "Amount is error");
      await utils.checkTotalBalance(instance, e.total_balance);
      assert.equal(e.address_cnt, 1, "Cnt is error");
    });

    // check interest
    await utils.checkInterest(instance, address, utils.cpc(10))

    // check interest with an unexists account
    await utils.checkInterest(instance, accounts[9], utils.cpc(0))
  });
});
