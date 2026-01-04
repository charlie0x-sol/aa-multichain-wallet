// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/StakingVault.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock", "MCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract StakingVaultTest is Test {
    StakingVault public vault;
    MockToken public token;
    address public user = address(0x1);

    function setUp() public {
        vault = new StakingVault();
        token = new MockToken();
        vm.deal(user, 10 ether);
        token.transfer(user, 1000 * 10**18);
    }

    function test_StakeETH() public {
        vm.startPrank(user);
        vault.stakeETH{value: 5 ether}();
        vm.stopPrank();

        assertEq(vault.balances(user, address(0)), 5 ether);
        assertEq(address(vault).balance, 5 ether);
    }

    function test_UnstakeETH() public {
        vm.startPrank(user);
        vault.stakeETH{value: 5 ether}();
        vault.unstakeETH(2 ether);
        vm.stopPrank();

        assertEq(vault.balances(user, address(0)), 3 ether);
        assertEq(user.balance, 7 ether);
    }

    function testFuzz_StakeETH(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 10 ether);
        vm.startPrank(user);
        vault.stakeETH{value: amount}();
        vm.stopPrank();
        assertEq(vault.balances(user, address(0)), amount);
    }

    function test_StakeERC20() public {
        uint256 amount = 100 * 10**18;
        vm.startPrank(user);
        token.approve(address(vault), amount);
        vault.stakeERC20(address(token), amount);
        vm.stopPrank();

        assertEq(vault.balances(user, address(token)), amount);
        assertEq(token.balanceOf(address(vault)), amount);
    }

    function test_RevertIf_UnstakeMoreThanBalance() public {
        vm.startPrank(user);
        vault.stakeETH{value: 1 ether}();
        vm.expectRevert(StakingVault.InsufficientBalance.selector);
        vault.unstakeETH(2 ether);
        vm.stopPrank();
    }
}
