const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");
const utils = require("./utils");

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  it("Deposit 10 CPC when not have any workers", async () => {
    const instance = await Staking.deployed();
    const address = accounts[1];
    try {
      await instance.deposit({
        from: address,
        value: utils.cpc(10),
      });
      assert.fail();
    } catch (error) {
      assert.ok(error.toString().includes("There are no workers now"));
    }
  });
  it("Withdraw without any workers", async () => {
    const instance = await Staking.deployed();
    try {
      await instance.withdraw(utils.cpc(10));
      assert.fail();
    } catch (error) {
      assert.ok(error.toString().includes("There are no workers now"));
    }
  });
  it("Deposit 10 CPC after added three workers", async () => {
    const instance = await Staking.deployed();
    await utils.init_workers(workers, instance);
    let workers_before_balance = await utils.get_workers_balance(workers);
    const address = accounts[5];
    let balance_before = await utils.getBalance(address);
    let value = utils.cpc(10);
    let tx = await instance.deposit({ from: address, value: value });
    let balance_after = await utils.getBalance(address);

    // gasUsed
    let gasUsed = await utils.getGasUsedInCPC(tx);
    let balance_after_with_fee = new BN(balance_after)
      .add(new BN(gasUsed))
      .toString();

    await utils.checkEvent(tx, utils.EVENT_DEPOSIT, async (ev) => {
      let selected = ev.selectedWorker;
      assert.equal(ev.value, value);
      utils.checkWorkerAddress(selected, workers[0]);

      // The worker should add 10 CPC
      assert.equal(
        await utils.getBalance(selected),
        new BN(workers_before_balance[selected]).add(new BN(value)).toString(),
        "The worker should add 10 CPC"
      );

      // Balance calucation
      assert.equal(
        new BN(balance_after_with_fee).add(new BN(value)).toString(),
        new BN(balance_before).toString(),
        "The balance is wrong"
      );

      // validate the balance of user in the contract
      await utils.checkNormalBalance(instance, address, value);

      // validate the balance of the worker
      await utils.checkWorkerBalance(instance, selected, value);
    });

    // Deposit again with 0 CPC
    try {
      await instance.deposit({ from: address, value: 0 });
      assert.fail();
    } catch (error) {
      assert.ok(error.toString().includes("Amount less than the lower limit"));
    }

    // Deposit 10 CPC again
    tx = await instance.deposit({ from: address, value: value });
    await utils.checkEvent(tx, utils.EVENT_DEPOSIT, async (ev) => {
      let selected = ev.selectedWorker;
      assert.equal(
        selected,
        workers[1],
        "The selected worker should be the worker2"
      );

      // The worker should add 10 CPC
      await utils.checkBalance(
        selected,
        new BN(workers_before_balance[selected]).add(new BN(value))
      );

      // validate the balance of the worker
      await utils.checkWorkerBalance(instance, selected, value);
      assert.equal(ev.value, value);
    });

    // validate the balance of user in the contract
    await utils.checkNormalBalance(
      instance,
      address,
      new BN(value).mul(new BN(2))
    );

    // Validate the total balance of all user
    await utils.checkTotalBalance(instance, new BN(value).mul(new BN(2)));

    // Modify the parameter of up limit per tx to 20 CPC
    await instance.setTxUpperLimit(utils.cpc(20));

    // Deposit 21 CPC to the contract
    try {
      await instance.deposit({ from: address, value: utils.cpc(21) });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("Amount greater than the upper limit")
      );
    }

    // Deposit 0.1 CPC to the contract
    try {
      await instance.deposit({ from: address, value: utils.cpc(0.1) });
      assert.fail();
    } catch (error) {
      assert.ok(error.toString().includes("Amount less than the lower limit"));
    }

    // Modify the upper limit for the user's balance to 30 CPC
    await instance.setUserBalanceLimit(utils.cpc(30));

    // Deposit 11 CPC again, but this time will failed
    try {
      await instance.deposit({ from: address, value: utils.cpc(11) });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("User's balance greater than the upper limit")
      );
    }

    // Validate balance again
    await utils.checkNormalBalance(
      instance,
      address,
      new BN(value).mul(new BN(2))
    );

    // Deposit 9 CPC again, this tx should be success.
    await instance.deposit({ from: address, value: utils.cpc(9) });
    await utils.checkNormalBalance(
      instance,
      address,
      new BN(value).mul(new BN(2)).add(new BN(utils.cpc(9)))
    );

    // Validate workers
    await utils.checkWorkerBalance(instance, workers[0], utils.cpc(10));
    await utils.checkWorkerBalance(instance, workers[1], utils.cpc(10));
    await utils.checkWorkerBalance(instance, workers[2], utils.cpc(9));

    // Deposit one more CPC
    await instance.deposit({ from: address, value: utils.cpc(1) });
    await utils.checkWorkerBalance(instance, workers[2], utils.cpc(10));

    try {
      await instance.deposit({ from: address, value: utils.cpc(1) });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("User's balance greater than the upper limit")
      );
    }
  });

  it("Withdraw 10 CPC", async () => {
    const instance = await Staking.deployed();
    const address = accounts[5];
    // Withdraw more than 30 CPC (The balance of the user)
    try {
      await instance.withdraw(utils.cpc(30.1), { from: address });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("Amount greater than deposited money")
      );
    }
    // Withdraw more than 20 CPC (upper limit per tx)
    await instance.setWithdrawnUpperLimit(utils.cpc(20));
    try {
      await instance.withdraw(utils.cpc(20.1), { from: address });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("Amount greater than the upper limit")
      );
    }
    try {
      await instance.withdraw(utils.cpc(0.1), { from: address });
      assert.fail();
    } catch (error) {
      assert.ok(
        error
          .toString()
          .includes("Amount need to greater than or equal to 1 CPC")
      );
    }

    await utils.checkNormalBalance(instance, address, utils.cpc(30));

    // Withdraw 10 CPC
    let tx = await instance.withdraw(utils.cpc(10), { from: address });

    await utils.checkEvent(tx, utils.EVENT_WITHDRAW, async (ev) => {
      let selected = ev.selectedWorker;
      assert.equal(
        tx.receipt.blockNumber,
        ev.blockHeight.toString(),
        "The lastBlock is error"
      );
      // The selected worker should be worker1
      utils.checkWorkerAddress(selected, workers[0]);
      await utils.checkWorkerBalance(instance, selected, utils.cpc(10));
    });

    // Validate the balance in the contract
    await utils.checkNormalBalance(instance, address, utils.cpc(20));
    await utils.checkWithdrawnBalance(instance, address, utils.cpc(10));
    await utils.checkAppealedBalance(instance, address, utils.cpc(0));
    await utils.checkTotalBalance(instance, utils.cpc(20));

    // Withdraw again, failed
    try {
      await instance.withdraw(utils.cpc(10), { from: address });
      assert.fail();
    } catch (error) {
      assert.ok(
        error.toString().includes("You have an unhandled withdrawn transaction")
      );
    }
  });
  it("check total balance", async ()=> {
    const instance = await Staking.deployed();
    assert.equal((await instance.total_balance()).toString(), (await instance.totalSupply()).toString())
  })
});
