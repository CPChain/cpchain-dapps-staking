const Staking = artifacts.require("Staking");
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
    await instance.statsInterest(web3.utils.toWei("0", "ether"))
    await instance.statsInterest(web3.utils.toWei("0", "ether"))
    await instance.statsInterest(web3.utils.toWei("0", "ether"))
    await instance.statsInterest(web3.utils.toWei("0", "ether"))
    await instance.statsInterest(web3.utils.toWei("0", "ether"))
    await instance.statsInterest(web3.utils.toWei("0", "ether"))

    // Appeal
    let tx = await instance.appeal({from: address})
    await utils.checkEvent(tx, utils.EVENT_APPEAL, async (e) => {
      assert.equal(e.value, utils.cpc(1))
      assert.equal(e.account, address)
    })

    await utils.checkNormalBalance(instance, address, utils.cpc(9))
    await utils.checkWithdrawnBalance(instance, address, '0')
    await utils.checkAppealedBalance(instance, address, utils.cpc(1))


    // Admin refund
    tx = await instance.appealRefund(address, {value: web3.utils.toWei("1", "ether")})
    await utils.checkEvent(tx, utils.EVENT_ADMIN_APPEAL_REFUND, async (e) => {
      assert.equal(e.user, address)
      assert.equal(e.amount, utils.cpc(1))
    })

  })
})
