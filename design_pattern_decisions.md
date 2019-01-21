# Design Pattern Decisions

design_pattern_desicions.md adequately describes the design patterns implemented in the project.

- [x] Proxy - The proxy pattern was implemented to allow the core Business Logic Contract to be upgradable without having to worry about; - users having update their contract / token address - all token balances stored in an external state Contract
- [ ] Owned - Protect the system with owner only admin functions
- [ ] Mortal - ownerOnly functionality to allow deprecated contracts to be killed/selfdestruct
- [ ] Pausable - ownerOnly Circuit Breaker to allow the Smart Contract sysm to stop incase of a known vulnerability.

Owned <- Mortal
Owned <- Pausable
Owned <- Proxyable
Owned <- Proxy
Owned <- State

TokenExchangeState <- State
TokenExchange <- ExternalState, Proxyable, Mortal, Pausable

## Deployment Architecture

Proxy -> TokenExchange -> TokenExchangeState

Users connect to the proxy address
Fallback function routes all calls the the underlying target contract.
Business logic in target contract is executed and all state is stored in the
ExternalStateContract

### Upgrade procedure

- Deploy new version of TokenExchange Contract with params (address proxy, address TokenExchangeState, address oracle)
- Pause existing TokenExchange Contraect
- Pause TokenExchangeState Contract
- Set the associatedContract of the TokenExchangeState to the new TokenExchange address
- Set the target of the Proxy to the new TokenExchange address
- UnPause TokenExchange Contract
- UnPause TokenExchangeState Contract
