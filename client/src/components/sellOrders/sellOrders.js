import React, { Component } from "react";
import { ethers, Contract } from "ethers";
import "./sellOrders.css";

class SellOrders extends Component {
  constructor() {
    super();
    this.state = {
      symbol: "",
      tokenContract: "",
      amount: "",
      ethRate: "",
      tradeListCount: "",
      priceETHUSD: "",
      trades: null
    };

    this.createTradeListing = this.createTradeListing.bind(this);
    this.withdrawMyDepositedTokens = this.withdrawMyDepositedTokens.bind(this);
    this.exchangeEtherForTokens = this.exchangeEtherForTokens.bind(this);

    this.onSymbolChange = this.onSymbolChange.bind(this);
    this.onTokenContractChange = this.onTokenContractChange.bind(this);
    this.onAmountChange = this.onAmountChange.bind(this);
    this.onEthRateChange = this.onEthRateChange.bind(this);

    this.getTokenSymbol = this.getTokenSymbol.bind(this);
    this.approveTokenTransfer = this.approveTokenTransfer.bind(this);
    this.callOracle = this.callOracle.bind(this);
    this.refreshData = this.refreshData.bind(this);

    this.listenToContractEvents = this.listenToContractEvents.bind(this);
  }

  componentDidMount() {
    this.refreshData();
    this.listenToContractEvents();
  }

  async listenToContractEvents() {
    const { contract } = this.props;

    contract.on("TradeListingDeposit", (seller, amount, tradeID, event) => {
      console.log("Event TradeListingDeposit");
      console.log("seller", seller);
      console.log("amount", amount.toString());
      console.log("tradeID", tradeID.toString());

      console.log(event.blockNumber);

      //refresh the data
      this.refreshData();
    });

    contract.on(
      "Exchange",
      (fromSymbol, fromAmount, toSymbol, toAmount, event) => {
        console.log("Event Exchange");
        // Called when anyone changes the value
        console.log(fromSymbol);
        console.log(fromAmount);
        console.log(toSymbol);
        console.log(toAmount);

        console.log(event.blockNumber);

        //refresh the data
        this.refreshData();
      }
    );

    contract.on("TradeListingWithdrawal", (seller, amount, tradeID, event) => {
      console.log("Event TradeListingWithdrawal");
      console.log("seller", seller);
      console.log("amount", amount.toString());
      console.log("tradeID", tradeID.toString());

      console.log(event.blockNumber);

      //refresh the data
      this.refreshData();
    });
  }

  //-----------------------------------------------------------------
  // Conctract Calls
  //-----------------------------------------------------------------

  async refreshData() {
    const { contract } = this.props;
    const tradeListResult = await contract.getTradeListingCount();
    const priceETHUSD = await contract.priceETHUSD();
    const tradeListCount = ethers.utils
      .bigNumberify(tradeListResult)
      .toString();

    this.setState({ tradeListCount, priceETHUSD });
    this.getMockTrades();
    //this.getListOfTrades();
  }

  async getTradesList() {
    const { contract } = this.props;
    let trades = [];

    const [
      ids,
      symbols,
      amounts,
      ethRates,
      totalPrices,
      contracts,
      sellers
    ] = await contract.getTradeList();

    ids.forEach((idInt, i) => {
      const id = idInt;
      const symbol = ethers.utils.parseBytes32String(symbols[i]);
      const amount = ethers.utils.formatEther(amounts[i]);
      const ethRate = ethers.utils.formatEther(ethRates[i]);
      const totalPrice = ethers.utils.formatEther(totalPrices[i]);
      const contract = contracts[i];
      const seller = sellers[i];
      trades.push({
        id,
        symbol,
        amount,
        ethRate,
        totalPrice,
        contract,
        seller
      });
      console.log({
        id,
        symbol,
        amount,
        ethRate,
        totalPrice,
        contract,
        seller
      });
      this.setState({ trades });
    });
  }

