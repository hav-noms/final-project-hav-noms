pragma solidity 0.4.25;

/**
 * @title A contract with an owner.
 * @notice Contract ownership can be transferred by first nominating the new owner,
 * who must then accept the ownership, which prevents accidental incorrect ownership transfers.
 *  
 * An Owned contract, to be inherited by other contracts.
 * Requires its owner to be explicitly set in the constructor.
 * Provides an onlyOwner access modifier.
 * 
 * To change owner, the current owner must nominate the next owner,
 * who then has to accept the nomination. The nomination can be
 * cancelled before it is accepted by the new owner by having the
 * previous owner change the nomination (setting it to 0x).

 */
contract Owned {
    address public owner;
    address public nominatedOwner;

    /**
     * @dev Owned Constructor
     */
    constructor(address _owner)
        public
    {
        require(_owner != address(0), "Owner address cannot be 0");
        owner = _owner;
        emit OwnerChanged(address(0), _owner);
    }

    /**
     * @notice Nominate a new owner of this contract.
     * @dev Only the current owner may nominate a new owner.
     */
    function nominateNewOwner(address _owner)
        external
        onlyOwner
    {
        nominatedOwner = _owner;
        emit OwnerNominated(_owner);
    }

    /**
     * @notice Accept the nomination to be owner.
     */
    function acceptOwnership()
        external
    {
        require(msg.sender == nominatedOwner, "You must be nominated before you can accept ownership");
        owner = nominatedOwner;
        nominatedOwner = address(0);
        emit OwnerChanged(owner, nominatedOwner);
    }

    /**
     * @notice Only the Ower may call this function decorated with this modifer.
     */
    modifier onlyOwner
    {
        require(msg.sender == owner, "Only the contract owner may perform this action");
        _;
    }

    /**
     * Events
     */
    event OwnerNominated(address newOwner);
    event OwnerChanged(address oldOwner, address newOwner);
}