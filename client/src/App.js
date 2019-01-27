import React, { Component } from "react";
import TokenExchangeContract from "./contracts/TokenExchange.json";
import ERC20Detailed from "./contracts/ERC20Detailed.json";
//import getWeb3 from "./utils/getWeb3"; ethers instead
import { ethers, Contract } from "ethers";
import P2PTokenExchange from "./pages/p2pTokenExchange";

const SMART_CONTRACT_ADDR = "0x4BF3D0A8f10178B184bd4815AE8c23B3afcCc358";
const SMART_CONTRACT_ENS = "p2ptokenexchange.eth";

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
        //SMART_CONTRACT_ENS
        SMART_CONTRACT_ADDR,
        TokenExchangeContract.abi,
        signer
      );
      const accounts = await web3Provider.listAccounts();
      this.setState({
        contract,
        signer,
        accounts
      });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { contract, signer, accounts } = this.state;
    if (!accounts || !contract) {
      return (
        <div style={{ textAlign: "center" }}>
          Loading Web3, accounts, and contract...
        </div>
      );
    }
    return (
      <P2PTokenExchange
        contract={contract}
        signer={signer}
        erc20DetailedABI={ERC20Detailed.abi}
        accounts={accounts}
      />
    );
  }
}

export default App;
