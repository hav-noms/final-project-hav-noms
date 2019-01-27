pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
/**
 * @title An ERC20 Token
 * @notice Inherits the openzeppelin ERC20.sol
 * @dev This is only used in the local ganache for unit tests and local testing
 * on a TESTNET you can use any ERC20 deployed on those networks
 * @author https://github.com/hav-noms/
 */
contract ShartCoin is ERC20, ERC20Detailed {
    address public owner;

    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 100000000000 * (10 ** uint256(DECIMALS));

 /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor () public ERC20Detailed("ShartCoin", "SHT", DECIMALS) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

}