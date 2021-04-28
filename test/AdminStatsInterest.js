const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils")

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  it("Admin stats interest", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    await utils.init_workers(workers, instance);
    // Deposit
    await instance.deposit({from: address, value: cpc_10})

    // Stats Interest
    await instance.statsInterest(web3.utils.toWei("10", "ether"))

  })
})
