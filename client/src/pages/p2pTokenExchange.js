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

  async componentDidMount() {
    const { contract, accounts } = this.props;
  }

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
    const { contract, signer, accounts, erc20DetailedABI } = this.props;
    return (
      <div className="p2pTokenExchange">
        <h1>Decentralized p2p Token Exchange</h1>
        <h3>Your address: {accounts[0]}</h3>
        {/* <div>
          <button onClick={this.setCurrentView("index")}>
            Tokens For Sale
          </button>
          <button onClick={this.setCurrentView("createListing")}>
            Sell Your Tokes
          </button>
        </div> */}
        {this.renderPageContent()}
      </div>
    );
  }
}

export default P2PTokenExchange;
