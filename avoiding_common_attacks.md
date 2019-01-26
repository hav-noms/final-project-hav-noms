# Avoiding Common Attacks

- [x]The avoiding_common_attacks.md covers at least 3 common attacks and how the app mitigates user risk

# Avoiding Common Attacks

## Index

- [Reentrancy](#reentrancy)
- [Integer Overflow and Underflow](#integer-overflow-and-underflow)
- [Ownable](#Ownable)

## Reentrancy

As we can see from the DAO case, it is a very difficult and important issue. This contract has a withdrawal function, which can be an attack point.

To solve the problem, use the send() or transfer() function instead of the low level function call(). Transfer() is recommended rather than send() because the transaction will fail with an exception if the transfer fails.

And to prevent reentrant attacks, applied the following modifier to protect as we should be deleting calling removeTradeListing(listingID) before we start transfering tokens and ETH

```
modifier noReentrancy() {
	require(!reentrancyLock, "reentrancyLocked!");
	reentrancyLock = true;
	_;
	reentrancyLock = false;
}

function exchangeEtherForTokens(
		uint listingID)
	optionalProxy
	notPaused
	refund(listingID)
	noReentrancy
	payable
	public
{
	// Find the TokenDeposit by depositID in our mapping
	TradeListing memory trade = tradeListings[listingID];

	// Revert if its not found
	require(trade.totalPrice != 0, "The Trade listingID you've requested does not exist");

	// Make sure the user has sent enough ETH to cover the trade
	require(msg.value >= trade.totalPrice, "You have not sent enough ETH to cover the cost of this trade");

	// Looks like we can fullfill this exchange

	// Send the ERC20 tokens to the buyer
	require(IERC20(trade.tokenContractAddress).transfer(messageSender, trade.amount), "The transfer of the ERC20 Tokens failed. Check the ERC20 Token contract");

	// Send the ETH to the seller
	trade.user.transfer(trade.totalPrice); // dont send the msg.value as we may need to refund some to the buyer

	// Tell the DApps there was an Exchange
	emit Exchange("ETH", trade.totalPrice, trade.symbol, trade.amount);

	// Delete the deposit
	removeTradeListing(listingID); // @dev to prevent we have a noReentrancy modifier
}
```

## Integer Overflow and Underflow

In the code below, the amount of tokens held in a contract is less than the amount you want to withdraw, but you can still withdraw.

```
function withdraw(uint _amount) {
    require(balances[msg.sender] - _amount > 0);
    msg.sender.transfer(_amount);
    balances[msg.sender] -= _amount;
}
```

To solve this problem, it is most common to use the SafeMath library created by openzeppelin.

## Ownable

To secure Admin only functions openzeppelin Ownable library has been implementd to protect admin functions with the onlyOwner modifer
