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

    describe.only("When a seller wants to create a trade", async function() {
      const usdEth = toUnit("100");
      const tokenPrice = toUnit(".08"); //in ETH
      const numberOfTokens = toUnit("1000");
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

      it("should revert if the contract is paused"); //, async function() {});

      it("should revert if the amount is zero"); //, async function() {});

      it("should revert if the ethRate is zero"); //, async function() {});

      it(
        "should revert if the ERCToken Contract has not approved the amount to transfer"
      ); //, async function() {});

      it.only("should create a tradeListing increase the tradeListingCount count", async function() {
        const tradeListingCount = await tokenExchange.getTradeListingCount();
        //assert.equal(tradeListingCount, 1);
      });

      it("should create a tradeListing and be publicly accessable", async function() {
        const tradeListing = await tokenExchange.tradeListings(0);
        console.log(tradeListing);
        assert.equal(tradeListing.user, deployerAccount);
        assert.equal(tradeListing.amount, numberOfTokens);
      });

      it("should emit the event TradeListingDeposit", async function() {
        // event TradeListingDeposit(address indexed user, uint amount, uint indexed tradeID);
        assert.eventEqual(transaction, "TradeListingDeposit", {
          user: deployerAccount,
          amount: numberOfTokens,
          tradeID: 0
        });
      });
    });

    describe("When a seller wants to withdraw a deposit", async function() {
      const usdEth = toUnit("100");
      const tokenPrice = toUnit(".08");
      const numberOfTokens = toUnit("1000");
      let transaction;

      beforeEach(async function() {
        tokenExchange = await TokenExchange.deployed();

        // Create a trade listing

        // Now withdraw it
      });

      it("should revert if the contract is paused"); //, async function() {});

      it("should revert if the deposit does not belong to the user"); //, async function() {});

      it("should delete the trade listing"); //, async function() {});

      it("should return the users tokens deposited into the contract"); //, async function() {});

      it("should emit the event TradeListingWithdrawal"); //, async function() {
      /*     assert.eventEqual(transaction, "TradeListingWithdrawal", {
            user: owner,
            amount: numberOfTokens,
            tradeID: 0
          });
        });
      */
      it("should allow user to exchange ERC20 Tokens for ETH"); //, async function() {});
    });

    describe("When a buyer wants to execute a trade", async function() {
      beforeEach(async function() {
        // call tokenExchange.createTradeListing
        // call tokenExchange.exchangeEtherForTokens
      });

      it("should revert if the contract is paused"); //, async function() {});

      it("should revert if the sender did not send enough ETH"); //, async function() {});

      it("should delete the trade listing"); //, async function() {});

      it("should send the buyer the correct amount of tokens"); //, async function() {});

      it("should send the user the correct amount of ETH"); //, async function() {});

      it("should emit the Exchange event"); //, async function() {});
    });
  });
});
