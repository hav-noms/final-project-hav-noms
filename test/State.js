const State = artifacts.require("State");

contract("State - Test contract deployment", function(accounts) {
  const [deployerAccount, account1] = accounts;

  it("should revert when owner parameter is passed the zero address", async function() {
    await assert.revert(Mortal.new(ZERO_ADDRESS, { from: deployerAccount }));
  });

  // TODO check events on contract creation
  it("should set owner address on deployment", async function() {
    const stateContractInstance = await State.new(account1, {
      from: deployerAccount
    });
    const owner = await stateContractInstance.owner();
    assert.equal(owner, account1);
  });
});

contract("Pausable - Pre deployed contract", async function(accounts) {
  const [account1, account2, account3, account4] = accounts.slice(1); // The first account is the deployerAccount above

  it("should setAssociatedContract to the given address and emit the correct event", async function() {});

  it("should setPaused to false and emit the correct event", async function() {});
});
