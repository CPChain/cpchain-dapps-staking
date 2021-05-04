const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils");

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  it("withdraw before deposit", async () => {
    const instance = await Staking.deployed();
    const address = accounts[8];
    await utils.init_workers(workers, instance);
    await instance.deposit({ from: accounts[0], value: utils.cpc(10) });
    try {
      await instance.withdraw(utils.cpc(10), { from: address });
      assert.fail();
    } catch (error) {
      assert.ok(error.toString().includes("You did't deposit money"));
    }
  });
});
