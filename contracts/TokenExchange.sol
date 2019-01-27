pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./SafeDecimalMath.sol";
import "./Address.sol";
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
 * @author https://github.com/hav-noms/
 */
contract TokenExchange is Pausable, Proxyable, Mortal, ETHPriceTicker {
    using SafeMath for uint;
    using SafeDecimalMath for uint;

    /* Add our isContract() utility function to the Address types */
    using Address for address;
    using Address for address payable;

    /* Stores trade listings from sellers. */
    struct TradeListing {
        // The user that made the token deposit who wants to sell their tokens for ETH
        address payable seller;
        // The token symbol
        string symbol;
        // The amount that they deposited for trading
        uint amount;
        // The ETH rate the person wants to sell their token for
        uint ethRate;
        // The total cost in ETH
        uint totalPrice;
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

    /* Mapping all TradeListings by ID */
    mapping(uint => TradeListing) public tradeListings;

    /* Shadow array of IDs */
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

    /**
     * @notice Return the list of Trades
     * @dev solidity sux so we must return seperate arrays with the datatypes and the index is the row number
     */
    function getTradeList() 
        public 
        view
        returns(
            uint[] memory ids, 
            //bytes4[] memory symbols, 
            uint[] memory amounts, 
            uint[] memory ethRates, 
            uint[] memory totalPrices,
            address[] memory tokenContractAddresss,
            address[] memory sellers
            ) 
    {
        // Get the Trade list Length
        uint tradeCount = tradeID.length;

        // Setup return arrays for each property
        ids = new uint[](tradeCount);
        //symbols = new bytes4[](tradeCount);
        amounts = new uint[](tradeCount);
        ethRates = new uint[](tradeCount);
        totalPrices = new uint[](tradeCount);
        tokenContractAddresss = new address[](tradeCount);
        sellers = new address[](tradeCount);

        // Iterate our trade mappings putting the values into each "row" array
        for (uint i = 0; i < tradeCount; i++) {
            if (tradeListings[i].totalPrice != 0) {
                ids[i] = i; 
                //symbols[i] = tradeListings[i].symbol;      
                amounts[i] = tradeListings[i].amount;      
                ethRates[i] = tradeListings[i].ethRate;      
                totalPrices[i] = tradeListings[i].totalPrice; 
                tokenContractAddresss[i] = tradeListings[i].tokenContractAddress; 
                sellers[i] = tradeListings[i].seller;   
            }   
        }
    }

    /**
     * @notice Return a single Trade
     */
    function getTrade(uint id) 
        public 
        view 
    returns(string memory symbol, uint amount, uint ethRate, uint totalPrice, address tokenContractAddress, address seller) {
        symbol = tradeListings[id].symbol; 
        amount = tradeListings[id].amount;
        ethRate = tradeListings[id].ethRate;
        totalPrice = tradeListings[id].totalPrice;
        tokenContractAddress = tradeListings[id].tokenContractAddress;
        seller = tradeListings[id].seller;
    }

    //-----------------------------------------------------------------
    // Public Mutative Functions
    //-----------------------------------------------------------------

    /**
     * @notice createTradeListing: Allows users to deposit tokens via the ERC20 approve / transferFrom workflow
     * @param amount The amount of tokens you wish to deposit (must have been approved first)
     * @param ethRate The price of ETH the seller wants per token
     * @param tokenContract The address of the token contract
     */
    function createTradeListing(
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

        // Check the tokenContract address provided is a contract or the transfer is bogus
        require(tokenContract.isContract(), "The tokenContract address you provided is not a contract? Did you make a mistake?");

        // Grab the seller tokens from its contract. Seller must call approve() first
        require(IERC20(tokenContract).transferFrom(messageSender, address(this), amount));

        // Get a unique ID. Just using a basic shadow array to use uints as the IDs so 
        // we can simply iterate the mapping for the list of trades. There are better ways 
        // to do this beyond the scope of this project requirements. 
        uint newTradeID = tradeID.length; 
        tradeID.push(newTradeID);

        // Create a tradeListing
        uint _totalPrice = amount.multiplyDecimal(ethRate);
        tradeListings[newTradeID] = TradeListing({ 
            seller: messageSender, 
            symbol: ERC20Detailed(tokenContract).symbol(),
            amount: amount, 
            ethRate: ethRate, 
            totalPrice: _totalPrice,
            tokenContractAddress: tokenContract});
        
        // Tell the DApps we have a new trade listed
        emit TradeListingDeposit(messageSender, amount, newTradeID);

        return newTradeID;
    }

    /**
     * @notice Allow sellers to withdraw their tokens and delete their trade listing
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
        require(trade.seller == messageSender, "Thats not your deposit to withdraw");

        // Remove the trade listing from our storage
        removeTradeListing(listingID);
        delete tradeListings[listingID];

        // Send their tokens back to them
        require(IERC20(trade.tokenContractAddress).transfer(trade.seller, trade.amount), "The transfer of the ERC20 Tokens failed. Check the ERC20 Token contract");

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
        require(trade.totalPrice != 0, "The Trade listingID you've requested does not exist");

        // Make sure the buyer has sent enough ETH to cover the trade
        require(msg.value >= trade.totalPrice, "You have not sent enough ETH to cover the cost of this trade"); 

        // Delete the deposit
        removeTradeListing(listingID); // @dev to prevent we have a noReentrancy modifier

        // Send the ERC20 tokens to the buyer
        require(IERC20(trade.tokenContractAddress).transfer(messageSender, trade.amount), "The transfer of the ERC20 Tokens failed. Check the ERC20 Token contract");

        // Send the ETH to the seller
        trade.seller.transfer(trade.totalPrice); // dont send the msg.value as we may need to refund some to the buyer

        // Tell the DApps there was an Exchange
        emit Exchange("ETH", trade.totalPrice, trade.symbol, trade.amount);
    }

    function getTradeCostPriceInUSD(uint listingID)   
        optionalProxy
        public 
        returns (uint costUSD)
    {
        emit Loguint("listingID arg", listingID);
        // Find the TokenDeposit by depositID in our mapping 
        TradeListing memory trade = tradeListings[listingID];

        // Revert if its not found
        require(trade.amount != 0, "The Trade listingID you've requested does not exist");

        emit Loguint("trade.totalPrice", trade.totalPrice);

        emit LogString("call updateEthPrice","");
        // Get the oracle to get the latest price
        //updateEthPrice();

        // Return the price in USD
        costUSD = trade.totalPrice.multiplyDecimal(parseInt(priceETHUSD));
        
        emit Loguint("costUSD", costUSD);
    }

    function callOracle()   
        optionalProxy
        public 
        returns (bool)
    {
        update();
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
        // delete mapping[key] doesnt actually delete the struct it just clears out all the values
        //delete tradeListings[listingID]; was causing VM error and reverting

        // Clear struct values in mapping but the one reverting the EVM
        tradeListings[listingID].symbol = string("");
        tradeListings[listingID].seller = address(0);
        tradeListings[listingID].tokenContractAddress = address(0);
        tradeListings[listingID].amount = 0;
        tradeListings[listingID].ethRate = 0;
        //tradeListings[listingID].totalPrice = 0; // @dev TODO the EVM reverts if I attempt to change this value. Why?

        // Remove ID from array so its an empty spot
        delete tradeID[listingID];
    }

    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------

    /**
     * @notice Refund the buyer any extra ETH they sent
     */
    modifier refund(uint listingID) {
        //refund them after pay for item (why it is before, _ checks for logic before func)
        _;
        TradeListing memory trade = tradeListings[listingID];
        uint amountToRefund = msg.value - trade.totalPrice;
        messageSender.transfer(amountToRefund);
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
    
    /**
     * @notice emit when a seller has successfully deposited tokens and created a trade listing 
     */
    event TradeListingDeposit(address indexed seller, uint amount, uint tradeID);
   
    /**
     * @notice emit when a buyer has successfully bought a sellers tokens with ETH
     */
    event Exchange(string fromSymbol, uint fromAmount, string toSymbol, uint toAmount);
    
    /**
     * @notice emit when a seller has successfuly withdrawn their tokens and removes the trade listing
     */
    event TradeListingWithdrawal(address indexed seller, uint amount, uint tradeID);
    

    //-----------------------------------------------------------------
    // Events Debugging  
    //-----------------------------------------------------------------
    /**
     * @dev Just used for debugging during dev - delete for release
     */
    event LogString(string description, string value);
    event Loguint(string description, uint value);
    event LogAddress(string description, address value);
}