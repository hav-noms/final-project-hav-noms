const Pausable = artifacts.require("Pausable");

contract("Pausable - Test contract deployment", function(accounts) {
  const [deployerAccount, account1] = accounts;

  it("should revert when owner parameter is passed the zero address", async function() {
    await assert.revert(Pausable.new(ZERO_ADDRESS, { from: deployerAccount }));
  });

  // TODO check events on contract creation
  it("should set owner address on deployment", async function() {
    const contractInstance = await Pausable.new(account1, {
      from: deployerAccount
    });
    const owner = await contractInstance.owner();
    assert.equal(owner, account1);
  });
});

contract("Pausable - Pre deployed contract", async function(accounts) {
  const [account1, account2, account3, account4] = accounts.slice(1); // The first account is the deployerAccount above

  it("should setPaused to true and emit the correct event", async function() {});

  it("should setPaused to false and emit the correct event", async function() {});
});
