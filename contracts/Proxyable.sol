pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Proxy.sol";

/**
 * @title Proxyable Contract sits behind a Proxy
 * @notice A proxyable contract that works hand in hand with the Proxy contract
 * to allow for anyone to interact with the underlying contract both 
 * directly and through the proxy.
 * This contract should be treated like an abstract contract. Simply inherit 
 * Proxyable on the target contract.
 */
contract Proxyable is Ownable {
    /* The proxy this contract exists behind. */
    Proxy public proxy;

    /* The caller of the proxy, passed through to this contract.
     * Note that every function using this member must apply the onlyProxy or
     * optionalProxy modifiers, otherwise their invocations can use stale values. */ 
    address payable messageSender; 

    /**
     * @dev Constructor
     * @param _proxy The proxy this contract exists behind
     */
    constructor(address payable _proxy)
        Ownable()
        public
    {
        proxy = Proxy(_proxy);
        emit ProxyUpdated(_proxy);
    }

    /**
     * @param _proxy The proxy this contract exists behind
     */
    function setProxy(address payable _proxy)
        external
        onlyOwner
    {
        proxy = Proxy(_proxy);
        emit ProxyUpdated(_proxy);
    }

    /**
    * @dev We must get the msg.sender from the proxy otherwise the sender will be the Proxy
    * @param sender The msg.sender or the caller of the function
    */
    function setMessageSender(address payable sender)
        external
        onlyProxy
    {
        messageSender = sender;
    }

    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------

    /**
    * @dev Only the proxy can call this function
    */
    modifier onlyProxy {
        require(Proxy(msg.sender) == proxy, "Only the proxy can call this function");
        _;
    }

    /**
    * @dev This call could be called directly and not via the proxy
    */
    modifier optionalProxy
    {
        if (Proxy(msg.sender) != proxy) {
            messageSender = msg.sender;
        }
        _;
    }

    /**
    * @dev This call could be called directly and not via the proxy but must be the owner
    */
    modifier optionalProxy_onlyOwner
    {
        if (Proxy(msg.sender) != proxy) {
            messageSender = msg.sender;
        }
        require(messageSender == owner(), "This action can only be performed by the owner");
        _;
    }

    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------

    event ProxyUpdated(address proxyAddress);
}
