const Proxy = artifacts.require("Proxy");
const Mortal = artifacts.require("Mortal");
const Pausable = artifacts.require("Pausable");
const PublicSafeDecimalMath = artifacts.require("PublicSafeDecimalMath");
const SafeDecimalMath = artifacts.require("SafeDecimalMath");
const TokenExchange = artifacts.require("TokenExchange");
const TokenExchangeState = artifacts.require("TokenExchangeState");

// Update values before deployment
const ZERO_ADDRESS = "0x" + "0".repeat(40);

const SEED_ETHUSD_PRICE = "110";
//const SEED_ETHUSD_PRICE = web3.utils.toWei("110"),

module.exports = async function(deployer, network, accounts) {
  const [deployerAccount] = accounts;

  // Note: This deployment script is not used on mainnet, it's only for testing deployments.

  // ----------------
  // Safe Decimal Math library
  // ----------------
  console.log("Deploying SafeDecimalMath...");
  await deployer.deploy(SafeDecimalMath, { from: deployerAccount });

  // The PublicSafeDecimalMath contract is not used in a standalone way on mainnet, this is for testing
  // ----------------
  // Public Safe Decimal Math Library
  // ----------------
  deployer.link(SafeDecimalMath, PublicSafeDecimalMath);
  await deployer.deploy(PublicSafeDecimalMath, { from: deployerAccount });

  // ----------------
  // TokenExchangeState
  // ----------------
  console.log("Deploying Storage...");
  // constructor(address _associatedContract)
  deployer.link(SafeDecimalMath, TokenExchangeState);
  const tokenExchangeState = await deployer.deploy(
    TokenExchangeState,
    ZERO_ADDRESS,
    {
      from: deployerAccount
    }
  );

  // ----------------
  // Proxy
  // ----------------
  console.log("Deploying Proxy...");
  const tokenExchangeProxy = await Proxy.new({ from: deployerAccount });

  // ----------------
  // TokenExchange
  // ----------------
  console.log("Deploying TokenExchange...");
  console.log("tokenExchangeProxy.address:", tokenExchangeProxy.address);
  console.log("tokenExchangeState.address:", tokenExchangeState.address);
  console.log("_usdToEthPrice:", SEED_ETHUSD_PRICE);
  // constructor(address payable _selfDestructBeneficiary, address payable _proxy, TokenExchangeState _externalState, uint _usdToEthPrice)
  deployer.link(SafeDecimalMath, TokenExchange);
  const tokenExchange = await deployer.deploy(
    TokenExchange,
    deployerAccount,
    tokenExchangeProxy.address,
    tokenExchangeState.address,
    SEED_ETHUSD_PRICE,
    {
      from: deployerAccount,
      gas: 5000000
    }
  );
  console.log(" Successfully deployed all contracts:");

  // ----------------
  // TokenExchangeState
  // ----------------
  console.log("Configuring External State...");
  tokenExchangeState.setAssociatedContract(tokenExchange.address);

  // ----------------
  // Proxy
  // ----------------
  console.log("Configuring Proxy...");
  tokenExchangeProxy.setTarget(tokenExchange.address);

  console.log(" Successfully Configured all contracts:");
};
