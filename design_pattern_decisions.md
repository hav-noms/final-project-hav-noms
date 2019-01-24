# Design Pattern Decisions

- [x] Proxy - Proxy pattern allows the core business logic smart contract to be upgradable without having to worry about;
  - users/dapps having to update their contract / token addresses on every upgrade
  - all token balances stored in an external state contract not requiring a migration or token swap or lost/burned state
- [x] Owned - Protect the critical system admin functions with owner only modifers. I've used my own owned instead of open zeplins to have full control over the code on this one.
- [x] Mortal - ownerOnly functionality to allow deprecated contracts to be killed/selfdestructed as part of the upgrade mechanism.
- [x] Pausable - ownerOnly Circuit Breaker to allow the Smart Contract system to be stop incase of a known vulnerability and for upgrades

## Inheritance Map

### Abstract Contracts

Owned <- Mortal
Owned <- Pausable
Owned <- Proxyable
Owned <- State

### Deployable Contracts

Proxy -> Owned
TokenExchangeState -> State
TokenExchange -> ExternalState, Proxyable, Mortal, Pausable

## Deployment Architecture

Proxy <--> TokenExchange <--> TokenExchangeState

Users/Dapps connect to the proxy address using the target contracts ABI.
Proxy fallback function routes all calls the the target contract.
Business logic in target contract is executed and all state is stored in the
ExternalState Contract

### Upgrade procedure

- Deploy new version of TokenExchange Contract with params (address proxy, address externalState, address oracle)
- Pause existing TokenExchange Contraect
- Pause TokenExchangeState Contract
- Set the associatedContract of the TokenExchangeState to the new TokenExchange address
- Set the target of the Proxy to the new TokenExchange address
- UnPause TokenExchange Contract
- UnPause TokenExchangeState Contract

## Implementation notes

### Ownable

I had used my own version of ownable I use and subbed it out for openzeplins. I wished I hadnt. This biggest difference I'm missing now is the one I usually use for work takes the owner as a constructor parameter for setup. allowing you to deploy to mainnet with the owner already set rather than having to call transfer ownership. The reason why this is better is you can deploy a system for a client straight to the multisig without having to do all the transfer accept calls. especially is the system is complex and has a lot of deployed contracts. I beleive this is a better pattern than the owne openzepplin provides.

### Storage patterns

Referencing this for solidity storage patterns
https://ethereum.stackexchange.com/questions/13167/are-there-well-solved-and-simple-storage-patterns-for-solidity

I've used a simple solution where I store the struct in the mapping and keep and array of ids to be able to iterate on the mapping. This is shadowing. If this were to be an actualy thing on MAINNET I would have
implemented the "Mapped Structs with Delete-enabled Index"

However I chose the simplest solution as this project is more about the entirety of best patterns and practices for building smart contracts on ethereum.
