import React, { Component } from "react";
import Stores from "../components/stores";

import "./p2pTokenExchange.css";

class P2PTokenExchange extends Component {
  constructor() {
    super();
    this.state = {
      activeView: "index",
      isStoreOwner: false,
      isAdmin: false
    };
    this.setCurrentView = this.setCurrentView.bind(this);
  }

  async componentDidMount() {
    const { contract, accounts } = this.props;
    const [isAdmin, isStoreOwner] = await Promise.all([
      contract.administrators(accounts[0]),
      contract.storeOwners(accounts[0])
    ]);

    this.state({ isStoreOwner, isAdmin });
  }

  setCurrentView(view) {
    return () => {
      this.setState({ activeView: view });
    };
  }

  renderPageContent() {
    const { activeView } = this.state;
    const { contract, accounts } = this.props;
    switch (activeView) {
      case "index":
        return <Stores contract={contract} accounts={accounts} />;
      default:
        return <Stores />;
    }
  }

  render() {
    const { accounts } = this.props;
    return (
      <div className="p2pTokenExchange">
        <h1>Decentralized p2p Token Exchange</h1>
        <div>
          <button onClick={this.setCurrentView("index")}>Index</button>
          <button onClick={this.setCurrentView("admin")}>Admin</button>
        </div>
        {this.renderPageContent()}
      </div>
    );
  }
}

export default P2PTokenExchange;
