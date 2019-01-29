import React, { Component } from "react";
import SellOrders from "../components/sellOrders";

import "./p2pTokenExchange.css";

class P2PTokenExchange extends Component {
  constructor() {
    super();
    this.state = {
      activeView: "index"
    };
    this.setCurrentView = this.setCurrentView.bind(this);
  }

  async componentDidMount() {}

  setCurrentView(view) {
    return () => {
      this.setState({ activeView: view });
    };
  }

  renderPageContent() {
    const { activeView } = this.state;
    const { contract, accounts, signer, erc20DetailedABI } = this.props;
    switch (activeView) {
      case "index":
        return (
          <SellOrders
            contract={contract}
            accounts={accounts}
            signer={signer}
            erc20DetailedABI={erc20DetailedABI}
          />
        );
      default:
        return <SellOrders />;
    }
  }

  render() {
    const { accounts } = this.props;
    return (
      <div className="p2pTokenExchange">
        <h1>Decentralized p2p Token Exchange</h1>
        <span>Sell your tokens for ETH. No fees. No middle man.</span>
        <h3>
          Your address:&nbsp;
          <a href={`https://ropsten.etherscan.io/address/${accounts[0]}`}>
            {accounts[0]}
          </a>
        </h3>
        {this.renderPageContent()}
      </div>
    );
  }
}

export default P2PTokenExchange;
