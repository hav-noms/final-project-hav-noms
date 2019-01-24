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

And to prevent reentrant attacks, applied the following modifier and set the user's balance to 0 before tranfer ether.

```
modifier noReentrancy() {
	require(!reentrancyLock, "reentrancyLocked!");
	reentrancyLock = true;
	_;
	reentrancyLock = false;
}

function withdraw() public noReentrancy {
	require(
		balance[msg.sender] > 0,
		"Check the balance"
	);
	uint amount = balance[msg.sender];

	// The user's balance is already 0, so future invocations won't withdraw anything
	balance[msg.sender] = 0;
	msg.sender.transfer(amount);
	emit withdrawEther(amount);
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
