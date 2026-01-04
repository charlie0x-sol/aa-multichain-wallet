// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SimpleSmartAccountFactory.sol";
import "../src/StakingVault.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // Sepolia EntryPoint v0.6 address (standard)
        address entryPoint = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Staking Vault
        StakingVault vault = new StakingVault();
        console.log("StakingVault deployed at:", address(vault));

        // 2. Deploy Account Factory
        SimpleSmartAccountFactory factory = new SimpleSmartAccountFactory(entryPoint);
        console.log("SimpleSmartAccountFactory deployed at:", address(factory));
        console.log("Account Implementation at:", address(factory.accountImplementation()));

        vm.stopBroadcast();
    }
}
