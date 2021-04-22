const Staking = artifacts.require("Staking");

contract("Staking", (accounts) => {
  it('', async () => {
    const instance = await Staking.deployed();
    assert.equal(
      await instance.total_balance(),
      0,
      "The total_balance should be zero"
    );
  });
});
