pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./SafeDecimalMath.sol";
import "./Mortal.sol";
import "./Pausable.sol";
import "./Proxyable.sol";
import "./TokenExchangeState.sol";
import "./ETHPriceTicker.sol";

/**
 * @title A simple decentralized Peer 2 Peer Token exchanger
 * @notice Allows people to list their alt coins to sell for ETH
 * Buyer choose a listing and send ETH to the contract which will 
 * send the seller the ETH and the buyer the tokens
 */
contract TokenExchange is Pausable, Proxyable, Mortal, ETHPriceTicker {
    using SafeMath for uint;
    using SafeDecimalMath for uint;

    /* Stores trade listings from users. */
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

    /* Where the state is stored so we can pause and upgrade this contract */
    TokenExchangeState public externalState;

    /* Reentrancy Preventer bool for noReentrancy modifer */
    bool reentrancyLock;

    /* Mapping all users tradeListings by ID */
    mapping(uint => TradeListing) public tradeListings;

    /* Array of IDs */
    uint[] public tradeID;
    
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
        optionalProxy
        public
    {
        externalState = _externalState;
        // Seed the ETH price on setup. Awaiting the Ocraclize to update
        priceETHUSD = _priceETHUSD;  
    }

    //-----------------------------------------------------------------
    // Public Functions
    //-----------------------------------------------------------------
 
    /**
     * @notice Get the total number of tokens for he DApp to iterate
     */
    function getTradeListingCount() 
        public 
        view
        returns(uint) 
    {
        return tradeID.length;
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
            string memory symbol,  
            uint amount, 
            uint ethRate,
            address tokenContract)
        optionalProxy
        notPaused
        public
        returns (uint)
    {
        // Check amount must be something to trade
        require(amount > 0, "You cant deposit nothing to trade");

        // Check tokens have a price
        require(ethRate > 0, "It's highly doubtfull you want these to be free");

        // Grab the users tokens from its contract. User must do the approve first in the DApp 
        require(IERC20(tokenContract).transferFrom(messageSender, address(this), amount));

        // Get a unique ID
        uint newTradeID = tradeID.length; 
        tradeID.push(newTradeID);

        // Create a tradeListing
        tradeListings[newTradeID] = TradeListing({ 
            user: messageSender, 
            symbol: symbol,
            amount: amount, 
            ethRate: ethRate, 
            tokenContractAddress: tokenContract});
        
        // Tell the DApps we have a new trade listed
        emit TradeListingDeposit(messageSender, amount, newTradeID);

        return newTradeID;
    }

    /**
     * @notice Allow users to withdraw their tokens and delete their trade listing
     * @param listingID ID of the trade listing
     */
    function withdrawMyDepositedTokens(uint listingID)
        optionalProxy
        notPaused
        public
    {
        // Find the TokenDeposit by depositID in our mapping 
        TradeListing memory trade = tradeListings[listingID];

        // Make sure we're trying to withdraw our listing
        require(trade.user == messageSender, "Thats not your deposit to withdraw");

        // Send their tokens back to them
        IERC20(trade.tokenContractAddress).transfer(trade.user, trade.amount);

        // Remove them from our storage
        removeTradeListing(listingID);

        // Tell the DApps there was a withdrawal
        emit TradeListingWithdrawal(messageSender, trade.amount, listingID);
    }

    /**
     * @notice Buy tokens from trade listing with ETH
     * @param listingID ID of the trade listing
     */
    function exchangeEtherForTokens(
            uint listingID)
        optionalProxy
        notPaused
        refund(listingID)
        noReentrancy
        payable
        public
    {
        // Find the TokenDeposit by depositID in our mapping 
        TradeListing memory trade = tradeListings[listingID];

        // Revert if its not found
        require(trade.amount != 0, "The Trade listingID you've requested does not exist");

        // Make sure the user has sent enough ETH to cover the trade
        uint tokenCost = trade.amount.mul(trade.ethRate);
        emit ListingPriceQuery(tokenCost, listingID);
        require(msg.value >= tokenCost, "You have not sent enough ETH to cover the cost of this trade"); 

        // Looks like we can fullfill this exchange

        // Delete the deposit to prevent a reentrant attack
        removeTradeListing(listingID);
        
        // Send the tokens to the buyer
        IERC20(trade.tokenContractAddress).transfer(messageSender, trade.amount);

        // Send the ETH to the seller
        trade.user.transfer(tokenCost);

        // Tell the DApps there was an Exchange
        emit Exchange("ETH", tokenCost, trade.symbol, trade.amount);
    }

    function getListingCostPriceInUSD(uint listingID)   
        optionalProxy
        public 
        returns (uint costETH, uint costUSD)
    {
        emit Loguint("listingID arg", listingID);
        // Find the TokenDeposit by depositID in our mapping 
        TradeListing memory trade = tradeListings[listingID];
        // Revert if its not found
        require(trade.amount != 0, "The Trade listingID you've requested does not exist");

        emit Loguint("trade.amount", trade.amount);

        emit LogString("call updateEthPrice","");
        // Get the oracle to get the latest price
        //updateEthPrice();

        // Calculate the cost in ETH to buy this trade
        costETH = trade.amount.mul(trade.ethRate);
        emit Loguint("costETH", costETH);

        // Return the price in USD
        costUSD = costETH.mul(parseInt(priceETHUSD));
        emit Loguint("costUSD", costUSD);
    }

    function calcCostPriceInUSD(uint amount, uint rate)   
        optionalProxy
        public 
        returns (uint costETH, uint costUSD)
    {
        emit Loguint("rate arg", rate);

        emit Loguint("amount arg", amount);

        // Calculate the cost in ETH to buy this trade
        costETH = amount.mul(rate);
        emit Loguint("costETH", costETH);

        // Return the price in USD
        costUSD = costETH.mul(parseInt(priceETHUSD));
        emit Loguint("costUSD", costUSD);
    }

    function callOracle()   
        optionalProxy
        public 
        returns (bool)
    {
        emit LogString("call updateEthPrice","");
        updateEthPrice();
        emit LogString("updateEthPrice called", "");
        return true;
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

    function removeTradeListing(uint listingID) internal {
        // Remove struct from mapping
        delete tradeListings[listingID];

        // Remove ID from array so its an empty spot
        delete tradeID[listingID];
    }

    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------

    modifier refund(uint listingID) {
        //refund them after pay for item (why it is before, _ checks for logic before func)
        _;
        TradeListing memory trade = tradeListings[listingID];
        uint _price = trade.amount.mul(trade.ethRate);
        uint amountToRefund = msg.value - _price;
        trade.user.transfer(amountToRefund);
    }

    /** 
    * @notice Modifier to insure that functions cannot be reentered 
    * during execution. Note there is only one global "locked" var, so 
    * there is a potential to be locked out of all functions that use 
    * the modifier at the same time.
    */ 
    modifier noReentrancy() {  
        require(!reentrancyLock, "reentrancyLocked!");
        reentrancyLock = true;
        _;
        reentrancyLock = false;
    }

    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------
    event Exchange(string fromSymbol, uint fromAmount, string toSymbol, uint toAmount);
    event TradeListingDeposit(address indexed user, uint amount, uint indexed tradeID);
    event TradeListingWithdrawal(address indexed user, uint amount, uint indexed tradeID);
    event ListingPriceQuery(uint amount, uint indexed tradeID);
    
    event LogString(string val1, string val2);
    event Loguint(string val1, uint val2);
}