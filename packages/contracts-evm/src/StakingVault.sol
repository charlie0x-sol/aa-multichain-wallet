// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title StakingVault
 * @notice ETH/ERC-20 staking with AA compatibility
 */
contract StakingVault is ReentrancyGuard {
    error TransferFailed();
    error InsufficientBalance();
    error InvalidAmount();

    event Staked(address indexed user, address indexed token, uint256 amount);
    event Unstaked(address indexed user, address indexed token, uint256 amount);

    mapping(address => mapping(address => uint256)) public balances;

    /// @notice Stake ETH into the vault
    function stakeETH() external payable nonReentrant {
        if (msg.value == 0) revert InvalidAmount();
        balances[msg.sender][address(0)] += msg.value;
        emit Staked(msg.sender, address(0), msg.value);
    }

    /// @notice Unstake ETH from the vault
    function unstakeETH(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (balances[msg.sender][address(0)] < amount) revert InsufficientBalance();

        balances[msg.sender][address(0)] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Unstaked(msg.sender, address(0), amount);
    }

    /// @notice Stake ERC20 tokens into the vault
    function stakeERC20(address token, uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][token] += amount;

        emit Staked(msg.sender, token, amount);
    }

    /// @notice Unstake ERC20 tokens from the vault
    function unstakeERC20(address token, uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (balances[msg.sender][token] < amount) revert InsufficientBalance();

        balances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);

        emit Unstaked(msg.sender, token, amount);
    }

    receive() external payable {}
}
