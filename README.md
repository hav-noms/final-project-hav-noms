# P2P Token Exchange

A simple Peer 2 Peer Token exchange where;

- sellers create a trade listing, depositing their ERC20 tokens to trade into the contract.
- buyers pay ETH for the tokens and both actors are paid their coins.

This project focuses on the best patterns and practices implementation from the Consensys academy bootcamp. A lot of focus of the solution is the incorporation of important ethereum design patterns, protection mechanisms and the stretch goals that would be used in a real world decentralized solution. The project evaluation checklist provided below lists the completed tasks.

## User Journey

- Navigate to the REACT Dapp on IPFS https://ipfs.io/ipfs/QmdXFKKok8i3E26V7mW7ZPPxqDzvMAjXywTwf8Rk8JT9fu
- See a list of available trades or
- Create a trade listing and deposit your ERC20 Tokens escrowed in the contract
- Buyers can select a trade to fulfil and send ETH to the contract and will be send your tokens, you will be sent the ETH
- Withdraw your trade listing and have your tokens returned to you

![DApp ui](/imgs/ui.png "Dapp UI")

## Setup

Requirements:

- Truffle
- Node Package Manager (npm)
- Ganache CLI
- MetaMask

## Steps:

## Run Tests

1. Clone the repo and cd into the folder
1. Install all the dependencies for the Truffle environment (Zeppelin library, ethers.js for the tests...etc).
   ```
   $ npm install
   ```
1. Start a local blockchain with Ganache. Make sure it is set on port 8545 and set the block gas limit to 8,000,000 becuase the exchange contract is too big to deploy
   ```
   $ ganache-cli -p 8545 -l 8000000
   ```
1. Run `truffle test`

You should see

![tests](/imgs/truffle_tests.png "Truffle Tests")

# Run the DAPP

Steps:

1. From ganache, grab the private key of the first account and add it to metamask
   ![private keys](/imgs/ganache_private_keys.png "Ganache Accounts Private keys")

1. Connect Metamask to localhost
   ![MM](/imgs/metamask_localhost.png "MetaMask Localhost")

1. in MetaMask add the private key of the first account in ganache
   ![MM](/imgs/metamask_import_first_account.png "MetaMask Account import")

1. Run
   ```
   $ truffle migrate
   ```
1. Grab the ShartCoin address from ganache
   ![SHT](/imgs/ShartCoin_address.png "Shart Coin migrated address")
1. and add the custom token to metamask.
   ![SHT](/imgs/metamask_add_sht.png "Shart Coin Add Token")
1. You should see you have 100B SHT
   ![SHT](/imgs/metamask_100BSHT.png "Shart Coin Balance")

1. Go the `client` directory and install all the app dependencies.
   ```
   $ cd client
   $ npm install
   ```
1. As this app is using ether.js the `Contract` constructor will need the contract address. You will need to update the address in `App.js`. Update `SMART_CONTRACT_ADDR` to point to your local deployed address
   ![contract address](/imgs/TokenExchange_address.png "Deployed TokenExchange Adress")

   ```
   const SMART_CONTRACT_ADDR_ROPSTEN = "0xf371b912b26d3c9220e4e7cbc312591e6074721a";
   const SMART_CONTRACT_ADDR_LOCAL = "";
   const SMART_CONTRACT_ENS = "p2ptokenexchange.eth";

   // Set this const to your chosen ENV
   const SMART_CONTRACT_ADDR = SMART_CONTRACT_ADDR_ROPSTEN;
   ```

1. Start the React app.
   ```
   $ npm run start
   ```
1. Alternatively you can test the app with the ropsten deployed addresses

Ropsten:

- TokenExchange: https://ropsten.etherscan.io/address/0xF371b912B26d3c9220e4e7cbC312591E6074721A
- TokenExchange ABI https://gist.github.com/hav-noms/4da6852c9656e10217cfda83f998bdd3
- Proxy: https://ropsten.etherscan.io/address/0x5f05f53A0E3E19A0de45b0Ac85100e3e61aE7EE4
- ShartCoin: https://ropsten.etherscan.io/token/0x651d56e6cCe013cf08C32b7E53cD2A1cbf103976
- TokenExchangeState: https://ropsten.etherscan.io/address/0xF371b912B26d3c9220e4e7cbC312591E6074721A

Rinkeby:

- I did not deploy to rinkeby as ENS is not available on Rikeby only Ropsten

## Deployed versions of the dApp

Ropsten: https://p2ptokenexchange-ropsten.netlify.com

