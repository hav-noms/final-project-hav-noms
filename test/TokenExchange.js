const TokenExchange = artifacts.require("TokenExchange");

contract("TokenExchange - Test contract deployment", function(accounts) {
  const [deployerAccount, account1] = accounts;

  it("should revert when owner parameter is passed the zero address", async function() {
    await assert.revert(
      TokenExchange.new(ZERO_ADDRESS, { from: deployerAccount })
    );
  });

  // TODO check events on contract creation
  it("should set owner address on deployment", async function() {
    const contractInstance = await Mortal.new(account1, {
      from: deployerAccount
    });
    const owner = await contractInstance.owner();
    assert.equal(owner, account1);
  });
});

contract("TokenExchange - Pre deployed contract", async function(accounts) {
  const [account1, account2, account3, account4] = accounts.slice(1); // The first account is the deployerAccount above

  it("should set the seed ETHUSD price from the contructor", async function() {});

  it("should allow user to deposit an ERC20 token to sell", async function() {});

  it("should allow user to withdraw their tokens for sale", async function() {});

  it("should allow user to buy ERC20 Tokens for ETH", async function() {});
});
