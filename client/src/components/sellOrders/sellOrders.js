import React, { Component } from "react";
import "./adminPanel.css";

class SellOrders extends Component {
  constructor() {
    super();
    this.state = {
      currentAddress: "",
      tradeListCount: "",
      priceETHUSD: null,
      currentTrade: null
    };
    this.createTradeListing = this.createTradeListing.bind(this);
    this.withdrawMyTradeListing = this.withdrawMyTradeListing.bind(this);
    this.exchageEtherForTokens = this.exchageEtherForTokens.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onNumberOfTokensChange = this.onNumberOfTokensChange.bind(this);
  }

  async refreshData() {
    const { contract } = this.props;
    const [tradeListCount, priceETHUSD] = await Promise.all([
      contract.getTradeListingCount(),
      contract.priceETHUSD()
    ]);
    this.setState({ tradeListCount, priceETHUSD });
  }

  componentDidMount() {
    this.refreshData();
  }

  async exchangeEtherForTokens(tradeID) {
    const { contract } = this.props;
    const { tradeID } = this.state;
    try {
      await contract.exchangeEtherForTokens(tradeID);
      setTimeout(() => {
        this.refreshData();
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  }

  renderList(type) {
    const typeToList = this.state[type];
    if (!typeToList || typeToList.length === 0)
      return <div className="listIsEmpty">no {type} yet</div>;
    return (
      <ul>
        {typeToList.map((address, i) => {
          return (
            <li key={i}>
              <div>
                <span>{address}</span>
                <button
                  onClick={
                    type === "administrators"
                      ? this.removeAdmin(address)
                      : this.removeStoreOwner(address)
                  }
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  onAddressChange(type) {
    return e => {
      if (type === "administrators") {
        this.setState({ adminAddress: e.target.value });
      } else {
        this.setState({ storeOwnerAddress: e.target.value });
      }
    };
  }

  renderAddSection(type) {
    return (
      <div>
        <h4>Add ERC20 Token Trade Lising</h4>
        <div>
          <div>ERC20 Token Contract Address</div>
          <input
            onChange={this.onAddressChange(type)}
            type="text"
            placeholder={"0x012334...."}
          />
          <div>How many tokens?</div>
          <input
            onChange={this.onNumberOfTokensChange(type)}
            type="text"
            placeholder={"1000...."}
          />
          <button onClick={this.createTradeListing}>Add</button>
        </div>
      </div>
    );
  }

  renderSections() {
    return ["orders"].map(type => {
      return (
        <div className="panelSection">
          <h2>{type}</h2>
          {this.renderList(type)}
          {this.renderAddSection(type)}
        </div>
      );
    });
  }

  render() {
    const { accounts } = this.props;
    return (
      <div>
        <h1>Sell Orders</h1>
        <div>Your address: {accounts[0]}</div>
        <div>{this.renderSections()}</div>
      </div>
    );
  }
}

export default SellOrders;
