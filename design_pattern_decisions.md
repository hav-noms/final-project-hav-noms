# Design Pattern Decisions

design_pattern_desicions.md adequately describes the design patterns implemented in the project.

- [x] Proxy - Proxy pattern allows the core business logic smart contract to be upgradable without having to worry about;
  - users/dapps having to update their contract / token addresses on every upgrade
  - all token balances stored in an external state contract not requiring a migration or token swap or lost/burned state
- [x] Owned - Protect the critical system admin functions with owner only modifers
- [x] Mortal - ownerOnly functionality to allow deprecated contracts to be killed/selfdestructed as part of the upgrade mechanism
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
