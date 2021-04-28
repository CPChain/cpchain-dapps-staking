const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils")

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  it("Admin appeal refund", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    await utils.init_workers(workers, instance);
    // Deposit
    await instance.deposit({from: address, value: cpc_10})

    // Withdraw
    await instance.withdraw(web3.utils.toWei("1", "ether"), {from: address})

    // Stats Interest to generate 6 blocks
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))

    // Appeal
    await instance.appeal({from: address})

    // Admin refund
    await instance.appealRefund(address, {value: web3.utils.toWei("1", "ether")})

  })
})
