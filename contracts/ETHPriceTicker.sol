pragma solidity ^0.5.0;

import "./oraclizeAPI_0.5.sol";

/**
 * @title ETHUSD Price Oracle
 * @notice Using Oraclize to get the latest ETHUSD price from kraken
 * 
 * This file was modified from https://docs.oraclize.it/#ethereum
 */
contract ETHPriceTicker is usingOraclize {

    string public priceETHUSD;

    constructor() public {
        //oraclize_setProof(proofType_Android | proofStorage_IPFS);
        //update(); // Update price on contract creation...
    }

    function __callback(bytes32 myid, string memory result, bytes memory proof) public {
        require(msg.sender == oraclize_cbAddress(), "Sender must be oraclize_cbAddress");
        updateEthPrice(); // Recursively update the price stored in the contract...
        priceETHUSD = result;
        emit LogNewPriceUpdate(priceETHUSD);
    }

    function updateEthPrice() public payable {
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee!");
        } else {
            emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer...");
            oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=XETHZUSD).result.XETHZUSD.c.0");
            //oraclize_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
        }
    }

    //-----------------------------------------------------------------
    // Events
    //-----------------------------------------------------------------
    
    event LogNewOraclizeQuery(string description);
    event LogNewPriceUpdate(string price);
}