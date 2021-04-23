const Staking = artifacts.require("Staking");
const Web3 = require('web3');

contract("Staking", (accounts) => {
  it('Set withdraw_fee_numerator to 0', async () => {
    const instance = await Staking.deployed();
    await instance.setWithdrawFee(0)
    assert.equal(
      await instance.withdraw_fee_numerator(),
      0,
      "The withdraw_fee_numerator should be zero"
    );
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
});
