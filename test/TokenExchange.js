const TokenExchange = artifacts.require("TokenExchange");

contract("TokenExchange - Test contract deployment", function(accounts) {
  const [deployerAccount, account1, account2, account3, account4] = accounts;

  // TODO check events on contract creation
  it("should set owner address on deployment", async function() {
    const selfDestructBeneficiary = deployerAccount;
    const proxyAddress = deployerAccount;
    const externalStateAddress = deployerAccount;
    const priceETHUSD = "100";

    const contractInstance = await TokenExchange.new(
      selfDestructBeneficiary,
      proxyAddress,
      externalStateAddress,
      priceETHUSD,
      {
        from: deployerAccount
      }
    );

    //const owner = await contractInstance.owner();
    //assert.equal(owner, deployerAccount);
  });

  it("should set the seed ETHUSD price from the contructor"); //, async function() {});

  it("should allow user to deposit an ERC20 token to sell"); //, async function() {});

  it("should allow user to withdraw their tokens for sale"); //, async function() {});

  it("should allow user to buy ERC20 Tokens for ETH"); //, async function() {});
});
