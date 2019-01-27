# P2P Token Exchange

A simple Peer 2 Peer Token exchange where;

- sellers create a trade listing, depositing their ERC20 tokens to trade into the contract.
- buyers pay ETH for the tokens and both actors are paid their coins.

This project focuses on the best patterns and practices implementation from the Consensys academy bootcamp. A lot of focus of the solution is the incorporation of important ethereum design patterns, protection mechanisms and the stretch goals that would be used in a real world decentralized solution. The project evaluation checklist provided below lists the completed tasks.

## User Journey

- Navigate to the REACT Dapp on IPFS https://ipfs.io/ipfs/Qmb.....
- See a list of available trades or
- Create a trade listing and deposit your ERC20 Tokens escrowed in the contract
- Buyers can select a trade to fulfil and send ETH to the contract and will be send your tokens, you will be sent the ETH
- Withdraw your trade listing and have your tokens returned to you

## Setup

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

You should see

Contract: Mortal
✓ should set owner address on deployment (56ms)
✓ should set selfDestructBeneficiary address on deployment
✓ should set the beneficiary address of this contract (51ms)
✓ should begin the self-destruction counter of this contract. (70ms)
✓ should Terminate and reset the self-destruction timer (97ms)
✓ should only be terminated after we reach the SELFDESTRUCT_DELAY (128ms)

Contract: Pausable - Contract killswitch safety mechanism
✓ should set owner address on deployment
✓ should setPaused to true and emit paused is set to true (51ms)
✓ should setPaused to false and paused is set to false (49ms)
✓ should setPaused to true and emit the correct event
✓ should setPaused to false and emit the correct event (66ms)

Contract: State - Tiny Contract only 3 tests
✓ should set owner address on deployment (49ms)
✓ should setAssociatedContract to the given address (47ms)
✓ should setAssociatedContract and emit the correct event

Contract: TokenExchange - Test contract deployment
When calling the constructor
✓ should set owner address on deployment
✓ should set proxy address on deployment
✓ should set external state address on deployment
✓ should set selfDestructBeneficiary address on deployment
✓ should set the seed ETHUSD price from the contructor
When a seller wants to create a trade
✓ should revert if the contract is paused (138ms)
✓ should revert if the amount of tokens being deposited is zero (98ms)
✓ should revert if the TokenListing (price) ethRate is zero (52ms)
✓ should revert if the address supplied is not a contract (52ms)
✓ should revert if the ERCToken Contract has not approved the amount to transfer (59ms)
When saving a tradelisting to the blockchain
✓ should emit the event TradeListingDeposit
✓ should create a tradeListing and be publicly accessable
✓ should create a tradeListing increase the tradeListingCount count
✓ should have a token balance of the amount of tokens we deposited
✓ should have reduced the balance at the depositors wallet address (54ms)
✓ should return a list of trades (131ms)
✓ should return a trade when calling getTrade(id) (165ms)
When a seller wants to withdraw a deposit
✓ should revert if the contract is paused (95ms)
✓ should revert if the deposit does not belong to the seller (52ms)
✓ should delete the trade listing (79ms)
✓ should return the sellers tokens deposited into the contract (79ms)
✓ should emit the event TradeListingWithdrawal (53ms)
When a buyer wants to execute a trade
✓ should revert if the contract is paused (75ms)
✓ should revert if the sender did not send enough ETH (49ms)
✓ should delete the trade listing (72ms)
✓ should send the buyer the correct amount of tokens (109ms)
✓ should send the seller the correct amount of ETH (79ms)
✓ should reduce the buyers ETH Balance (62ms)
✓ should emit the Exchange event (86ms)

43 passing (10s)

# Run the DAPP

1. Go into the client folder and run `npm install`
2. Run `npm run start`
3. Make sure that MetaMask is connected to localhost:8545

or run online

- https://ipfs.io/ipfs/Qmb.....

## Developer Bootcamp Final Project Evaluation Form

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
  - [o] Testing on Ropsten;
  - [o] Testing on Kovan;
  - [ ] Testing on Rinkeby;
- [x] You should be able to visit a URL (can be localhost) and interact with the application:
  - [x] Display the current account;
  - [x] Sign transactions using MetaMask;
  - [x] Reflect updates to the conract state

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
  - [ ] Why not others?

### Security Tools / Common Attacks

- [x] Explain what measures you have taken to ensure that your contracts are not susceptible to common attacks.

### Use a Library or Extend a Contract

- [x] At least one of the project contracts includes an import from a library/contract or an ethPM package.

### Deployment

- [o] Deploy your application onto one of the test networks.
- [o] Include a document called [deployed_addresses.txt](deployed_addresses.txt) that describes where your contracts live (which testnet and address).
- [o] Students can verify their source code using Etherscan https://etherscan.io/verifyContract for the appropriate testnet.
- [o] Evaluators can check by getting the provided contract ABI and calling a function on the deployed contract at https://www.myetherwallet.com/#contracts or checking the verification on Etherscan.
- [ ] Serve the UI from IPFS or a traditional web server

### Additional

- [x] Smart Contract code should be commented according to the specs in the documentation https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments"

### Stretch

- [x] Implement an upgradable design pattern
- [x] Oracle
- [x] Ethereum Name Service - a name registered on the ENS resolves to the contract, verifiable on `https://ropsten.etherscan.io/<contract_name>` Auction started for p2ptokenexchange
      https://ropsten.etherscan.io/tx/0x96f6e371e123003a55069387732a51c85781ac5a33218fd9dcfdbdbc89b6e651
- [o] IPFS - users can dynamically upload documents to IPFS that are referenced via their smart contract.
- [ ] Project includes one smart contract implemented in LLL / Vyper

[ens]: ens_bid.png
