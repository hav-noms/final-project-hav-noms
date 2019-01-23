const Pausable = artifacts.require("Pausable");

contract("Pausable - Tiny Contract only 3 possible tests", function(accounts) {
  const [deployerAccount, account1] = accounts;

  let contractInstance;

  beforeEach(async function() {
    contractInstance = await Pausable.deployed();
  });

  it("should set owner address on deployment", async function() {
    const owner = await contractInstance.owner();
    assert.equal(owner, deployerAccount);
  });

  it("should setPaused to true and emit the correct event", async function() {
    const tx = await contractInstance.setPaused(true);
    const paused = await contractInstance.paused();
    assert.equal(paused, true);
    // TODO check events
  });

  it("should setPaused to false and emit the correct event", async function() {
    const tx = await contractInstance.setPaused(false);
    const paused = await contractInstance.paused();
    assert.equal(paused, false);
    // TODO check events
  });
});
