pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./SafeDecimalMath.sol";
import "./Mortal.sol";
import "./TokenExchangeState.sol";

/**
 * @title A simple decentralized Peer 2 Peer Token exchanger
 * @notice a Simple Smart contract system to allow people to list their alt coins to sell for ETH
 * 
 */
contract TokenExchange is Proxyable, Mortal, Pausable {
    using SafeMath for uint;
    using SafeDecimalMath for uint;

    /* How long will the contract assume the price of any asset is correct */
    uint public priceStalePeriod = 3 hours;

    /* The time the prices were last updated */
    uint public lastPriceUpdateTime;

    /* The USD price of ETH denominated in UNIT */
    uint public usdToEthPrice;

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

    /* Mapping all users token deposits */
    mapping(uint => tokenDeposit) public deposits;

    //mapping(string => tokenSymbol) public tokens;

    /**
     * @dev Constructor
     * @param _owner The owner of this contract.
     * @param _proxy The Proxy contract sddress.
     * @param _externalState The  contract we'll interact with for balances and state.
     * @param _usdToEthPrice The current price of ETH in USD, expressed in UNIT.
     */
    constructor(address _owner
                address _proxy, 
                TokenExchangeState _externalState,
                uint _usdToEthPrice)
        Mortal(_owner)
        Proxyable(_proxy, _owner)
        public
    {
        require(_owner != address(0), "Owner address cannot be 0");
        owner = _owner;
        emit OwnerChanged(address(0), _owner);
    }


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
        // Grab the amount of synths
        synth.transferFrom(msg.sender, this, amount);

        //Create a tokenDeposit
        deposits[msg.sender] = tokenDeposit({ user: msg.sender, amount: amount, rate: ethRate, tokenContract: tokenContract});

        //Add to the Array of available Tokens for sale
        //tokens[tokenContract.symbol]
        //if token already exists add to its sub array

    }


    //-----------------------------------------------------------------
    // Modifiers
    //-----------------------------------------------------------------

    /**
     * @notice Only the Ower may call this function decorated with this modifer.
     */
    modifier onlyOwner
    {
        require(msg.sender == owner, "Only the contract owner may perform this action");
        _;
    }

    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------

    event OracleUpdated(address newOracle);
    event PricesUpdated(uint newEthPrice, uint timeSent);
    event Exchange(string fromCurrency, uint fromAmount, string toCurrency, uint toAmount);
    event TokenWithdrawal(address user, uint amount);
    event TokenDeposit(address indexed user, uint amount, uint indexed depositIndex);
}