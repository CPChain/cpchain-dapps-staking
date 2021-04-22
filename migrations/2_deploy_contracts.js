var Staking = artifacts.require("./Staking.sol");

module.exports = function(deployer) {
     deployer.deploy(Staking); //"参数在第二个变量携带"
};
