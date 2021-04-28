const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils")

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  it("Deposit 10 CPC then withdraw then refund", async () => {
    const instance = await Staking.deployed();
    const cpc_10 = web3.utils.toWei("10", "ether");
    const address = accounts[5];
    await utils.init_workers(workers, instance);
    // Deposit
    await instance.deposit({ from: address, value: cpc_10 });

    // Withdraw
    await instance.withdraw(cpc_10, { from: address });

    // workers[0] refund without any CPC
    try {
      await instance.refund(address, { from: workers[0]});
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The value is not equal to the withdrawn balance"))
    }

    // workers[1] refund with more CPC than withdrawn
    try {
      await instance.refund(address, { from: workers[0], value: web3.utils.toWei("10.1", "ether") });
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The value is not equal to the withdrawn balance"))
    }

    //workers[1] refund with less CPC than withdrawn
    try {
      await instance.refund(address, { from: workers[0], value: web3.utils.toWei("9.9", "ether")});
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

    // workers[0] refund
    await instance.refund(address, { from: workers[0], value: cpc_10 });

    // worker[0] refund again
    try {
      await instance.refund(address, { from: workers[0], value: cpc_10 });
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
