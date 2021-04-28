const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils")

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  
  it("Transfer in the contract", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address1 = accounts[5];
    const address2 = accounts[6];
    await utils.init_workers(workers, instance);
    // Deposit
    await instance.deposit({from: address1, value: cpc_10})
    await instance.deposit({from: address2, value: cpc_10})

    // Stats Interest
    await instance.transfer(address2, cpc_10, {from: address1})

  })
})