  /* 
  async getListOfTrades() {
    const { contract } = this.props;
    let result;
    let trades = [];

    try {
      result = await contract.getTradeList();
    } catch (e) {
      console.log(e);
    }

    if (result["ids"].length > 0) {
      result.forEach((tradeID, i) => {
        console.log("tradeID", tradeID);
        const id = result["ids"][i];
        const symbol = ethers.utils.parseBytes32String(result["symbols"][i]);
        // const symbol = await this.getTokenSymbol(result["symbols"][i]);
        const amount = result["amounts"][i];
        const ethRate = result["ethRates"][i];
        const totalPrice = result["totalPrices"][i];
        const seller = result["seller"][i];
        const contractAddress = result["contractAddress"][i];
        trades.push({
          id,
          symbol,
          amount,
          ethRate,
          totalPrice,
          seller,
          contractAddress
        });
      });
      this.setState({ trades });
    }
  }
 */

  // async getMockTrades() {
  //   const { contract } = this.props;
  //   let trades = [];

  //   trades.push({
  //     id: 1,
  //     symbol: "SHT",
  //     amount: 1000,
  //     ethRate: 0.0006,
  //     totalPrice: 60000000000000000
  //   });
  //   trades.push({
  //     id: 2,
  //     symbol: "SHT",
  //     amount: 10,
  //     ethRate: 0.0008,
  //     totalPrice: 60000000000000000
  //   });
  //   this.setState({ trades });
  // }

  getTokenSymbol(contractAddress) {
    const { signer, erc20DetailedABI } = this.props;
    return async () => {
      try {
        const erc20Contract = await new Contract(
          contractAddress,
          erc20DetailedABI,
          signer
        );
        return await erc20Contract.symbol();
      } catch (e) {
        console.log(e);
      }
    };
  }

  async approveTokenTransfer() {
    const { amount, tokenContract } = this.state;
    const { contract, signer, erc20DetailedABI } = this.props;

    //We need to approve() first
    try {
      const erc20Contract = await new Contract(
        tokenContract,
        erc20DetailedABI,
        signer
      );
      const tx = await erc20Contract.approve(
        contract.address,
        ethers.utils.formatEther(amount)
      );
      console.log(tx.hash);
      await tx.wait();

      alert(
        "You've approved the transfer of your tokens to the exchange. You can now click 2. Desposit and Create"
      );
    } catch (e) {
      console.log(e);
    }
  }

