const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils")

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  it("Deposit 10 CPC then withdraw then refund", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = utils.cpc(10);
    const address = accounts[5];
    await utils.init_workers(workers, instance);
    // Deposit
    let b1 = await utils.getBalance(address)
    let wb1 = await utils.getBalance(workers[0])
    let tx = await instance.deposit({ from: address, value: cpc_10 });
    let b2 = await utils.getBalance(address)

    await utils.checkEvent(tx, utils.EVENT_DEPOSIT, async (e)=> {
      let selected = e.selectedWorker
      assert.equal(selected, workers[0])
      assert.equal(e.value, cpc_10)
      let gasUsed = await utils.getGasUsedInCPC(tx)
      // b1 = b2 + cpc_10 + gasUsed
      assert.equal(b1, utils.add(b2, cpc_10).add(new BN(gasUsed)))
      await utils.checkWorkerBalance(instance, selected, cpc_10)
      await utils.checkBalance(selected, utils.add(wb1, cpc_10))
    })

    await utils.checkNormalBalance(instance, address, cpc_10)
    await utils.checkWithdrawnBalance(instance, address, '0')
    await utils.checkAppealedBalance(instance, address, '0')
    await utils.checkTotalBalance(instance, cpc_10)

    // Withdraw
    tx = await instance.withdraw(cpc_10, { from: address });

    await utils.checkNormalBalance(instance, address, '0')
    await utils.checkWithdrawnBalance(instance, address, cpc_10)
    await utils.checkAppealedBalance(instance, address, '0')
    await utils.checkTotalBalance(instance, '0')

    let selected;
    await utils.checkEvent(tx, utils.EVENT_WITHDRAW, async (ex) => {
      selected = ex.selectedWorker
      assert.equal(ex.value, cpc_10)
      assert.equal(ex.account, address)
    })

    // selected refund without any CPC
    try {
      await instance.refund(address, { from: selected});
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The value is not equal to the withdrawn balance"))
    }

    // workers[1] refund with more CPC than withdrawn
    try {
      await instance.refund(address, { from: selected, value: web3.utils.toWei("10.1", "ether") });
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The value is not equal to the withdrawn balance"))
    }

    //workers[1] refund with less CPC than withdrawn
    try {
      await instance.refund(address, { from: selected, value: web3.utils.toWei("9.9", "ether")});
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The value is not equal to the withdrawn balance"))
    }

    // Refund with worker[1] ranther than worker[0]
    try {
      await instance.refund(address, { from: workers[1], value: cpc_10 });
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("You're not the selected worker"))
    }

    let balance_user1 = await utils.getBalance(address)
    let balance_worker1 = await utils.getBalance(selected)

    // selected refund
    tx = await instance.refund(address, { from: selected, value: cpc_10 });

    let gasUsed = await utils.getGasUsedInCPC(tx)

    // Validate event
    await utils.checkEvent(tx, utils.EVENT_REFUND_MONEY, async (ev)=> {
      assert.equal(ev.worker, selected)
      assert.equal(ev.addr, address)
      assert.equal(ev.amount, cpc_10)

      let balance_user2 = await utils.getBalance(address)
      let balance_worker2 = await utils.getBalance(selected)

      // balance1 + cpc_10 = balance2
      assert.equal(utils.add(balance_user1, cpc_10), balance_user2, "User's balance should add 10 CPC")

      // balance1 = balance2 + gasUsed + cpc_10
      assert.equal(utils.add(balance_worker2, gasUsed).add(new BN(cpc_10)), balance_worker1, "The worker's balance is error")

      // User's withdrawn account should be 0
      await utils.checkWithdrawnBalance(instance, address, utils.cpc(0))
    })

    // selected refund again
    try {
      await instance.refund(address, { from: selected, value: cpc_10 });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("The withdrawn balance should greater than 0")
      );
    }

  });
  it("Refund before withdraw", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[6];
    // Deposit
    await instance.deposit({ from: address, value: cpc_10 });

    // workers[0] Refund
    try {
      await instance.refund(address, { from: workers[0], value: cpc_10 });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("The withdrawn balance should greater than 0")
      );
    }
  });
  it("Worker refund after 6 blocks", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
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

    await instance.refund(address, { from: workers[0], value: web3.utils.toWei("1", "ether") });
  });
  it("Worker refund after user have appealed", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    // Deposit
    await instance.deposit({from: address, value: cpc_10})

    // Withdraw
    let tx = await instance.withdraw(web3.utils.toWei("1", "ether"), {from: address})
    let selected_worker = null
    truffleAssert.eventEmitted(tx, "Withdraw", (ev) => {
      selected_worker = ev.selectedWorker;
      return ev.value == web3.utils.toWei('1', 'ether');
    });

    // Stats Interest to generate 6 blocks
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))

    // Appeal
    await instance.appeal({from: address})

    // Withdraw after appeal
    try {
      await instance.refund(address, { from: selected_worker, value: web3.utils.toWei("1", "ether") });
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The withdrawn balance should greater than 0"))
    }

    // Admin refund
    await instance.appealRefund(address, {value: web3.utils.toWei("1", "ether")})
  });
  it("Worker refund after admin have refund", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    // Deposit
    await instance.deposit({from: address, value: cpc_10})

    // Withdraw
    let tx = await instance.withdraw(web3.utils.toWei("1", "ether"), {from: address})
    let selected_worker = null
    truffleAssert.eventEmitted(tx, "Withdraw", (ev) => {
      selected_worker = ev.selectedWorker;
      return ev.value == web3.utils.toWei('1', 'ether');
    });

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

    // Withdraw after appeal
    try {
      await instance.refund(address, { from: selected_worker, value: web3.utils.toWei("1", "ether") });
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The withdrawn balance should greater than 0"))
    }
  });
  it("User appeal after refund", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    // Deposit
    await instance.deposit({from: address, value: cpc_10})

    // Withdraw
    let tx = await instance.withdraw(web3.utils.toWei("1", "ether"), {from: address})
    let selected_worker = null
    truffleAssert.eventEmitted(tx, "Withdraw", (ev) => {
      selected_worker = ev.selectedWorker;
      return ev.value == web3.utils.toWei('1', 'ether');
    });

    // Stats Interest to generate 6 blocks
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))
    await instance.statsInterest(web3.utils.toWei("10", "ether"))

    // Refund
    await instance.refund(address, { from: selected_worker, value: web3.utils.toWei("1", "ether") });

    // Appeal
    try {
      await instance.appeal({from: address})
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("You haven't a unhandled withdrawn transaction"))
    }
  });
})
