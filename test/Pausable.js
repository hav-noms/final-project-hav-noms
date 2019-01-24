const Pausable = artifacts.require("Pausable");

contract("Pausable - Contract killswitch safety mechanism", function(accounts) {
  const [deployerAccount, account1] = accounts;

  let pausable;

  beforeEach(async function() {
    pausable = await Pausable.deployed();
  });

  it("should set owner address on deployment", async function() {
    const owner = await pausable.owner();
    assert.equal(owner, deployerAccount);
  });

  it("should setPaused to true and emit paused is set to true", async function() {
    await pausable.setPaused(true);
    const paused = await pausable.paused();
    assert.equal(paused, true);
  });

  it("should setPaused to false and paused is set to false", async function() {
    await pausable.setPaused(false);
    const paused = await pausable.paused();
    assert.equal(paused, false);
  });

  it("should setPaused to true and emit the correct event", async function() {
    const transaction = await pausable.setPaused(true);
    assert.eventEqual(transaction, "PauseChanged", {
      isPaused: true
    });
  });

  it("should setPaused to false and emit the correct event", async function() {
    // Need to pause it as the paused default is to be false
    await pausable.setPaused(true);

    const transaction = await pausable.setPaused(false);
    assert.eventEqual(transaction, "PauseChanged", {
      isPaused: false
    });
  });
});
