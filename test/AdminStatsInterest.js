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
    console.log('-->>>', web3.utils.fromWei(await instance.getInterest(address)))
    await utils.checkInterest(instance, address, utils.cpc(10));

    // check interest with an unexists account
    await utils.checkInterest(instance, accounts[9], utils.cpc(0));

    // check account
    await utils.checkNormalBalance(instance, address, utils.cpc(20));

    // User withdraw
    tx = await instance.withdraw(utils.cpc(20), { from: address });
    let e = utils.getEvent(tx, utils.EVENT_WITHDRAW);

    await utils.checkNormalBalance(instance, address, utils.cpc(0));

    await utils.checkWithdrawnBalance(instance, address, utils.cpc(20));

    await instance.refund(address, {
      from: e.selectedWorker,
      value: utils.cpc(20),
    });

    await utils.checkWithdrawnBalance(instance, address, utils.cpc(0));

    // Worker's interest
    let total_workers_interest = 0
    for(let i=0; i < workers.length; i++) {
      // get the interest of workers
      let balance = web3.utils.fromWei(await instance.workerBalanceOf(workers[i]))
      let interest = await instance.getWorkerInterest(workers[i])
      interest = web3.utils.fromWei(interest)
      console.log(workers[i], balance, interest)
      total_workers_interest += parseFloat(interest)
    }
    console.log(total_workers_interest)
  });
  it("7位用户各Deposit了 10 CPC，Admin 分配 13 CPC", async () => {
    const instance = await Staking.deployed();
    for (let i = 3; i < accounts.length; i++) {
      await instance.deposit({ from: accounts[i], value: utils.cpc(10) });
      console.log(accounts[i], web3.utils.fromWei(await instance.balanceOf(accounts[i])))
    }

    await utils.checkTotalBalance(
      instance,
      utils.cpc(10 * (accounts.length - 3))
    );

    let tx = await instance.statsInterest(utils.cpc(13));
    let e = await utils.getEvent(tx, utils.EVENT_STATS_INTEREST);

    assert.equal(e.address_cnt.toString(), "7");

    let total_interest = new BN(0);

    let expect_interest = new BN(utils.cpc(13)).div(new BN(7));
    let expect_balance = new BN(utils.cpc(10)).add(expect_interest);
    expect_balance = expect_balance.toString();
    expect_interest = expect_interest.toString();

    for (let i = 3; i < accounts.length; i++) {
      const balance = web3.utils.fromWei(await instance.balanceOf(accounts[i]))
      const interest = web3.utils.fromWei(await instance.getInterest(accounts[i]))
      console.log(accounts[i], balance, interest)
      // assert.equal(
      //   (await instance.balanceOf(accounts[i])).toString(),
      //   expect_balance
      // );
      // if (i !== 5) {
      //   assert.equal(
      //     (await instance.getInterest(accounts[i])).toString(),
      //     expect_interest
      //   );
      // } else {
      //   assert.equal(
      //     (await instance.getInterest(accounts[i])).toString(),
      //     new BN(expect_interest).add(new BN(utils.cpc(10)))
      //   );
      // }
      total_interest = total_interest.add(
        await instance.getInterest(accounts[i])
      );
    }
    // 减去上条测试中分配的 10 CPC
    total_interest = total_interest.sub(new BN(utils.cpc(10)));
    console.log('Total interest(added by all users):', web3.utils.fromWei(total_interest))
    // 统计总利息大小
    assert.equal(web3.utils.fromWei(total_interest) <= 13, true)
    assert.equal(web3.utils.fromWei(total_interest) > 12.9, true)

    // Worker's interest
    let total_workers_interest = 0
    for(let i=0; i < workers.length; i++) {
      // get the interest of workers
      let balance = web3.utils.fromWei(await instance.workerBalanceOf(workers[i]))
      let interest = await instance.getWorkerInterest(workers[i])
      interest = web3.utils.fromWei(interest)
      console.log(workers[i], balance, interest)
      total_workers_interest += parseFloat(interest)
    }
    console.log("Total workers interest", total_workers_interest)
  })
});
