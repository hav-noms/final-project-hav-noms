const BN = require("bn.js");

const ZERO_ADDRESS = "0x" + "0".repeat(40);
const UNIT = web3.utils.toWei(new BN("1"), "ether");

/**
 *  Translates an amount to our cononical unit. We happen to use 10^18, which means we can
 *  use the built in web3 method for convenience, but if unit ever changes in our contracts
 *  we should be able to update the conversion factor here.
 *  @param amount The amount you want to re-base to UNIT
 */
const toUnit = amount => web3.utils.toBN(web3.utils.toWei(amount, "ether"));
const fromUnit = amount => web3.utils.fromWei(amount, "ether");

/**
 *  Gets the ETH balance for the account address
 * 	@param account Ethereum wallet address
 */
const getEthBalance = account => web3.eth.getBalance(account);

/**
 *  Convenience method to assert that an event matches a shape
 *  @param actualEventOrTransaction The transaction receipt, or event as returned in the event logs from web3
 *  @param expectedEvent The event name you expect
 *  @param expectedArgs The args you expect in object notation, e.g. { newOracle: '0x...', updatedAt: '...' }
 */
const assertEventEqual = (
  actualEventOrTransaction,
  expectedEvent,
  expectedArgs
) => {
  // If they pass in a whole transaction we need to extract the first log, otherwise we already have what we need
  const event = Array.isArray(actualEventOrTransaction.logs)
    ? actualEventOrTransaction.logs[0]
    : actualEventOrTransaction;

  if (!event) {
    assert.fail(new Error("No event was generated from this transaction"));
  }

  // Assert the names are the same.
  assert.equal(event.event, expectedEvent);

  assertDeepEqual(event.args, expectedArgs);
  // Note: this means that if you don't assert args they'll pass regardless.
  // Ensure you pass in all the args you need to assert on.
};

const assertRevert = async blockOrPromise => {
  let errorCaught = false;
  try {
    const result =
      typeof blockOrPromise === "function" ? blockOrPromise() : blockOrPromise;
    await result;
  } catch (error) {
    assert.include(error.message, "revert");
    errorCaught = true;
  }

  assert.equal(errorCaught, true, "Operation did not revert as expected");
};

module.exports = {
  ZERO_ADDRESS,

  toUnit,
  fromUnit,

  assertEventEqual,
  assertRevert,

  getEthBalance
};
