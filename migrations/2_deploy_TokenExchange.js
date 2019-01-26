const Proxy = artifacts.require("Proxy");
const Mortal = artifacts.require("Mortal");
const Pausable = artifacts.require("Pausable");
const State = artifacts.require("State");
const PublicSafeDecimalMath = artifacts.require("PublicSafeDecimalMath");
const SafeDecimalMath = artifacts.require("SafeDecimalMath");
const ETHPriceTicker = artifacts.require("ETHPriceTicker");
const TokenExchange = artifacts.require("TokenExchange");
const TokenExchangeState = artifacts.require("TokenExchangeState");
const ShartCoin = artifacts.require("ShartCoin");

// Update values before deployment
const ZERO_ADDRESS = "0x" + "0".repeat(40);

const SEED_ETHUSD_PRICE = "110";
//const SEED_ETHUSD_PRICE = web3.utils.toWei("110"),

module.exports = async function(deployer, network, accounts) {
  const [deployerAccount] = accounts;

  // Note: This deployment script is not used on mainnet, it's only for testing deployments.
  console.log("Network: ", network);

  // ----------------
  // Safe Decimal Math library
  // ----------------
  console.log("Deploying SafeDecimalMath...");
  await deployer.deploy(SafeDecimalMath, { from: deployerAccount });

  if (network == "development") {
    console.log(
      "This is the development network so we're going to deploy all the helper contracts for uni testing"
    );

    // The PublicSafeDecimalMath contract is not used in a standalone way on mainnet, this is for testing
    // ----------------
    // Public Safe Decimal Math Library
    // ----------------
    deployer.link(SafeDecimalMath, PublicSafeDecimalMath);
    await deployer.deploy(PublicSafeDecimalMath, { from: deployerAccount });

    // ----------------
    // Mortal contract is not used in a standalone way on mainnet, this is for unit testing
    // ----------------
    console.log("Deploy Mortal for testing only");
    await deployer.deploy(Mortal, deployerAccount, { from: deployerAccount });

    // ----------------
    // Pausable contract is not used in a standalone way on mainnet, this is for unit testing
    // ----------------
    console.log("Deploy Pausable for testing only");
    await deployer.deploy(Pausable, { from: deployerAccount });

    // ----------------
    // State contract is not used in a standalone way on mainnet, this is for unit testing
    // ----------------
    console.log("Deploy State for testing only");
    await deployer.deploy(State, ZERO_ADDRESS, { from: deployerAccount });

    // ----------------
    // ETHPriceTicker contract is not used in a standalone way on mainnet, this is for unit testing
    // ----------------
    console.log("Deploy ETHPriceTicker for testing only");
    await deployer.deploy(ETHPriceTicker, { from: deployerAccount });
  }

  // ----------------
  // ShartCoin
  // ----------------
  console.log("Deploying Test ERC20 Token...");
  const shartCoin = await deployer.deploy(ShartCoin, { from: deployerAccount });
  console.log("ShartCoin.address:", shartCoin.address);
  console.log("deployerAccount:", deployerAccount);

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
  deployer.link(SafeDecimalMath, TokenExchange);
  const tokenExchange = await deployer.deploy(
    TokenExchange,
    deployerAccount,
    tokenExchangeProxy.address,
    tokenExchangeState.address,
    SEED_ETHUSD_PRICE,
    {
      from: deployerAccount,
      gas: 8000000
    }
  );
  console.log("tokenExchange.address:", tokenExchange.address);
  console.log("Successfully deployed all contracts:");

  // ----------------
  // CONFIGURE ENVIRONMENT
  // ----------------
  console.log("Wiring up all contracts together");

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

  console.log("Successfully Configured all contracts");
};
