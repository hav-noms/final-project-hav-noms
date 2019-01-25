pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Owner functions to set the Associated Contract of the state that we store. 
 * @notice  This contract is used side by side with external state contract
 * It provides an easy way to upgrade contract logic while
 * maintaining all user balances. This is designed
 * to make the changeover as easy as possible, since mappings
 * are not so cheap or straightforward to migrate.

 * The first deployed contract would create this state contract,
 * using it as its store of balances.
 * When a new contract is deployed, it links to the existing
 * state contract, whose owner would then change its associated
 * contract to the new one.
 */
contract State is Ownable {

    // the address of the contract that can modify variables
    // this can only be changed by the owner of this contract
    address public associatedContract;

    constructor(address _associatedContract)
        public
    {
        associatedContract = _associatedContract;
        emit AssociatedContractUpdated(_associatedContract);
    }

    //-----------------------------------------------------------------
    // Setters
    //-----------------------------------------------------------------

    /**
     * @notice Change the associated contract to a new address
     * @param _associatedContract the address of the Contract that owns this state
     */
    function setAssociatedContract(address _associatedContract)
        external
        onlyOwner
    {
        associatedContract = _associatedContract;
        emit AssociatedContractUpdated(_associatedContract);
    }

    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------

    modifier onlyAssociatedContract
    {
        require(msg.sender == associatedContract, "Only the associated contract can perform this action");
        _;
    }

    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------

    event AssociatedContractUpdated(address associatedContract);
}