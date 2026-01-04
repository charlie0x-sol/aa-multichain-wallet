// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SimpleSmartAccount.sol";

contract SimpleSmartAccountTest is Test {
    SimpleSmartAccount public account;
    address public entryPoint = address(0x1);
    address public owner = address(0x2);
    address public nonOwner = address(0x3);

    function setUp() public {
        account = new SimpleSmartAccount(entryPoint);
        account.initialize(owner);
    }

    function test_Initialization() public {
        assertEq(account.owner(), owner);
        assertEq(account.entryPoint(), entryPoint);
    }

    function test_RevertIf_AlreadyInitialized() public {
        vm.expectRevert("Already initialized");
        account.initialize(nonOwner);
    }

    function test_Execute_Success() public {
        address dest = address(0x123);
        uint256 value = 1 ether;
        bytes memory data = "";
        
        vm.deal(address(account), 2 ether);
        
        vm.prank(entryPoint);
        account.execute(dest, value, data);
        
        assertEq(dest.balance, value);
    }

    function test_RevertIf_ExecuteNotEntryPoint() public {
        vm.prank(nonOwner);
        vm.expectRevert(SimpleSmartAccount.NotEntryPoint.selector);
        account.execute(address(0x123), 0, "");
    }

    function test_ValidateUserOp_CorrectSignature() public {
        uint256 ownerPrivateKey = 0x1234;
        address signingOwner = vm.addr(ownerPrivateKey);
        
        // Setup new account with known private key owner
        SimpleSmartAccount newAccount = new SimpleSmartAccount(entryPoint);
        newAccount.initialize(signingOwner);

        SimpleSmartAccount.UserOperation memory userOp;
        userOp.sender = address(newAccount);
        bytes32 userOpHash = keccak256("test hash");
        
        // Sign the hash
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, MessageHashUtils.toEthSignedMessageHash(userOpHash));
        userOp.signature = abi.encodePacked(r, s, v);

        vm.prank(entryPoint);
        uint256 validationData = newAccount.validateUserOp(userOp, userOpHash, 0);
        
        assertEq(validationData, 0); // Success
    }

    function test_ValidateUserOp_WrongSignature() public {
        SimpleSmartAccount.UserOperation memory userOp;
        userOp.sender = address(account);
        bytes32 userOpHash = keccak256("test hash");
        userOp.signature = abi.encodePacked(bytes32(0), bytes32(0), uint8(27));

        vm.prank(entryPoint);
        uint256 validationData = account.validateUserOp(userOp, userOpHash, 0);
        
        assertEq(validationData, 1); // SIG_VALIDATION_FAILED
    }
}
