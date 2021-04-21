const Greeter = artifacts.require("Greeter");

contract("Greeter", (accounts) => {
  it('should print "Hello, World!"', async () => {
    const greeterInstance = await Greeter.deployed();
    assert.equal(
      await greeterInstance.greet(),
      "Hello, World!",
      "The first greet was wrong"
    );
  });
});
