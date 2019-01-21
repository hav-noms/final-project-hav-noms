const Mortal = artifacts.require("Mortal");

contract("Mortal - Test contract deployment", function(accounts) {
  const [deployerAccount, account1] = accounts;

  it("should revert when owner parameter is passed the zero address", async function() {
    await assert.revert(Mortal.new(ZERO_ADDRESS, { from: deployerAccount }));
  });

  // TODO check events on contract creation
  it("should set owner address on deployment", async function() {
    const mortalContractInstance = await Mortal.new(account1, {
      from: deployerAccount
    });
    const owner = await mortalContractInstance.owner();
    assert.equal(owner, account1);
  });
});

contract("Mortal - Pre deployed contract", async function(accounts) {
  const [account1, account2, account3, account4] = accounts.slice(1); // The first account is the deployerAccount above

  it("should Set the beneficiary address of this contract", async function() {});

  it("should Begin the self-destruction counter of this contract.", async function() {});

  it("should Terminate and reset the self-destruction timer", async function() {});

  it("should destroy this contract and remit any ether it owns to the beneficiary address.", async function() {});
});
