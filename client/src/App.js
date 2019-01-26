import React, { Component } from "react";
import TokenExchangeContract from "./contracts/TokenExchange.json";
import getWeb3 from "./utils/getWeb3";
import { ethers, Contract } from "ethers";
import P2PTokenExchange from "./pages/p2pTokenExchange";

const SMART_CONTRACT_ADDR = "0x7662cC9FDc10337388438Ac474DA991C9b99A99A";

class App extends Component {
  state = { accounts: null, contract: null };

  componentDidMount = async () => {
    if (!window.web3 || !window.web3.currentProvider) return;
    const web3Provider = new ethers.providers.Web3Provider(
      window.web3.currentProvider
    );
    const signer = web3Provider.getSigner();

    try {
      const contract = await new Contract(
        SMART_CONTRACT_ADDR,
        TokenExchangeContract.abi,
        signer
      );
      const accounts = await web3Provider.listAccounts();
      this.setState({
        contract,
        accounts
      });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { contract, accounts } = this.state;
    if (!accounts || !contract) {
      return (
        <div style={{ textAlign: "center" }}>
          Loading Web3, accounts, and contract...
        </div>
      );
    }
    return <P2PTokenExchange contract={contract} accounts={accounts} />;
  }
}

export default App;
