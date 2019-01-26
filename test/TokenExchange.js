const {
  currentTime,
  fastForward,
  getEthBalance,
  toUnit,
  multiplyDecimal,
  divideDecimal
} = require("../utils/testUtils");

const TokenExchange = artifacts.require("TokenExchange");
const ShartCoin = artifacts.require("ShartCoin");

const ZERO_ADDRESS = "0x" + "0".repeat(40);

contract("TokenExchange - Test contract deployment", function(accounts) {
  const [deployerAccount, account1, account2, account3, account4] = accounts;

  let tokenExchange;

  describe("When calling the constructor", async function() {
    const selfDestructBeneficiary = deployerAccount;
    const proxyAddress = deployerAccount;
    const externalStateAddress = deployerAccount;
    const priceETHUSD = "100";

    beforeEach(async function() {
      // Deploy and call the constructor again
      tokenExchange = await TokenExchange.new(
        selfDestructBeneficiary,
        proxyAddress,
        externalStateAddress,
        priceETHUSD,
        {
          from: deployerAccount
        }
      );
    });

    // Validate constructor setup

    it("should set owner address on deployment", async function() {
      const owner = await tokenExchange.owner();
      assert.equal(owner, deployerAccount);
    });

    it("should set proxy address on deployment", async function() {
      const address = await tokenExchange.proxy();
      assert.equal(address, proxyAddress);
    });

    it("should set external state address on deployment", async function() {
      const address = await tokenExchange.owner();
      assert.equal(address, externalStateAddress);
    });

    it("should set selfDestructBeneficiary address on deployment", async function() {
      const address = await tokenExchange.selfDestructBeneficiary();
      assert.equal(address, selfDestructBeneficiary);
    });

    it("should set the seed ETHUSD price from the contructor", async function() {
      const _priceETHUSD = await tokenExchange.priceETHUSD();
      assert.equal(_priceETHUSD, priceETHUSD);
    });

    describe("When a seller wants to create a trade", async function() {
      const usdEth = toUnit("100");
      const tokenPrice = toUnit(".08"); //in ETH
      const numberOfTokens = toUnit("1000");
      let transaction;

      beforeEach(async function() {
        tokenExchange = await TokenExchange.deployed();
        shartCoin = await ShartCoin.deployed();
      });

      it("should revert if the contract is paused", async function() {
        // Pause the contract
        await tokenExchange.setPaused(true);

        // Approve the TokenExchange to transfer of 1000 of my tokens to itself
        const approveTransaction = await shartCoin.approve(
          tokenExchange.address,
          numberOfTokens
        );

        // Create a trade listing on the TokenExchange
        await assert.revert(
          tokenExchange.createTradeListing(
            await shartCoin.symbol(),
            numberOfTokens,
            tokenPrice,
            shartCoin.address,
            {
              from: deployerAccount
            }
          )
        );
      });

      it("should revert if the amount of tokens being deposited is zero", async function() {
        // Approve the TokenExchange to transfer of 1000 of my tokens to itself
        const approveTransaction = await shartCoin.approve(
          tokenExchange.address,
          numberOfTokens
        );

        // Create a trade listing on the TokenExchange sending the token price as zero
        await assert.revert(
          tokenExchange.createTradeListing(
            await shartCoin.symbol(),
            0,
            tokenPrice,
            shartCoin.address,
            {
              from: deployerAccount
            }
          )
        );
      });

      it("should revert if the TokenListing (price) ethRate is zero", async function() {
        // Create a trade listing on the TokenExchange sending ethRate as zero
        await assert.revert(
          tokenExchange.createTradeListing(
            await shartCoin.symbol(),
            numberOfTokens,
            0,
            shartCoin.address,
            {
              from: deployerAccount
            }
          )
        );
      });

      it("should revert if the address supplied is not a contract", async function() {
        // Create a trade listing on the TokenExchange providing a wallet address instead of the contract
        await assert.revert(
          tokenExchange.createTradeListing(
            await shartCoin.symbol(),
            0,
            tokenPrice,
            account3,
            {
              from: deployerAccount
            }
          )
        );
      });

      it("should revert if the ERCToken Contract has not approved the amount to transfer", async function() {
        // Dont approve a transfer by calling shartCoin.approve()

        // Create a trade listing on the TokenExchange
        await assert.revert(
          tokenExchange.createTradeListing(
            await shartCoin.symbol(),
            numberOfTokens,
            tokenPrice,
            shartCoin.address,
            {
              from: deployerAccount
            }
          )
        );
      });
    });

    describe.only("When saving a tradelisting to the blockchain", async function() {
      const usdEth = toUnit("100");
      const tokenPrice = toUnit(".08"); //in ETH
      const numberOfTokens = toUnit("1000");
      let transaction;

      beforeEach(async function() {
        tokenExchange = await TokenExchange.deployed();
        shartCoin = await ShartCoin.deployed();

        // Approve the TokenExchange to transfer of 1000 of my tokens to itself
        await shartCoin.approve(tokenExchange.address, numberOfTokens);

        // Create a trade listing on the TokenExchange
        transaction = await tokenExchange.createTradeListing(
          await shartCoin.symbol(),
          numberOfTokens,
          tokenPrice,
          shartCoin.address,
          {
            from: deployerAccount
          }
        );
      });

      it("should emit the event TradeListingDeposit", async function() {
        // Check the event TradeListingDeposit(address indexed user, uint amount, uint indexed tradeID);
        assert.eventEqual(transaction, "TradeListingDeposit", {
          user: deployerAccount,
          amount: numberOfTokens,
          tradeID: 0
        });
      });

      it("should create a tradeListing and be publicly accessable", async function() {
        // Get the first tradeListing from the contract
        const tradeListing = await tokenExchange.tradeListings(0);

        // Check all of the return values
        assert.equal(tradeListing.user, deployerAccount);
        assert.equal(tradeListing.symbol, await shartCoin.symbol());
        assert.bnEqual(tradeListing.amount, numberOfTokens);
        assert.equal(tradeListing.tokenContractAddress, shartCoin.address);
      });

      it("should create a tradeListing increase the tradeListingCount count", async function() {
        const tradeListingCount = await tokenExchange.getTradeListingCount();
        assert.equal(tradeListingCount, 1);
      });

      it("should have a token balance of the amount of tokens we deposited", async function() {
        // Ask the ERC20 Contract for the balance of this token exchange contract
        const tokenExchangeShartCoinBalance = await shartCoin.balanceOf(
          tokenExchange.address
        );
        // Check its the amount of tokens we deposited in the trade listing
        assert.bnEqual(tokenExchangeShartCoinBalance, numberOfTokens);
      });

      it("should have reduced the balance at the depositors wallet address", async function() {
        // Ask the ERC20 Contract for the balance of the depositor
        const balanceAfter = await shartCoin.balanceOf(deployerAccount);

        // This account is the owner and was awarded the totalSupply
        const totalSupply = await shartCoin.totalSupply();
        const ownerBalance = web3.utils.toBN(totalSupply).sub(numberOfTokens);

        // Check its the amount of tokens we deposited in the trade listing
        assert.bnEqual(balanceAfter, ownerBalance);
      });
    });

    describe("When a seller wants to withdraw a deposit", async function() {
      const usdEth = toUnit("100");
      const tokenPrice = toUnit(".08"); //in ETH
      const numberOfTokens = toUnit("1000");
      let transaction;

      beforeEach(async function() {
        tokenExchange = await TokenExchange.deployed();
        shartCoin = await ShartCoin.deployed();

        // Approve the TokenExchange to transfer of 1000 of my tokens to itself
        await shartCoin.approve(tokenExchange.address, numberOfTokens);

        // Create a trade listing on the TokenExchange
        transaction = await tokenExchange.createTradeListing(
          await shartCoin.symbol(),
          numberOfTokens,
          tokenPrice,
          shartCoin.address,
          {
            from: deployerAccount
          }
        );
      });

      it("should revert if the contract is paused", async function() {
        // Pause the contract
        await tokenExchange.setPaused(true);

        // Withdraw my deposit
        await assert.revert(
          tokenExchange.withdrawMyDepositedTokens(0, {
            from: deployerAccount
          })
        );
      });

      it("should revert if the deposit does not belong to the user", async function() {
        // Withdraw deployerAccount's deposit as account1
        await assert.revert(
          tokenExchange.withdrawMyDepositedTokens(0, {
            from: account1
          })
        );
      });

      it("should delete the trade listing", async function() {
        // Withdraw my deposit
        transaction = await tokenExchange.withdrawMyDepositedTokens(0, {
          from: deployerAccount
        });

        // Assert the tradeListing struct is empty
        const tradeListing = await tokenExchange.tradeListings(0);
        assert.equal(tradeListing.symbol, "");
        assert.bnEqual(tradeListing.amount, 0);
        assert.bnEqual(tradeListing.ethRate, 0);
        assert.equal(tradeListing.user, ZERO_ADDRESS);
        assert.equal(tradeListing.tokenContractAddress, ZERO_ADDRESS);
      });

      it("should return the users tokens deposited into the contract", async function() {
        // Withdraw my deposit
        transaction = await tokenExchange.withdrawMyDepositedTokens(0, {
          from: deployerAccount
        });
      });

      it("should emit the event TradeListingWithdrawal", async function() {
        // Withdraw my deposit
        transaction = await tokenExchange.withdrawMyDepositedTokens(0, {
          from: deployerAccount
        });

        assert.eventEqual(transaction, "TradeListingWithdrawal", {
          user: deployerAccount,
          amount: numberOfTokens,
          tradeID: 0
        });
      });
    });

    describe("When a buyer wants to execute a trade", async function() {
      const usdEth = toUnit("100");
      const tokenPrice = toUnit(".0006"); //in ETH
      const numberOfTokens = toUnit("1000");
      const ETHtoSend = toUnit("80000");
      let transaction;

      beforeEach(async function() {
        tokenExchange = await TokenExchange.deployed();
        shartCoin = await ShartCoin.deployed();

        // Approve the TokenExchange to transfer of 1000 of my tokens to itself
        const approveTransaction = await shartCoin.approve(
          tokenExchange.address,
          numberOfTokens
        );

        // Create a trade listing on the TokenExchange
        transaction = await tokenExchange.createTradeListing(
          await shartCoin.symbol(),
          numberOfTokens,
          tokenPrice,
          shartCoin.address,
          {
            from: deployerAccount
          }
        );
      });

      it("should revert if the contract is paused", async function() {
        // Pause the contract
        await tokenExchange.setPaused(true);

        // Buy tokens for ETH
        await assert.revert(
          tokenExchange.exchangeEtherForTokens(0, {
            from: deployerAccount,
            value: ETHtoSend
          })
        );
      });

      it("should revert if the sender did not send enough ETH", async function() {
        // Buy tokens without sending ETH
        await assert.revert(
          tokenExchange.exchangeEtherForTokens(0, {
            from: deployerAccount,
            value: 0
          })
        );
      });

      it("should calc the purchase price", async function() {
        console.log("calcCostPriceInUSD");
        let response1 = await tokenExchange.calcCostPriceInUSD.call(
          numberOfTokens,
          tokenPrice
        );

        console.log("costETH", response1.costETH);
        console.log("costUSD", response1.costUSD);

        let response2 = await tokenExchange.getListingCostPriceInUSD.call(0);
        console.log(response2);
        console.log("costETH", response2.costETH);
        console.log("costUSD", response2.costUSD);

        let response3 = await tokenExchange.callOracle();
        console.log(response3);

        // Buy tokens for ETH
        transaction = await tokenExchange.exchangeEtherForTokens(0, {
          from: deployerAccount,
          value: ETHtoSend
        });

        // Assert the tradeListing struct is empty
        const tradeListing = await tokenExchange.tradeListings(0);
        assert.equal(tradeListing.symbol, "");
        assert.bnEqual(tradeListing.amount, 0);
        assert.bnEqual(tradeListing.ethRate, 0);
        assert.equal(tradeListing.user, ZERO_ADDRESS);
        assert.equal(tradeListing.tokenContractAddress, ZERO_ADDRESS);
      });

      it("should delete the trade listing", async function() {
        // Buy tokens for ETH
        transaction = await tokenExchange.exchangeEtherForTokens(0, {
          from: deployerAccount,
          value: ETHtoSend
        });

        // Assert the tradeListing struct is empty
        const tradeListing = await tokenExchange.tradeListings(0);
        assert.equal(tradeListing.symbol, "");
        assert.bnEqual(tradeListing.amount, 0);
        assert.bnEqual(tradeListing.ethRate, 0);
        assert.equal(tradeListing.user, ZERO_ADDRESS);
        assert.equal(tradeListing.tokenContractAddress, ZERO_ADDRESS);
      });

      it("should send the buyer the correct amount of tokens", async function() {
        // Buy tokens for ETH
        await tokenExchange.exchangeEtherForTokens(0, {
          from: deployerAccount,
          value: ETHtoSend
        });
      });

      it("should send the buyer the correct amount of tokens", async function() {
        // Buy tokens for ETH
        await tokenExchange.exchangeEtherForTokens(0, {
          from: deployerAccount,
          value: ETHtoSend
        });
      });

      it("should send the seller the correct amount of ETH"); //, async function() {});

      it("should emit the Exchange event", async function() {
        // Buy tokens for ETH
        transaction = await tokenExchange.exchangeEtherForTokens(0, {
          from: deployerAccount,
          value: ETHtoSend
        });

        // Assert event Exchange(string fromSymbol, uint fromAmount, string toSymbol, uint toAmount);
        assert.eventEqual(transaction, "Exchange", {
          fromSymbol: "ETH",
          fromAmount: ETHtoSend,
          toSymbol: await shartCoin.symbol(),
          toAmount: numberOfTokens
        });
      });
    });
  });
});
