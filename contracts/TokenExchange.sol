pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
//import "./SafeMath.sol";
import "./SafeDecimalMath.sol";
import "./Mortal.sol";
import "./Pausable.sol";
import "./Proxyable.sol";
import "./TokenExchangeState.sol";

/**
 * @title A simple decentralized Peer 2 Peer Token exchanger
 * @notice a Simple Smart contract system to allow people to list their alt coins to sell for ETH
 * 
 */
contract TokenExchange is Proxyable, Mortal, Pausable {
    using SafeMath for uint;
    using SafeDecimalMath for uint;

    /* Stores deposits from users. */
    struct tokenDeposit {
        // The user that made the token deposit whio wants to receive ETH
        address payable user;
        // The amount that they deposited
        uint amount;
        // The ETH rate the person wants to sell their Token
        uint rate;
        // The address of the token being sold
        address tokenContract;
    }

    //-----------------------------------------------------------------
    // Public Variables
    //-----------------------------------------------------------------

    TokenExchangeState public externalState;

    uint public priceETHUSD;

    /* Mapping all users token deposits */
    mapping(uint => tokenDeposit) public deposits;

    uint[] public despositID;
    
    //mapping(string => tokenSymbol) public tokens;

    /**
     * @dev Constructor
     * @param _selfDestructBeneficiary The account where all the funds go when this contrqct is killed. 
     * @param _proxy The Proxy contract address.
     * @param _externalState The  contract we'll interact with for balances and state.
     * @param _priceETHUSD The current price of ETH in USD, expressed in UNIT.
     */
    constructor(address payable _selfDestructBeneficiary,
                address payable _proxy, 
                TokenExchangeState _externalState,
                uint _priceETHUSD)
        Proxyable(_proxy)
        Mortal(_selfDestructBeneficiary)
        Pausable()
        public
    {
        externalState = _externalState;

        priceETHUSD = _priceETHUSD;  
    }

    //-----------------------------------------------------------------
    // Public Functions
    //-----------------------------------------------------------------


    /**
     * @notice depositTokens: Allows users to deposit tokens via the ERC20 approve / transferFrom workflow
     * @param amount The amount of tokens you wish to deposit (must have been approved first)
     * @param ethRate The price of ETH the user wants per token
     * @param tokenContract The address of the token contract
     */
    function depositTokens(uint amount, 
                           uint ethRate, 
                           address tokenContract)
        external
    {
        // Grab the tokens from the contract. User must do the approve first in the DApp 
        //tokenContract.transferFrom(msg.sender, this, amount);

        //Create a tokenDeposit
        uint newDespositID = despositID.push(despositID.length);
        deposits[newDespositID] = tokenDeposit({ user: msg.sender, amount: amount, rate: ethRate, tokenContract: tokenContract});
        
        //Add to the Array of available Tokens for sale
        //tokens[tokenContract.symbol]
        //if token already exists add to its sub array

    }

    /**
     * @notice Allow users to withdraw their tokens
     */
    function withdrawMyDepositedTokens()
        external
    {
        uint amountToSend = 0;

        //Get users tokenDeposit

        // If there's nothing to send then go ahead and revert the transaction
        require(amountToSend > 0, "You have no deposits to withdraw.");

        //Remove them from our storage

        // Update our total
        //totalSellableDeposits[deposit.token.symbol] = totalSellableDeposits[deposit.token.symbol].sub(amountToSend);

        // Send their deposits back to them
        //deposit.token.transfer(msg.sender, amountToSend)

        //Tell the DApps there was a withdrawal
        emit TokenWithdrawal(msg.sender, amountToSend);
    }


    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------



    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------
    event Exchange(string fromCurrency, uint fromAmount, string toCurrency, uint toAmount);
    event TokenWithdrawal(address indexed user, uint amount);
    event TokenDeposit(address indexed user, uint amount, uint indexed depositIndex);
}