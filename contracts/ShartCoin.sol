pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ShartCoin is StandardToken {
    address public owner;

    string public name = 'ShartCoin';
    string public symbol = 'SHT';
    uint8 public decimals = 2;
    uint public INITIAL_SUPPLY = 100000000000;

    constructor() public {
      totalSupply_ = INITIAL_SUPPLY;
      balances[owner] = INITIAL_SUPPLY;
    }

}