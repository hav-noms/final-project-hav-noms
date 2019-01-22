pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
//import "./SafeDecimalMath.sol";
import "./State.sol";

contract TokenExchangeState is State {

    /**
     * @dev Constructor
     * @param _associatedContract The calling contract for whoms state we hold
     */
    constructor(address _associatedContract)
        State(_associatedContract)
        public
    {
        
    }
}