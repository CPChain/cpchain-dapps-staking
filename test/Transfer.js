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
    let tx = await instance.transfer(address2, cpc_10, {from: address1})
    await utils.checkEvent(tx, utils.EVENT_TRANSFER, async (e)=> {
      assert.equal(e.from, address1)
      assert.equal(e.to, address2)
      assert.equal(e.value, cpc_10)
    })

    await utils.checkNormalBalance(instance, address1, '0')
    await utils.checkNormalBalance(instance, address2, utils.cpc(20))

    // Check balance with unexists account
    await utils.checkNormalBalance(instance, accounts[9], '0')
    await utils.checkWithdrawnBalance(instance, accounts[9], '0')
    await utils.checkAppealedBalance(instance, accounts[9], '0')

  })
})
