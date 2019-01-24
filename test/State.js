const State = artifacts.require("State");

contract("State - Tiny Contract only 3 tests", function(accounts) {
  const [deployerAccount, account1] = accounts;

  let state;

  beforeEach(async function() {
    state = await State.deployed();
  });

  it("should set owner address on deployment", async function() {
    const contractInstance = await State.new(account1, {
      from: deployerAccount
    });
    const owner = await contractInstance.owner();
    assert.equal(owner, deployerAccount);
  });

  it("should setAssociatedContract to the given address", async function() {
    await state.setAssociatedContract(account1);

    const associatedContract = await state.associatedContract();
    assert.equal(
      associatedContract,
      account1,
      "Failed to set associatedContract via setAssociatedContract"
    );
  });

  it("should setAssociatedContract and emit the correct event", async function() {
    const transaction = await state.setAssociatedContract(account1);
    assert.eventEqual(transaction, "AssociatedContractUpdated", {
      associatedContract: account1
    });
  });
});
