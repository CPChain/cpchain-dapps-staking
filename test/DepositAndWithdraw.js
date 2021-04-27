const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions");

var BN = web3.utils.BN;

contract("Staking", (accounts) => {
  const workers = [accounts[1], accounts[2], accounts[3]];
  async function init(instance) {
    // Add a worker
    for (let i = 0; i < workers.length; i++) {
      const worker = workers[i];
      await instance.addWorker(worker);
      assert.equal(
        await instance.isWorker(worker),
        true,
        "This address should be worker"
      );
    }
    assert.equal(
      await instance.workersCnt(),
      workers.length,
      "Count should be 1"
    );
  }
  async function get_workers_balance() {
    let data = {};
    for (let i = 0; i < workers.length; i++) {
      data[workers[i]] = await web3.eth.getBalance(workers[i]);
    }
    return data;
  }
  it("Deposit 10 CPC when not have any workers", async () => {
    const instance = await Staking.deployed();
    const address = accounts[1];
    let balance = await web3.eth.getBalance(address);
    console.log("Balance of ", address, "is", balance);
    try {
      await instance.deposit({
        from: address,
        value: web3.utils.toWei("10", "ether"),
      });
      assert.fail();
    } catch (error) {
      assert.ok(error.toString().includes("There are no workers now"));
    }
  });
  it("Withdraw without any workers", async ()=> {
    const instance = await Staking.deployed();
    try {
      await instance.withdraw(web3.utils.toWei("10", "ether"))
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("There are no workers now"))
    }
  })
  it("Deposit 10 CPC after added three workers", async () => {
    const instance = await Staking.deployed();
    await init(instance);
    let workers_before_balance = await get_workers_balance();
    const address = accounts[5];
    let balance_before = await web3.eth.getBalance(address);
    let value = web3.utils.toWei("10", "ether");
    let tx = await instance.deposit({ from: address, value: value });
    let balance_after = await web3.eth.getBalance(address);
    // check event
    let selected = null;
    truffleAssert.eventEmitted(tx, "Deposit", (ev) => {
      selected = ev.selectedWorker;
      return ev.value == value;
    });
    assert.equal(selected, workers[0], "The selected worker should be the worker1")
    let selectd_balance = await web3.eth.getBalance(selected);
    // get gasPrice
    let tx_origin = await web3.eth.getTransaction(tx.tx);
    let gasPrice = tx_origin.gasPrice;

    // gasUsed
    let gasUsed = new BN(tx.receipt.gasUsed).mul(new BN(gasPrice)).toString();
    let balance_after_with_fee = new BN(balance_after)
      .add(new BN(gasUsed))
      .toString();

    // The worker should add 10 CPC
    assert.equal(
      new BN(selectd_balance).toString(),
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
    assert.equal((await instance.balanceOf(address)).toString(), value, "The balance of user in the contract is error")

    // validate the balance of the worker
    assert.equal((await instance.workerBalanceOf(selected)).toString(), value, "The balance of worker in thr contract is error")

    // Deposit again with 0 CPC
    try {
      await instance.deposit({ from: address, value: 0 })
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("Amount less than the lower limit"));
    }

    // Deposit 10 CPC again
    tx = await instance.deposit({ from: address, value: value})
    truffleAssert.eventEmitted(tx, "Deposit", (ev) => {
      selected = ev.selectedWorker;
      return ev.value == value;
    });
    assert.equal(selected, workers[1], "The selected worker should be the worker2")
    selectd_balance = await web3.eth.getBalance(selected);
    // The worker should add 10 CPC
    assert.equal(
      new BN(selectd_balance).toString(),
      new BN(workers_before_balance[selected]).add(new BN(value)).toString(),
      "The worker should add 10 CPC"
    );
    // validate the balance of the worker
    assert.equal((await instance.workerBalanceOf(selected)).toString(), value, "The balance of worker in thr contract is error")

    // validate the balance of user in the contract
    assert.equal((await instance.balanceOf(address)).toString(), new BN(value).mul(new BN(2)).toString(), "The balance of user in the contract is error")

    // Validate the total balance of all user
    assert.equal((await instance.total_balance()).toString(), new BN(value).mul(new BN(2)).toString(), "Total balance is error")

    // Modify the parameter of up limit per tx to 20 CPC
    await instance.setTxUpperLimit(web3.utils.toWei('20', 'ether'))

    // Deposit 21 CPC to the contract
    try {
      await instance.deposit({ from: address, value: web3.utils.toWei('21', 'ether') })
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("Amount greater than the upper limit"));
    }

    // Deposit 0.1 CPC to the contract
    try {
      await instance.deposit({ from: address, value: web3.utils.toWei('0.1', 'ether') })
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("Amount less than the lower limit"));
    }

    // Modify the upper limit for the user's balance to 30 CPC
    await instance.setUserBalanceLimit(web3.utils.toWei('30', 'ether'))

    // Deposit 11 CPC again, but this time will failed
    try {
      await instance.deposit({ from: address, value: web3.utils.toWei('11', 'ether') })
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("User's balance greater than the upper limit"))
    }

    // Validate balance again
    let balance_expected = new BN(value).mul(new BN(2)).toString()
    assert.equal((await instance.balanceOf(address)).toString(), balance_expected, "The balance of user in the contract is error")

    // Deposit 9 CPC again, this tx should be success.
    await instance.deposit({ from: address, value: web3.utils.toWei('9', 'ether') })
    balance_expected = new BN(balance_expected).add(new BN(web3.utils.toWei('9', 'ether')))
    assert.equal((await instance.balanceOf(address)).toString(), balance_expected, "The balance of user in the contract is error")

    // Validate workers
    assert.equal((await instance.workerBalanceOf(workers[0])).toString(), web3.utils.toWei('10', 'ether'), "The balance of worker in thr contract is error")
    assert.equal((await instance.workerBalanceOf(workers[1])).toString(), web3.utils.toWei('10', 'ether'), "The balance of worker in thr contract is error")
    assert.equal((await instance.workerBalanceOf(workers[2])).toString(), web3.utils.toWei('9', 'ether'), "The balance of worker in thr contract is error")

    // Deposit one more CPC
    await instance.deposit({ from: address, value: web3.utils.toWei('1', 'ether') })
    assert.equal((await instance.workerBalanceOf(workers[2])).toString(), web3.utils.toWei('10', 'ether'), "The balance of worker in thr contract is error")

    try {
      await instance.deposit({ from: address, value: web3.utils.toWei('1', 'ether') })
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("User's balance greater than the upper limit"))
    }
    console.log(await web3.utils.fromWei(new BN(await web3.eth.getBalance(address))))
  });

  it("Withdraw 10 CPC", async ()=> {
    const instance = await Staking.deployed();
    const address = accounts[5];
    // Withdraw more than 30 CPC (The balance of the user)
    try {
      await instance.withdraw(web3.utils.toWei('30.1', 'ether'), {from: address})
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("Amount greater than deposited money"))
    }
    // Withdraw more than 20 CPC (upper limit per tx)
    await instance.setWithdrawnUpperLimit(web3.utils.toWei('20', 'ether'))
    try {
      await instance.withdraw(web3.utils.toWei('20.1', 'ether'), {from: address})
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("Amount greater than the upper limit"))
    }
    try {
      await instance.withdraw(web3.utils.toWei('0.1', 'ether'), {from: address})
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("Amount need to greater than or equal to 1 CPC"))
    }

    // Withdraw 10 CPC
    let tx = await instance.withdraw(web3.utils.toWei('10', 'ether'), {from: address})

    let selected = null
    let lastBlock = null

    // Test if the event have been emited
    truffleAssert.eventEmitted(tx, "Withdraw", (ev) => {
      selected = ev.selectedWorker;
      lastBlock = ev.blockHeight
      return ev.value == web3.utils.toWei('10', 'ether');
    });
    assert.equal(tx.receipt.blockNumber, lastBlock.toString(), "The lastBlock is error")

    // The selected worker should be worker1
    assert.equal(selected, workers[0], "The selected worker is error")
    assert.equal((await instance.workerBalanceOf(selected)).toString(), web3.utils.toWei('10', 'ether'), "The balance of worker in thr contract is error")

    // Validate the balance in the contract
    assert.equal((await instance.balanceOf(address)).toString(), web3.utils.toWei('20', 'ether'), "The balance of user in the contract is error")
    assert.equal((await instance.getWithdrawnBalance(address)).toString(), web3.utils.toWei('10', 'ether'), "The withdrawnbBalance of user in the contract is error")
    assert.equal((await instance.getAppealedBalance(address)).toString(), web3.utils.toWei('0', 'ether'), "The appealedBalance of user in the contract is error")
    assert.equal((await instance.total_balance()).toString(), web3.utils.toWei('20', 'ether'), "Total balance is error")


    // Withdraw again, failed
    try {
      await instance.withdraw(web3.utils.toWei('10', 'ether'), {from: address})
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("You have a unhandled withdrawn transaction"))
    }
  })

});
