// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./SimpleSmartAccount.sol";

contract SimpleSmartAccountFactory {
    SimpleSmartAccount public immutable accountImplementation;

    event AccountCreated(address indexed account, address indexed owner);

    constructor(address _entryPoint) {
        accountImplementation = new SimpleSmartAccount(_entryPoint);
    }

    function createAccount(address owner, uint256 salt) external returns (address ret) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }

        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(
                address(accountImplementation),
                abi.encodeWithSelector(SimpleSmartAccount.initialize.selector, owner)
            )
        );

        ret = Create2.deploy(0, bytes32(salt), bytecode);
        emit AccountCreated(ret, owner);
    }

    function getAddress(address owner, uint256 salt) public view returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(
                address(accountImplementation),
                abi.encodeWithSelector(SimpleSmartAccount.initialize.selector, owner)
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                bytes32(salt),
                keccak256(bytecode)
            )
        );

        return address(uint160(uint256(hash)));
    }
}
