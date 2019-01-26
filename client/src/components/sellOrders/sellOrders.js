import React, { Component } from "react";
import { ethers } from "ethers";
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
  }

  async refreshData() {
    const { contract } = this.props;
    const [tradeListCount, priceETHUSD] = await Promise.all([
      contract.getTradeListingCount(),
      contract.priceETHUSD()
    ]);
    this.setState({ tradeListCount, priceETHUSD });
    this.getListOfTrades();
  }

  async getListOfTrades() {
    const { contract } = this.props;
    const [ids, symbols, amounts, ethRates, totalPrices] = await Promise.all([
      contract.getTradeList()
    ]);
    let trades = [];
    ids.forEach((tradeID, i) => {
      const id = tradeID;
      const symbol = symbols[i].toString(); //ethers.utils.parseBytes32String(names[i]);
      const amount = amounts[i];
      const ethRate = ethRates[i];
      const totalPrice = totalPrices[i];
      trades.push({ id, symbol, amount, ethRate, totalPrice });
    });
    this.setState({ trades });
  }

  componentDidMount() {
    this.refreshData();
  }

  async createTradeListing() {
    const { symbol, amount, ethRate, tokenContract } = this.state;
    const { contract } = this.props;
    try {
      await contract.createTradeListing(symbol, amount, ethRate, tokenContract);
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

  renderTradeListSection() {
    const { trades } = this.state;
    if (!trades || trades.length === 0)
      return (
        <div style={{ marginTop: "40px" }}>
          There are no trades. Would you like to be the first?
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
      <div>
        <h4>Add ERC20 Token Trade Lising</h4>
        <div>
          <div>ERC20 Token Symbol</div>
          <input
            onChange={this.onSymbolChange(type)}
            type="text"
            placeholder={"SHT"}
          />
          <div>ERC20 Token Contract Address</div>
          <input
            onChange={this.onTokenContractChange(type)}
            type="text"
            placeholder={"0x012334...."}
          />
          <div>How many tokens?</div>
          <input
            onChange={this.onAmountChange(type)}
            type="text"
            placeholder={"1000...."}
          />
          <div>ETH Rate / price in ETH per token</div>
          <input
            onChange={this.onEthRateChange(type)}
            type="text"
            placeholder={"0.0006...."}
          />
          <button onClick={this.createTradeListing}>Add</button>
        </div>
      </div>
    );
  }

  render() {
    const { accounts } = this.props;
    return (
      <div>
        <div>Your address: {accounts[0]}</div>
        {this.renderAddTradeSection()}
        <h1>Sell Orders</h1>
        {this.renderTradeListSection()}
      </div>
    );
  }
}

export default SellOrders;
