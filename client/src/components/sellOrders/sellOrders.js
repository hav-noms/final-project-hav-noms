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
  }

  async refreshData() {
    const { contract, signer, erc20DetailedABI } = this.props;
    const tradeListResult = await contract.getTradeListingCount();
    const priceETHUSD = await contract.priceETHUSD();
    const tradeListCount = ethers.utils
      .bigNumberify(tradeListResult)
      .toString();

    this.setState({ tradeListCount, priceETHUSD });
    this.getListOfTrades();
  }

  async getListOfTrades() {
    const { contract, signer, erc20DetailedABI } = this.props;
    const result = await contract.getTradeList();

    if (result["ids"].length > 0) {
      let trades = [];
      result.forEach((tradeID, i) => {
        console.log("tradeID", tradeID);
        const id = result["ids"][i];
        const symbol = this.getTokenSymbol(result["symbols"][i]); //symbols[i].toString(); //ethers.utils.parseBytes32String(names[i]);
        const amount = result["amounts"][i];
        const ethRate = result["ethRates"][i];
        const totalPrice = result["totalPrices"][i];
        trades.push({ id, symbol, amount, ethRate, totalPrice });
      });
      this.setState({ trades });
    }
  }

  getTokenSymbol(contractAddress) {
    const { contract, signer, erc20DetailedABI } = this.props;
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

  componentDidMount() {
    this.refreshData();
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
      await erc20Contract.approve(contract.address, amount);
    } catch (e) {
      console.log(e);
    }
  }

  async createTradeListing() {
    const { symbol, amount, ethRate, tokenContract } = this.state;
    const { contract } = this.props;

    try {
      await contract.createTradeListing(
        symbol,
        ethers.utils.formatEther(amount),
        ethers.utils.formatEther(ethRate),
        tokenContract
      );
      setTimeout(() => {
        this.refreshData();
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  }

  async exchangeEtherForTokens(tradeID) {
    const { contract } = this.props;
    try {
      await contract.exchangeEtherForTokens(tradeID);
      setTimeout(() => {
        this.refreshData();
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  }

  withdrawMyDepositedTokens(tradeID) {
    return async () => {
      const { contract } = this.props;
      try {
        await contract.withdrawMyDepositedTokens(tradeID);
        setTimeout(() => {
          this.refreshData();
        }, 5000);
      } catch (e) {
        console.log(e);
      }
    };
  }

  callOracle() {
    return async () => {
      // const { contract } = this.props;
      // try {
      //   await contract.callOracle();
      //   setTimeout(() => {
      //     this.refreshData();
      //   }, 5000);
      // } catch (e) {
      //   console.log(e);
      // }
    };
  }

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
                    <button onClick={this.exchangeEtherForTokens(trade.id)}>
                      BUY
                    </button>
                  </td>
                  <td>
                    <button onClick={this.withdrawMyDepositedTokens(trade.id)}>
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

  onSymbolChange(type) {
    return e => {
      this.setState({ symbol: e.target.value });
    };
  }

  onTokenContractChange(type) {
    return e => {
      this.setState({ tokenContract: e.target.value });
    };
  }

  onAmountChange(type) {
    return e => {
      this.setState({ amount: e.target.value });
    };
  }

  onEthRateChange(type) {
    return e => {
      this.setState({ ethRate: e.target.value });
    };
  }

  renderAddTradeSection(type) {
    return (
      <div className="panelSection">
        <h1>Create Sell Order</h1>
        <h4>Add ERC20 Token Trade Lising</h4>
        <span>
          <div>
            <span>ERC20 Token Symbol</span>
            <input
              onChange={this.onSymbolChange(type)}
              type="text"
              placeholder={"SHT"}
            />
          </div>
          <div>
            <span>ERC20 Token Contract Address</span>
            <input
              onChange={this.onTokenContractChange(type)}
              type="text"
              placeholder={"0x012334...."}
            />
          </div>
          <div>
            <span>How many tokens?</span>
            <input
              onChange={this.onAmountChange(type)}
              type="text"
              placeholder={"1000...."}
            />
          </div>
          <div>
            <span>ETH Rate / price in ETH per token</span>
            <input
              onChange={this.onEthRateChange(type)}
              type="text"
              placeholder={"0.0006...."}
            />
          </div>
          <div>
            <button onClick={this.approveTokenTransfer}>Approve</button>
            <button onClick={this.createTradeListing}>
              Deposit Tokens and List Trade
            </button>
          </div>
        </span>
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
          <tr>
            <td>{contract.address}</td>
            <td>{priceETHUSD}</td>
            <td>{tradeListCount}</td>
            <td>
              <button onClick={this.callOracle}>
                Refresh ETHUSD Price from Oracle
              </button>
            </td>
          </tr>
          <tbody />
        </table>
      </div>
    );
  }

  render() {
    const { contract, signer, erc20DetailedABI } = this.props;
    return (
      <div>
        <button onClick={this.refreshData}>Refresh</button>
        {this.renderContractInfoSection()}
        {this.renderAddTradeSection()}
        <h1>Sell Orders</h1>
        {this.renderTradeListSection()}
      </div>
    );
  }
}

export default SellOrders;
