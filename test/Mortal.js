const Mortal = artifacts.require("Mortal");

contract("Mortal", function(accounts) {
  const [deployerAccount, account1] = accounts;
  const SELFDESTRUCT_DELAY = 2419200; // = 4 weeks;

  let mortal;

  beforeEach(async function() {
    mortal = await Mortal.deployed();
  });

  it("should set owner address on deployment", async function() {
    const mortalInstance = await Mortal.new(account1, {
      from: deployerAccount
    });

    const owner = await mortalInstance.owner();
    assert.equal(
      owner,
      deployerAccount,
      "The owner was not set to the deployerAccount"
    );
  });

  it("should set selfDestructBeneficiary address on deployment", async function() {
    // Check the public variable state is set from deployment
    const selfDestructBeneficiary = await mortal.selfDestructBeneficiary();
    assert.equal(
      selfDestructBeneficiary,
      deployerAccount,
      "The selfDestructBeneficiary was not set in the contstructor"
    );
  });

  it("should set the beneficiary address of this contract", async function() {
    // Set the setSelfDestructBeneficiary
    const transaction = await mortal.setSelfDestructBeneficiary(account1);
    assert.eventEqual(transaction, "SelfDestructBeneficiaryUpdated", {
      beneficiary: deployerAccount
    });

    // Check the selfDestructBeneficiary is updated to the new address
    const selfDestructBeneficiary = await mortal.selfDestructBeneficiary();
    assert.equal(
      selfDestructBeneficiary,
      account1,
      "The selfDestructBeneficiary was not set to the new address"
    );
  });

  it("should begin the self-destruction counter of this contract.", async function() {
    // We initiate the self destruction of the contract
    const transaction = await mortal.initiateSelfDestruct();
    assert.eventEqual(transaction, "SelfDestructInitiated", {
      beneficiary: deployerAccount
    });

    // Check the selfDestructInitiated is now true
    const selfDestructInitiated = await mortal.selfDestructInitiated();
    assert.equal(
      selfDestructInitiated,
      true,
      "The selfDestructInitiated was not set to true"
    );

    // Check the initiationTime public variable state is mutated
    const initiationTime = await mortal.initiationTime();
    assert.notEqual(
      initiationTime,
      0,
      "The selfDestructInitiated was not set to zero"
    );
  });

  it("should Terminate and reset the self-destruction timer", async function() {
    // We initiate the self destruction of the contract
    await mortal.initiateSelfDestruct();

    // Cancel the self-destruction
    const transaction = await mortal.selfDestruct();
    assert.eventEqual(transaction, "SelfDestructed", {
      beneficiary: owner
    });

    // Check the selfDestructInitiated is now false
    const selfDestructInitiated = await mortal.selfDestructInitiated();
    assert.equal(
      selfDestructInitiated,
      false,
      "The selfDestructInitiated was not set to false"
    );

    // Check the initiationTime is now zero
    const initiationTime = await mortal.initiationTime();
    assert.equal(initiationTime, 0, "The initiationTime was not set to zero");
  });

  it("should only be terminated after we reach the SELFDESTRUCT_DELAY", async function() {
    // We initiate the self destruction of the contract
    await selfDestructible.initiateSelfDestruct();

    // Self destruct should revert as delay has not yet elapsed
    await assert.revert(selfDestructible.selfDestruct());

    // We fast forward the blockchain to reach the delay
    await fastForward(SELFDESTRUCT_DELAY + 1);

    // Self destruct should now work and emit the correct event
    const transaction = await selfDestructible.selfDestruct();
    assert.eventEqual(transaction, "SelfDestructed", {
      beneficiary: deployerAccount
    });
  });
});
