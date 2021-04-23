const Staking = artifacts.require("Staking");
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');

contract("Staking", (accounts) => {
  async function testOnlyOwner(func, args) {
    try {
      args.push({"from": accounts[1]})
      await func.apply(this, args)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("You're not the owner of this contract"))
    }
  }
  it('Add and remove one worker', async () => {
    const instance = await Staking.deployed();
    const worker1 = accounts[1]
    // Add a worker
    let tx = await instance.addWorker(worker1)
    assert.equal(
      await instance.isWorker(worker1),
      true,
      "This address should be worker"
    );
    assert.equal(
      await instance.workersCnt(),
      1,
      "Count should be 1"
    );
    await testOnlyOwner(instance.addWorker, [worker1])
    // check event
    truffleAssert.eventEmitted(tx, "AddWorker",(ev) => {
      return ev.account == worker1;
    });
    // check balance
    assert.equal(
      await instance.workerBalanceOf(worker1),
      0,
      "Worker balance should be 0"
    )
    // Add a existed worker
    try {
      await instance.addWorker(worker1)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The worker has already existed!"))
    }
    // Remove this worker
    tx = await instance.removeWorker(worker1)
    assert.equal(
      await instance.isWorker(worker1),
      false,
      "This address is not a worker now"
    );
    assert.equal(
      await instance.workersCnt(),
      0,
      "Count should be 0 now"
    );
    // check event
    truffleAssert.eventEmitted(tx, "RemoveWorker",(ev) => {
      return ev.account == worker1;
    });
    await testOnlyOwner(instance.removeWorker, [worker1])
    // Remove an unexisted worker
    try {
      await instance.removeWorker(worker1)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The worker not existed!"))
    }
  });
  it('Add 10 workers', async () => {
    const instance = await Staking.deployed();
    // Add 10 workers
    let cnt = 0;
    for (; cnt < accounts.length; ) {
      const address = accounts[cnt]
      let tx = await instance.addWorker(address)
      cnt += 1
      assert.equal(
        await instance.isWorker(address),
        true,
        "This address should be a worker"
      );
      assert.equal(
        await instance.workersCnt(),
        cnt,
        "Count should be 0 now"
      );
      // check event
      truffleAssert.eventEmitted(tx, "AddWorker",(ev) => {
        return ev.account == address;
      });
    }
    assert.equal(cnt, 10, "Cnt should be 10")
    let split = 5;
    for (let i = split; i < accounts.length; i++) {
      let address = accounts[i];
      // remove
      let tx = await instance.removeWorker(address);
      assert.equal(
        await instance.isWorker(address),
        false,
        "This address should not be a worker"
      );
      assert.equal(
        await instance.workersCnt(),
        cnt - i + split - 1,
        `Count should be ${cnt - i + split - 1} now`
      );
      // check event
      truffleAssert.eventEmitted(tx, "RemoveWorker",(ev) => {
        return ev.account == address;
      });
    }
    assert.equal(
      await instance.workersCnt(),
      split,
      `Count should be ${split} now`
    );
    for(let i = 0; i < split; i++) {
      let address = accounts[i];
      // remove
      assert.equal(
        await instance.isWorker(address),
        true,
        "This address should be a worker"
      );
      // check balance
      assert.equal(
        await instance.workerBalanceOf(address),
        0,
        "Worker balance should be 0"
      )
    }
  })
})