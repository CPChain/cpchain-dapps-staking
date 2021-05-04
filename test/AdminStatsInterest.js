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

    // check account
    await utils.checkNormalBalance(instance, address, utils.cpc(20))

    // User withdraw
    tx = await instance.withdraw(utils.cpc(20), {from: address})
    let e = utils.getEvent(tx, utils.EVENT_WITHDRAW)
    console.log(e)

    await utils.checkNormalBalance(instance, address, utils.cpc(0))

    await utils.checkWithdrawnBalance(instance, address, utils.cpc(20))

    await instance.refund(address, {from: e.selectedWorker, value: utils.cpc(20)})

    await utils.checkWithdrawnBalance(instance, address, utils.cpc(0))
  })
  it("7位用户各Deposit了 10 CPC，Admin 分配 13 CPC，最后一个多存储了 10", async ()=> {
    const instance = await Staking.deployed();
    for (let i = 3; i < accounts.length; i++) {
      await instance.deposit({ from: accounts[i], value: utils.cpc(10) });
    }
    await instance.deposit({ from: accounts[9], value: utils.cpc(10)})

    let tx = await instance.statsInterest(utils.cpc(13));
    let e = await utils.getEvent(tx, utils.EVENT_STATS_INTEREST)
    
    assert.equal(e.address_cnt.toString(), "7")
    
    let total_interest = new BN(0)

    for (let i = 3; i < accounts.length; i++) {
      console.log('\n', '-----', i, '------')

      console.log(web3.utils.fromWei(await instance.balanceOf(accounts[i])))
      console.log(web3.utils.fromWei(await instance.getInterest(accounts[i])))

      total_interest = total_interest.add(await instance.getInterest(accounts[i]))
    }
    // 减去上次
    total_interest = total_interest.sub(new BN(utils.cpc(10)))
    console.log('------')
    console.log(web3.utils.fromWei(total_interest))
  })
});
