const Staking = artifacts.require("Staking");
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

  it('Set withdraw_fee_numerator to 0', async () => {
    const instance = await Staking.deployed();
    await instance.setWithdrawFee(0)
    assert.equal(
      await instance.withdraw_fee_numerator(),
      0,
      "The withdraw_fee_numerator should be zero"
    );
    await testOnlyOwner(instance.setWithdrawFee, [0])
  });
  it('Set withdraw_fee_numerator to 50', async () => {
    const instance = await Staking.deployed();
    await instance.setWithdrawFee(50)
    assert.equal(
      await instance.withdraw_fee_numerator(),
      50,
      "The withdraw_fee_numerator should be 50"
    );
  });
  it('Set withdraw_fee_numerator to 100', async () => {
    const instance = await Staking.deployed();
    await instance.setWithdrawFee(100)
    assert.equal(
      await instance.withdraw_fee_numerator(),
      100,
      "The withdraw_fee_numerator should be 100"
    );
  });
  it('Set withdraw_fee_numerator to 10000', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setWithdrawFee(10000)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The fee should greater than 0 and less than 100 (0 - 1%)"))
    }
  });
  it('Set withdraw_fee_numerator to 10001', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setWithdrawFee(10001)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The fee should greater than 0 and less than 100 (0 - 1%)"))
    }
  });
  it('Set withdraw_fee_numerator to 101', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setWithdrawFee(101)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The fee should greater than 0 and less than 100 (0 - 1%)"))
    }
  });
  it('Set worker_balance_limit to 0', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setWorkerBalanceLimit(0)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The upper limit should greater than 1 CPC"))
    }
    await testOnlyOwner(instance.setWorkerBalanceLimit, [0])
  });
  it('Set worker_balance_limit to 0.1 CPC', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setWorkerBalanceLimit(Web3.utils.toWei('0.1', 'ether'))
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The upper limit should greater than 1 CPC"))
    }
  });
  it('Set worker_balance_limit to 1 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1', 'ether')
    await instance.setWorkerBalanceLimit(limit)
    assert.equal(
      await instance.worker_balance_limit(),
      limit,
      "The worker_balance_limit should be 1 CPC"
    );
  });
  it('Set worker_balance_limit to 1200000 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1200000', 'ether')
    await instance.setWorkerBalanceLimit(limit)
    assert.equal(
      await instance.worker_balance_limit(),
      limit,
      "The worker_balance_limit should be 1200000 CPC"
    );
  });
  it('Set user_balance_limit to 0', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setUserBalanceLimit(0)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The upper limit should greater than 1 CPC"))
    }
    await testOnlyOwner(instance.setUserBalanceLimit, [0])
  });
  it('Set user_balance_limit to 0.1 CPC', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setUserBalanceLimit(Web3.utils.toWei('0.1', 'ether'))
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The upper limit should greater than 1 CPC"))
    }
  });
  it('Set user_balance_limit to 1 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1', 'ether')
    await instance.setUserBalanceLimit(limit)
    assert.equal(
      await instance.user_balance_limit(),
      limit,
      "The user_balance_limit should be 1 CPC"
    );
  });
  it('Set user_balance_limit to 100000 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('100000', 'ether')
    await instance.setUserBalanceLimit(limit)
    assert.equal(
      await instance.user_balance_limit(),
      limit,
      "The user_balance_limit should be 100000 CPC"
    );
  });
  it('Set tx_upper_limit to 0', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setTxUpperLimit(0)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The upper limit should greater than 1 CPC"))
    }
    await testOnlyOwner(instance.setTxUpperLimit, [0])
  });
  it('Set tx_upper_limit to 0.1 CPC', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setTxUpperLimit(Web3.utils.toWei('0.1', 'ether'))
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The upper limit should greater than 1 CPC"))
    }
  });
  it('Set tx_upper_limit to 1 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1', 'ether')
    await instance.setTxUpperLimit(limit)
    assert.equal(
      await instance.tx_upper_limit(),
      limit,
      "The tx_upper_limit should be 1 CPC"
    );
  });
  it('Set tx_upper_limit to 1200000 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1200000', 'ether')
    await instance.setTxUpperLimit(limit)
    assert.equal(
      await instance.tx_upper_limit(),
      limit,
      "The tx_upper_limit should be 1200000 CPC"
    );
  });
  it('Set tx_lower_limit to 0', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setTxLowerLimit(0)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The lower limit should greater than 1 CPC"))
    }
    await testOnlyOwner(instance.setTxLowerLimit, [0])
  });
  it('Set tx_lower_limit to 0.1 CPC', async () => {
    const instance = await Staking.deployed();
    try {
      await instance.setTxLowerLimit(Web3.utils.toWei('0.1', 'ether'))
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("The lower limit should greater than 1 CPC"))
    }
  });
  it('Set tx_lower_limit to 1 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1', 'ether')
    await instance.setTxLowerLimit(limit)
    assert.equal(
      await instance.tx_lower_limit(),
      limit,
      "The tx_lower_limit should be 1 CPC"
    );
  });
  it('Set tx_lower_limit to 1200000 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1200000', 'ether')
    await instance.setTxLowerLimit(limit)
    assert.equal(
      await instance.tx_lower_limit(),
      limit,
      "The tx_lower_limit should be 1200000 CPC"
    );
  });
  it('Set withdraw_upper_limit to 1200001 CPC', async () => {
    const instance = await Staking.deployed();
    let limit = Web3.utils.toWei('1200001', 'ether')
    await instance.setWithdrawnUpperLimit(limit)
    assert.equal(
      await instance.withdraw_upper_limit(),
      limit,
      "The withdraw_upper_limit should be 1200001 CPC"
    );
  });
  it("enable and disbale", async ()=> {
    const instance = await Staking.deployed();
    assert.equal(await instance.enabled(), true)
    await instance.disableContract()
    assert.equal(await instance.enabled(), false)
    await instance.enableContract()
    assert.equal(await instance.enabled(), true)
  })
  it("refund to owner", async ()=> {
    const instance = await Staking.deployed();
    await instance.refundToOwner()
  })
  it("change owner", async ()=> {
    const instance = await Staking.deployed();
    // change first
    await instance.changeOwner(accounts[1])
    // Account[0] can't change the owner now
    try {
      await instance.changeOwner(accounts[1])
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("You're not the owner of this contract"))
    }
    // Use account[1] change the owner to accounts[2]
    await instance.changeOwner(accounts[2], {from: accounts[1]})
    try {
      await instance.changeOwner(accounts[3], {from: accounts[1]})
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("You're not the owner of this contract"))
    }
    // change back
    await instance.changeOwner(accounts[0], {from: accounts[2]})
  })
  it("test allowContract", async () => {
    const instance = await Staking.deployed();
    const test_contract = instance.address;
    
    // change the owner to contract
    assert.equal(
      await instance.isContract(test_contract),
      true,
      "The address should be contract"
    )
    try {
      await instance.changeOwner(test_contract)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("Don't allow contract be the owner"))
    }

    // update the parameter
    await instance.setAllowOwnerBeContract(true)
    // you can set the owner to a contract
    await instance.changeOwner(test_contract)
    // update the parameter
    try {
      await instance.setAllowOwnerBeContract(false)
      assert.fail()
    } catch(error) {
      assert.ok(error.toString().includes("You're not the owner of this contract"))
    }
  })
});
