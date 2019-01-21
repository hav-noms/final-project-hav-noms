const Owned = artifacts.require("Owned");
const { ZERO_ADDRESS } = require("../utils/testUtils");

contract("Owned - Test contract deployment", function(accounts) {
  const [deployerAccount, account1] = accounts;

  it("should revert when owner parameter is passed the zero address", async function() {
    await assert.revert(Owned.new(ZERO_ADDRESS, { from: deployerAccount }));
  });

  // TODO check events on contract creation
  it("should set owner address on deployment", async function() {
    const ownedContractInstance = await Owned.new(account1, {
      from: deployerAccount
    });
    const owner = await ownedContractInstance.owner();
    assert.equal(owner, account1);
  });
});

contract("Owned - Pre deployed contract", async function(accounts) {
  const [account1, account2, account3, account4] = accounts.slice(1); // The first account is the deployerAccount above

  it("should nominate new owner when invoked by current contract owner", async function() {});

  it("should not accept new owner nomination when not invoked by nominated owner", async function() {});

  it("should accept new owner nomination when invoked by nominated owner", async function() {});
});
