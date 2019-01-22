pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
//import "./Ownable.sol";
import "./Proxyable.sol";

/**
 * @title Proxy contract for upgradable contracts
 * @notice 
 *
 * A proxy contract that, if it does not recognise the function
 * being called on it, passes all value and call data to an
 * underlying target contract.
 *
 * Usein CALL rather than DELEGATECALL puts the context into the target 
 * contract allowing it to store its data how it wants rather than in the proxy
 *
 * Therefore, any contract the proxy wraps must
 * implement the Proxyable interface, in order that it can pass msg.sender
 * into the underlying contract as the state parameter, messageSender.
 *
 * This proxy is meant to be generic and have zero knowledge of its 
 * underlying target contract ABI and the data it stores. 
 *
 * Select events from the target contracts are emited from this proxy
 * to allow DApp compatability with events being emited from this publicy 
 * accessible address.
 */
contract Proxy is Ownable {

    Proxyable public target;

    /**
     * @dev Constructor
     */
    constructor()
        public
    {}

    /**
     * @dev Set the target contract address
     * @param _target The target contract address that sits behind this proxy
     */
    function setTarget(Proxyable _target)
        external
        onlyOwner
    {
        target = _target;
        emit TargetUpdated(_target);
    }

    /**
    * @dev Only the proxyable target contract may call this function to emit an event
    * @param callData the function hash and the arguments 
    * @param numTopics the number of topics to log
    */
    function _emit(bytes calldata callData, uint numTopics, bytes32 topic1, bytes32 topic2, bytes32 topic3, bytes32 topic4)
        external
        onlyTarget
    {
        uint size = callData.length;
        bytes memory _callData = callData;

        assembly {
            /* The first 32 bytes of callData contain its length (as specified by the abi). 
             * Length is assumed to be a uint256 and therefore maximum of 32 bytes
             * in length. It is also leftpadded to be a multiple of 32 bytes.
             * This means moving call_data across 32 bytes guarantees we correctly access
             * the data itself. */
            switch numTopics
            case 0 {
                log0(add(_callData, 32), size)
            } 
            case 1 {
                log1(add(_callData, 32), size, topic1)
            }
            case 2 {
                log2(add(_callData, 32), size, topic1, topic2)
            }
            case 3 {
                log3(add(_callData, 32), size, topic1, topic2, topic3)
            }
            case 4 {
                log4(add(_callData, 32), size, topic1, topic2, topic3, topic4)
            }
        }
    }

    /**
    * @dev Fallback function using assembly to forward the call and call data to the 
    * proxyable target contract 
    */
    function()
        external
        payable
    {
        // Must send the messageSender explicitly since we are using CALL rather than DELEGATECALL.
        target.setMessageSender(msg.sender);

        //Forward all call data to the target
        assembly {
            let free_ptr := mload(0x40)
            calldatacopy(free_ptr, 0, calldatasize)

            /* We must explicitly forward ether to the underlying contract as well. */
            let result := call(gas, sload(target_slot), callvalue, free_ptr, calldatasize, 0, 0)
            returndatacopy(free_ptr, 0, returndatasize)

            if iszero(result) { revert(free_ptr, returndatasize) }
            return(free_ptr, returndatasize)
        }
    }

    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------

    /**
    * @dev Only the proxyable target contract may call this function
    * @notice The msg.sender or the caller of the function
    */
    modifier onlyTarget {
        require(Proxyable(msg.sender) == target, "Must be proxy target");
        _;
    }

    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------

    event TargetUpdated(Proxyable newTarget);
}