To test the ROPSTEN connected DAPP you can buy the existing SHT coin tokens for ROPSTEN ETH and then sell them back to the exchange to create a listing. Or send any ERC20 on ROPSTEN to create a listing. Or ping me with your MM wallet address and I'll send you some SHT.

IPFS: https://ipfs.io/ipfs/QmdXFKKok8i3E26V7mW7ZPPxqDzvMAjXywTwf8Rk8JT9fu

## Developer Bootcamp Final Project Evaluation Checklist

- [x] A README.md that explains the project
- [x] What does it do?
- [x] How to set it up.
- [x] How to run a local development server.
- [x] It should be a [Truffle project](https://truffleframework.com/docs/truffle/getting-started/creating-a-project).
- [x] All contracts should be in a `contracts` directory.
- [x] `truffle compile` should successfully compile contracts.
- [x] Migration contract and migration scripts should work.
- [x] `truffle migrate` should successfully migrate contracts to a locally running `ganache-cli` test blockchain on port `8454`.
- [x] All tests should be in a `tests` directory.
- [x] `truffle test` should migrate contracts and run the tests.
- [x] Smart contract code should be commented according to the [specs in the documentation](https://solidity.readthedocs.io/en/v0.5.2/layout-of-source-files.html#comments).
- [x] Create at least 5 tests for each smart contract.
- [x] Write a sentence or two explaining what the tests are covering, and explain why those tests were written.
- [x] A development server to serve the front-end interface of the application.
- [x] A document [design_pattern_decisions.md](design_pattern_decisions.md) that explains the design patterns chosen.
- [x] A document [avoiding_common_attacks.md](avoiding_common_attacks.md) that explains what measures were taken to ensure that the contracts are not susceptible to common attacks.
- [x] Implement/use a library or an EthPM package.

## Project Requirements

### User Interface

- [x] Run the dapp on a development server locally for testing and grading.
  - [x] Testing on Ropsten; (I chose ropsten instead of rinkeby becuase there is no ENS on rinkeby)
- [x] You should be able to visit a URL (can be localhost) and interact with the application
  - [x] localhost via `npm run start` in `client` dir
  - [x] https://p2ptokenexchange-ropsten.netlify.com
- [x] Display the current account;
- [x] Sign transactions using MetaMask;
- [x] Reflect updates to the contract state

### Testing

- [x] Write 5 tests for each contract you wrote in Javascript;
- [x] Tests are properly structured (ie sets up context, executes a call on the function to be tested, and verifies the result is correct)
- [x] Explain why you wrote those tests in code comments;
- [x] Tests provide adequate coverage for the contracts
- [x] All Tests pass with `truffle test`.

### Design Patterns

- [x] Implement a circuit breaker (emergency stop) pattern.
- [x] What other design patterns have you used / not used?
  - [x] Why did you choose the patterns that you did?

### Security Tools / Common Attacks

- [x] Explain what measures you have taken to ensure that your contracts are not susceptible to common attacks.

### Use a Library or Extend a Contract

- [x] At least one of the project contracts includes an import from a library/contract or an ethPM package.

### Deployment

- [x] Deploy your application onto one of the test networks.
- [x] Include a document called [deployed_addresses.txt](deployed_addresses.txt) that describes where your contracts live (which testnet and address).
- [x] Students can verify their source code using Etherscan https://etherscan.io/verifyContract for the appropriate testnet.
  - [x] ROPSTEN VERIFIED TokenExchange https://ropsten.etherscan.io/address/0xf371b912b26d3c9220e4e7cbc312591e6074721a#code
  - [x] ROPSTEN VERIFIED Proxy https://ropsten.etherscan.io/address/0x5f05f53a0e3e19a0de45b0ac85100e3e61ae7ee4#code
  - [x] ROPSTEN VERIFIED TokenExchangeState https://ropsten.etherscan.io/address/0x3b37170210ffab1e7d87e21d273aa1faa7dc8509#code
  - [x] ROPSTEN VERIFIED ShartCoin https://ropsten.etherscan.io/address/0x651d56e6cCe013cf08C32b7E53cD2A1cbf103976#code
- [x] Evaluators can check by getting the provided contract ABI and calling a function on the deployed contract at https://www.myetherwallet.com/#contracts or checking the verification on Etherscan.
- [x] Serve the UI from IPFS or a traditional web server
  - [x] Traditional Web Server https://p2ptokenexchange-ropsten.netlify.com
  - [x] IPFS https://ipfs.io/ipfs/QmdXFKKok8i3E26V7mW7ZPPxqDzvMAjXywTwf8Rk8JT9fu/

### Additional

- [x] Smart Contract code should be commented according to the specs in the documentation https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments"

### Stretch

- [x] Implement an upgradable design pattern
  - [x] implemented proxy and external storage pattern
- [x] Oracle
  - [x] Implemented Oracalize for ETHUSD pricing
- [x] IPFS
  - [x] Add DAPP to IPFS https://ipfs.io/ipfs/QmdXFKKok8i3E26V7mW7ZPPxqDzvMAjXywTwf8Rk8JT9fu
        added QmcwoNLGnaTNdb9VTfySRoUVtQZCeaJzZsxMsFLkQotEVg build/asset-manifest.json
        added QmcFc6EPhavNSfdjG8byaxxV6KtHZvnDwYXLHvyJQPp3uN build/favicon.ico
        added QmSpVu85Qj9dzdcC1AD7YR4bBYjNydqpp3HwSsfGVfMvYW build/index.html
        added QmfKqCqGsesAk1JhovJCQajk8awxuqjDPc8QnHa39oDx6g build/manifest.json
        added QmVVkxzmHY5ReSoQ9GX4RobwihGKsfrzY8E7inoFbjGbEg build/precache-manifest.cfdc5fea3d15a319614b8b50fd809d3d.js
        added QmQ1Zd5fuxxTTavLyhS5G479h1CkMvY2puuGY46282Z17x build/service-worker.js
        added QmSt4HmAP8H7z8jY7Ydf2PeogMNm14VENGLaXQSDxsmMZN build/static/css/main.f5d2a5b6.chunk.css
        added QmQYh4kdU8Ctxaib7f7MTYGrsWcmTJfj9RvhkideTAVPzw build/static/css/main.f5d2a5b6.chunk.css.map
        added QmexaqtgBN1fUcoECoMbrGjbQU8v7jSEsWnj6MKwYbYgvB build/static/js/1.34cad1e0.chunk.js
        added QmXVBvearMWSfvw62B4etaFpGBx1cKX5pLLbLccgCwhtH2 build/static/js/1.34cad1e0.chunk.js.map
        added Qme9z3JjbFdfRpYNH84HxQukBn18GsRQNS9rE2se7ty9yc build/static/js/main.47c69635.chunk.js
        added QmeYTCfKi4Lv3fRrzNvre7wxz8iEztbcwfZ4CSgSZoPEb7 build/static/js/main.47c69635.chunk.js.map
        added QmVfzdU72f7TuF196YVC629gf2GT18Z9dRhua9oahKFFAR build/static/js/runtime~main.4a686d48.js
        added QmSYyfTZ5yeX113i31TiTr3cov8jzGA54JRxKiFzPrqEMp build/static/js/runtime~main.4a686d48.js.map
        added QmPphPgkWdFQF6NcAjXivW68UvUAL5Ui5UihKr2CvLjpKi build/static/css
        added QmcL7Eo15EQAqnzzcmrWn1sWMqY9VPFKpZbBKgTKbLUUgZ build/static/js
        added QmdJcRert6m7eVj9KFVbkSVSyn9U4De1LxMvp8jFV36FR8 build/static
        added QmdXFKKok8i3E26V7mW7ZPPxqDzvMAjXywTwf8Rk8JT9fu build
- [x] Ethereum Name Service - a name registered on the ENS resolves to the contract

  - [x] ENS Auction created for p2ptokenexchange.eth https://ropsten.etherscan.io/tx/0x96f6e371e123003a55069387732a51c85781ac5a33218fd9dcfdbdbc89b6e651
  - [x] ENS unseal Bid https://ropsten.etherscan.io/tx/0xc440a13409a0bb8c2fde4bb2ed0643916a4ef221d852fa2a58c9bf32e79a98b9
  - [x] ENS Auction finalized https://ropsten.etherscan.io/tx/0x695147dcfd3f86f9eb6652595a0baa287f010d463909afc6a5efa4bac9a01f2d
  - [x] ENS Set Public Resolver 0xF371b912B26d3c9220e4e7cbC312591E6074721A https://ropsten.etherscan.io/tx/0x04221a576a65a676c51ce27cbd560eb118f077a9e6d3bfb8c2888afdd5fc550c
  - [x] ENS Set Address to https://ropsten.etherscan.io/tx/0xdb80c4844ec0d08eb6eabe390bde947128f96fbe9d7727cf1351fb9b36cc8340

  - [x] ENS name p2ptokenexchange.eth verifiable on `https://ropsten.etherscan.io/p2ptokenexchange.eth`

- [ ] Vyper Contract

![ENS Auction](/imgs/ens_bid.png "ENS Auction")
![ENS Config](/imgs/ens_config.png "ENS Config")
![ENS Address Set](/imgs/ens_ropsten_address_set.png "ENS Set to Ropsten")
