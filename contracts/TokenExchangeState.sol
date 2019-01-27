pragma solidity ^0.5.0;

import "./EternalStorage.sol";

contract TokenExchangeState is EternalStorage {

    /**
     * @dev Constructor
     * @param _associatedContract The calling contract for whoms state we hold
     * @author https://github.com/hav-noms/
     */
    constructor(address _associatedContract)
        State(_associatedContract)
        public
    {
        
    }
}