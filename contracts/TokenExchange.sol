pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./SafeDecimalMath.sol";
import "./Mortal.sol";
import "./Pausable.sol";
import "./Proxyable.sol";
import "./TokenExchangeState.sol";
import "./ETHPriceTicker.sol";
import "./IERC20.sol";

/**
 * @title A simple decentralized Peer 2 Peer Token exchanger
 * @notice Allows people to list their alt coins to sell for ETH
 * 
 */
//contract TokenExchange is Proxyable, Mortal, Pausable, ETHPriceTicker {
contract TokenExchange is Pausable, Proxyable, Mortal, ETHPriceTicker {
    using SafeMath for uint;
    using SafeDecimalMath for uint;

    /* Stores token deposits trade listings from users. */
    struct TradeListing {
        // The user that made the token deposit whio wants to receive ETH
        address payable user;
        // The token symbol
        string symbol;
        // The amount that they deposited for trading
        uint amount;
        // The ETH rate the person wants to sell their token for
        uint ethRate;
        // The contract address of the token being sold
        address tokenContractAddress;
    }

    //-----------------------------------------------------------------
    // Public Variables
    //-----------------------------------------------------------------

    TokenExchangeState public externalState;

    /* Mapping all users tradeListings by ID */
    mapping(uint => TradeListing) public tradeListings;

    /* Mapping tokenSymbol to an array of TradeListingIDs to buy with an array or trade IDs for that token */
    mapping(bytes4 => uint[]) public tokenListingIDs;
    
    /* Array of IDs */
    uint[] public tradeID;
    
    /* Array of available Tokens */
    string[] public tokenSymbolArray;
    
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
                string memory _priceETHUSD)
        Proxyable(_proxy)
        Mortal(_selfDestructBeneficiary)
        Pausable()
        ETHPriceTicker()
        public
    {
        externalState = _externalState;
        // Seed the ETH price on setup. Awaiting the Ocraclize to update
        priceETHUSD = _priceETHUSD;  
    }

    //-----------------------------------------------------------------
    // Public View Functions
    //-----------------------------------------------------------------
 
    /**
     * @notice Get the list of tokens for sale
     */
    function getAvailableTokens()
        optionalProxy
        external
        view
        returns (string[] memory)
    {
        /* for (uint i = 0; i<tokenSymbolArray.length-1; i++){
            availableTokens = availableTokens + "," + tokenSymbolArray[i];
        } */
        return tokenSymbolArray;
    }

    /**
     * @notice Get the list of trades for the token
     */
    function getTradeListingIDsForSymbol(string calldata symbol)
        optionalProxy
        external
        view
        returns (uint[] memory)
    {
        // for (uint i = 0; i<tokenListingIDs[symbol].length-1; i++){
        //     availableTradeIds = availableTradeIds + "," + tokenListingIDs[symbol][i];
        // }
        return tokenListingIDs[bytes4(symbol)];
    }

    //-----------------------------------------------------------------
    // Public Mutative Functions
    //-----------------------------------------------------------------

    /**
     * @notice createTradeListing: Allows users to deposit tokens via the ERC20 approve / transferFrom workflow
     * @param symbol The ERC20 token symbol
     * @param amount The amount of tokens you wish to deposit (must have been approved first)
     * @param ethRate The price of ETH the user wants per token
     * @param tokenContract The address of the token contract
     */
    function createTradeListing(
            bytes4 symbol,  
            uint amount, 
            uint ethRate,
            address tokenContract)
        optionalProxy
        notPaused
        external
    {
        // Grab the users tokens from its contract. User must do the approve first in the DApp 
        require(IERC20(tokenContract).transferFrom(messageSender, address(this), amount));

        // Get a unique ID
        uint newTradeID = tradeID.push(tradeID.length);

        // Create a tradeListing
        tradeListings[newTradeID] = TradeListing({ 
            user: messageSender, 
            symbol: symbol,
            amount: amount, 
            ethRate: ethRate, 
            tokenContractAddress: tokenContract});
        
        // Add to the list of available Tokens for sale
        uint[] storage listings = tokenListingIDs[bytes4(symbol)];

        // if token exists then add the id to its sub array
        if (listings.length>0) {
            listings.push(newTradeID);
        } else {
            //store a new token listing ID array with the deposit ID against a token mapping
            tokenListingIDs[bytes4(symbol)] = new string[].push(newTradeID);
        }
    }

    /**
     * @notice Allow users to withdraw their tokens
     */
    function withdrawMyDepositedTokens()
        optionalProxy
        notPaused
        external
    {
        uint amountToSend = 0;

        // Get users tradeListing

        // If there's nothing to send then go ahead and revert the transaction
        //require(amountToSend > 0, "You have no deposits to withdraw.");

        // Remove them from our storage

        // Update our total
        //totalSellableDeposits[deposit.token.symbol] = totalSellableDeposits[deposit.token.symbol].sub(amountToSend);

        // Send their deposits back to them
        //deposit.token.transfer(msg.sender, amountToSend)

        // Tell the DApps there was a withdrawal
        emit TokenWithdrawal(messageSender, amountToSend);
    }

    /**
     * @notice Buy a trade listing with ETH
     */
    function exchangeEtherForTokens(
            uint listingID)
        optionalProxy
        notPaused
        refund
        payable
        external
    {
        // Find the TokenDeposit by depositID in our mapping 
        TradeListing memory trade = tradeListings[listingID];

        // Revert if its not found
        require(trade);

        // Make sure the user has sent enough ETH to cover the trade
        uint tokenCost = trade.amount.multiply(trade.ethRate);
        require(msg.value >= tokenCost); 

        // Looks like we can fullfill this exchange

        // Delete the deposit to prevent a reentrant attack
        removeTradeListing(trade.symbol. listingID);
        
        // Send the tokens to the buyer
        IERC20(trade.tokenContractAddress).transfer(messageSender, trade.amount);

        // Send the ETH to the seller
        trade.user.transfer(tokenCost);

        // Tell the DApps there was an Exchange
        emit Exchange("ETH", tokenCost, trade.tokenContractAddress.symbol, trade.amount);
    }

    function getListingCostPriceInUSD(uint listingID)   
        optionalProxy
        external 
        view
        returns (uint cost)
    {
        // Find the TokenDeposit by depositID in our mapping 
        TradeListing memory trade = tradeListings[listingID];

        // Get the oracle to get the latest price
        updateEthPrice();

        uint tokenCostInETH = trade.amount.multiply(trade.ethRate);

        return tokenCostInETH.multiply(priceETHUSD);
    }

    /**
     * @notice Fallback function - Protect users from sending ETH here by accident
     */
    function() 
        optionalProxy
        external {
        revert();
    }

    //-----------------------------------------------------------------
    // Internal Functions
    //-----------------------------------------------------------------
    function removeTradeListing(string memory symbol, uint listingID) internal {
        // Remove struct from mapping
        delete tradeListings[listingID];

        // Remove its ID from the tokenListingIDs
        tokenListingIDs[symbol] = removeItemFromArrayAndShift(listingID, tokenListingIDs[symbol]);

        // Delete from mapped token array
        if(tokenListingIDs[symbol].length = 0) {
            // There are no more trades for this token symbol so kill the symbol from the token list
            delete tokenListingIDs[symbol] ;   
        }
    }

    function removeItemFromArrayAndShift(uint id, uint[] memory array) private returns(uint[] memory ) {
        if (id >= array.length) return;

        for (uint i = 0; i<array.length-1; i++){
            if(array[i] = id) {
                array[i] = array[array.length-1];
                delete array[array.length-1];
            }
        }
        array.length--;
        return array;
    }

    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------

    modifier refund(uint listingID) {
        //refund them after pay for item (why it is before, _ checks for logic before func)
        _;
        TradeListing memory trade = tradeListings[listingID];
        uint _price = trade.amount.multiply(trade.ethRate);
        uint amountToRefund = msg.value - _price;
        trade.buyer.transfer(amountToRefund);
    }


    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------
    event Exchange(string fromSymbol, uint fromAmount, string toSymbol, uint toAmount);
    event TokenWithdrawal(address indexed user, uint amount);
    event TokenDeposit(address indexed user, uint amount, uint indexed depositIndex);
}