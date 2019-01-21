const Owned = artifacts.require('Owned');
const Proxy = artifacts.require('Proxy');
const Mortal = artifacts.require('Mortal');
const PublicSafeDecimalMath = artifacts.require('PublicSafeDecimalMath');
const SafeDecimalMath = artifacts.require('SafeDecimalMath');
const TokenExchange = artifacts.require('TokenExchange');
const TokenExchangeState = artifacts.require('TokenExchangeState');

module.exports = async function(deployer, network, accounts) {
	const [deployerAccount, owner, oracle, feeAuthority, fundsWallet] = accounts;

	// Note: This deployment script is not used on mainnet, it's only for testing deployments.

	// The Owned contract is not used in a standalone way on mainnet, this is for testing
	// ----------------
	// Owned
	// ----------------
	await deployer.deploy(Owned, owner, { from: deployerAccount });

	// ----------------
	// Safe Decimal Math library
	// ----------------
	console.log('Deploying SafeDecimalMath...');
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
	console.log('Deploying TokenExchangeState...');
	// constructor(address _owner, address _associatedContract)
	deployer.link(SafeDecimalMath, TokenExchangeState);
	const tokenExchangeState = await deployer.deploy(TokenExchangeState, owner, ZERO_ADDRESS, {
		from: deployerAccount,
	});

	// ----------------
	// TokenExchange Proxy
	// ----------------
	console.log('Deploying TokenExchange Proxy...');
	// constructor(address _owner)
	const tokenExchangeProxy = await Proxy.new(owner, { from: deployerAccount });

    // ----------------
	// TokenExchange
	// ----------------
	console.log('Deploying TokenExchange...');
	deployer.link(SafeDecimalMath, TokenExchange);
	const tokenExchange = await deployer.deploy(
		Synthetix,
		synthetixProxy.address,
		synthetixTokenState.address,
		synthetixState.address,
		owner,
		ExchangeRates.address,
		FeePool.address,
		{
			from: deployerAccount,
			gas: 8000000,
		}
	);
