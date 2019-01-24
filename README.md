# P2P Token Exchange

The Smart Contract is a simple Peer 2 Peer ERC Token exchange where buyers pay ETH for the tokens.

This project focuses on the best patterns and practisess implementation from the Consensys academy bootcamp. Rather than focusing on an arbitrary Smart contract a lot of focus of the solution is the incorporation of useful design patterns and the stretch goals that would be used in a realworld implemenation.

## User Journey

- Navigate to the REACT Dapp on IPFS https://ipfs.io/ipfs/Qmb.....
- See a list of available trades or
- Create a trade listing and deposit your ERC20 Tokens escrowed in the contract
- Buyers can select a trade to fulfill and send ETH to the contract and will be send your tokens, you will be sent the ETH
- Withdraw your trade listing and have your tokens returned to you

## Setup

Requirements:

Requirements:

- Truffle
- Node Package Manager (npm)
- Ganache CLI
- MetaMask

## Steps:

## Run Tests

1. Clone the repo
2. Go into the root directory and run `npm install`
3. Run Ganache CLI
4. Run `truffle test`

# Run the DAPP

1. Go into the client folder and run `npm install`
2. Run `npm run start`
3. Make sure that MetaMask is connected to localhost:8545

## Developer Bootcamp Final Project Evaluation Form

- [ ] A README.md that explains the project
  - [ ] What does it do?
  - [ ] How to set it up.
    - [ ] How to run a local development server.
- [ ] It should be a [Truffle project](https://truffleframework.com/docs/truffle/getting-started/creating-a-project).
  - [ ] All contracts should be in a `contracts` directory.
    - [ ] `truffle compile` should successfully compile contracts.
  - [ ] Migration contract and migration scripts should work.
    - [ ] `truffle migrate` should successfully migrate contracts to a locally running `ganache-cli` test blockchain on port `8454`.
  - [ ] All tests should be in a `tests` directory.
    - [ ] `truffle test` should migrate contracts and run the tests.
- [ ] Smart contract code should be commented according to the [specs in the documentation](https://solidity.readthedocs.io/en/v0.5.2/layout-of-source-files.html#comments).
- [ ] Create at least 5 tests for each smart contract.
  - [ ] Write a sentence or two explaining what the tests are covering, and explain why those tests were written.
- [ ] A development server to serve the front-end interface of the application.
  - [ ] It can be something as simple as the [lite-server](https://www.npmjs.com/package/lite-server) used in the [Truffle Pet Shop tutorial](https://truffleframework.com/tutorials/pet-shop).
- [ ] A document [design_pattern_decisions.md](design_pattern_decisions.md) that explains the design patterns chosen.
- [ ] A document [avoiding_common_attacks.md](avoiding_common_attacks.md) that explains what measures were taken to ensure that the contracts are not susceptible to common attacks.
- [ ] Implement/use a library or an EthPM package.
  - [ ] If the project does not require a library or an EthPM package, demonstrate how it would do that in a contract called `LibraryDemo.sol`.
- [ ] Develop your application and run the other projects during evaluation in a VirtualBox VM running Ubuntu 16.04 to reduce the chances of runtime environment variables.

## Project Requirements

### User Interface

- [ ] Run the dapp on a development server locally for testing and grading.
  - [ ] Testing on Rinkeby;
- [ ] You should be able to visit a URL (can be localhost) and interact with the application:
  - [ ] Display the current account;
  - [ ] Sign transactions using MetaMask;
  - [ ] Reflect updates to the conract state

### Testing

- [ ] Write 5 tests for each contract you wrote in Jvascript;
- [ ] Tests are properly structured (ie sets up context, executes a call on the function to be tested, and verifies the result is correct)
- [ ] Explain why you wrote those tests in code comments;
- [ ] Tests provide adequate coverage for the contracts
- [ ] All Tests pass with `truffle test`.

### Design Patterns

- [x] Implement a circuit breaker (emergency stop) pattern.
- [x] What other design patterns have you used / not used?
  - [x] Why did you choose the patterns that you did?
  - [ ] Why not others?

### Security Tools / Common Attacks

- [o] Explain what measures you have taken to ensure that your contracts are not susceptible to common attacks.

### Use a Library or Extend a Contract

- [o] At least one of the project contracts includes an import from a library/contract or an ethPM package.

### Deployment

- [o] Deploy your application onto one of the test networks.
- [o] Include a document called [deployed_addresses.txt](deployed_addresses.txt) that describes where your contracts live (which testnet and address).
- [o] Students can verify their source code using Etherscan https://etherscan.io/verifyContract for the appropriate testnet.
- [o] Evaluators can check by getting the provided contract ABI and calling a function on the deployed contract at https://www.myetherwallet.com/#contracts or checking the verification on Etherscan.
- [o] Serve the UI from IPFS or a traditional web server

### Aditional

- [o] Smart Contract code should be commented according to the specs in the documentation https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments"

### Stretch

- [o] Implement an upgradable design pattern
- [o] Oracle
- [o] Ethereum Name Service - a name registered on the ENS resolves to the contract, verifiable on `https://rinkeby.etherscan.io/<contract_name>`
- [o] IPFS - users can dynamically upload documents to IPFS that are referenced via their smart contract.
- [ ] Project includes one smart contract implemented in LLL / Vyper