  async createTradeListing() {
    const { symbol, amount, ethRate, tokenContract } = this.state;
    const { contract } = this.props;

    console.log(ethers.utils.parseEther(amount));
    console.log(ethers.utils.parseEther(ethRate));

    try {
      const tx = await contract.createTradeListing(
        ethers.utils.formatBytes32String(symbol),
        ethers.utils.parseEther(amount),
        ethers.utils.parseEther(ethRate),
        tokenContract
      );
      console.log(tx.hash);
      await tx.wait();

      alert(
        "Congrats you just deposited your tokens to the p2p exchange for trading"
      );

      setTimeout(() => {
        this.refreshData();
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  }

  async exchangeEtherForTokens(trade) {
    const { contract } = this.props;
    console.log("exchangeEtherForTokens.tradeID:", trade.id);
    console.log("exchangeEtherForTokens.value:", trade.totalPrice);

    try {
      const tx = await contract.exchangeEtherForTokens(parseInt(trade.id), {
        value: trade.totalPrice
      });

      console.log(tx.hash);
      await tx.wait();

      alert(
        "Exchange complete. Add the token contract address to metamask so you can see the balance"
      );
    } catch (e) {
      console.log(e);
    }
  }

  async withdrawMyDepositedTokens(trade) {
    const { contract } = this.props;

    try {
      const tx = await contract.withdrawMyDepositedTokens(parseInt(trade.id));

      console.log(tx.hash);
      await tx.wait();

      alert(
        "Your trade listing has been deleted. Check your balance you should have recieved your deposited tokens back"
      );
    } catch (e) {
      console.log(e);
    }
  }

  async callOracle() {
    const { contract } = this.props;
    try {
      const tx = await contract.callOracle();

      console.log(tx.hash);
      await tx.wait();

      const priceETHUSD = await contract.priceETHUSD();
      this.setState({ priceETHUSD });
    } catch (e) {
      console.log(e);
    }
  }

  //-----------------------------------------------------------------
  // Contract Calls
  //-----------------------------------------------------------------

  //-----------------------------------------------------------------
  // Rendering
  //-----------------------------------------------------------------

  renderTradeListSection() {
    const { trades } = this.state;
    if (!trades || trades.length === 0)
      return (
        <div style={{ marginTop: "40px" }}>
          There are no trades. Would you like to be the first? Create a Sell
          Order
        </div>
      );
    return (
      <div className="panelSection">
        <table className="tradesTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Token</th>
              <th>Amount</th>
              <th>ETH Price</th>
              <th>Total Price</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => {
              return (
                <tr key={i}>
                  <td>{trade.id}</td>
                  <td>{trade.symbol}</td>
                  <td>{trade.amount}</td>
                  <td>{trade.ethRate}</td>
                  <td>{trade.totalPrice}</td>
                  <td>
                    <button onClick={() => this.exchangeEtherForTokens(trade)}>
                      BUY
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => this.withdrawMyDepositedTokens(trade)}
                    >
                      Withdraw
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  onSymbolChange() {
    return e => {
      this.setState({ symbol: e.target.value });
    };
  }

  onTokenContractChange() {
    return e => {
      this.setState({ tokenContract: e.target.value });
    };
  }

  onAmountChange() {
    return e => {
      this.setState({ amount: e.target.value });
    };
  }

  onEthRateChange() {
    return e => {
      this.setState({ ethRate: e.target.value });
    };
  }

  renderAddTradeSection() {
    return (
      <div className="panelSection">
        <h1>Create Sell Order</h1>
        <h4>Add ERC20 Token Trade Lising</h4>
        <div className="div-table">
          <div className="div-table-row">
            <div className="div-table-cel">ERC20 Token Symbol</div>
            <div className="div-table-cel">
              <input
                onChange={this.onSymbolChange()}
                type="text"
                placeholder={"SHT"}
              />
            </div>
          </div>
          <div className="div-table-row">
            <div className="div-table-cel">ERC20 Token Contract Address</div>
            <div className="div-table-cel">
              <input
                onChange={this.onTokenContractChange()}
                type="text"
                placeholder={"0x012334...."}
              />
            </div>
          </div>
          <div className="div-table-row">
            <div className="div-table-cel">How many tokens?</div>
            <div className="div-table-cel">
              <input
                onChange={this.onAmountChange()}
                type="text"
                placeholder={"1000...."}
              />
            </div>
          </div>
          <div className="div-table-row">
            <div className="div-table-cel">
              ETH Rate / price in ETH per token
            </div>
            <div className="div-table-cel">
              <input
                onChange={this.onEthRateChange()}
                type="text"
                placeholder={"0.0006...."}
              />
            </div>
          </div>
          <div className="div-table-row">
            <button onClick={this.approveTokenTransfer}>1. Approve</button>
            <button onClick={this.createTradeListing}>
              2. Deposit Tokens and List Trade
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderContractInfoSection() {
    const { tradeListCount, priceETHUSD } = this.state;
    const { contract } = this.props;

    return (
      <div className="panelSection">
        <table className="tradesTable">
          <thead>
            <tr>
              <th>P2PToken Contract Address</th>
              <th>USDETH Price</th>
              <th>Trade Listing Count</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{contract.address}</td>
              <td>{priceETHUSD}</td>
              <td>{tradeListCount}</td>
              <td>
                <button onClick={() => this.callOracle()}>
                  Refresh ETHUSD Price from Oracle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div>
          <button onClick={this.refreshData()}>Force Refresh All Data</button>
        </div>
        {this.renderContractInfoSection()}
        {this.renderAddTradeSection()}
        <h1>Sell Orders</h1>
        {this.renderTradeListSection()}
      </div>
    );
  }
}

export default SellOrders;
