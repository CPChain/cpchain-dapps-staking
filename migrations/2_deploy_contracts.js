var Greeter = artifacts.require("./Greeter.sol");

module.exports = function(deployer) {
     deployer.deploy(Greeter, "Hello, World!"); //"参数在第二个变量携带"
};
