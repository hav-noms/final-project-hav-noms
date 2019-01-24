const TokenExchange = artifacts.require("TokenExchange");

contract("TokenExchange - Test contract deployment", function(accounts) {
  const [deployerAccount, account1, account2, account3, account4] = accounts;

  const ZERO_ADDRESS = "0x" + "0".repeat(40);

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

    // Validate the correct events are emitted
    /*     
    it.only("should emit the OwnershipTransferred event", async function() {
      const event = tokenExchange.events.find(
        log => log.event === "OwnershipTransferred"
      );
      assert.eventEqual(event, "OwnershipTransferred", {
        previousOwner: ZERO_ADDRESS,
        newOwner: deployerAccount
      });
    });

    it("should emit the ProxyUpdated event", async function() {
      const event = tokenExchange.events.find(
        log => log.event === "ProxyUpdated"
      );
      assert.eventEqual(event, "ProxyUpdated", {
        proxyAddress: proxyAddress
      });
    });

    it("should emit the SelfDestructBeneficiaryUpdated event", async function() {
      const event = tokenExchange.events.find(
        log => log.event === "ProxyUpdated"
      );
      assert.eventEqual(event, "ProxyUpdated", {
        newBeneficiary: deployerAccount
      });
    }); */
  });

  describe("When calling the core exchange functions", async function() {
    beforeEach(async function() {
      tokenExchange = await TokenExchange.deployed();
    });

    /*     it("should allow user to deposit an ERC20 token to sell", async function() {
      // Deploy mintable ERC20 Contract
      const shartCoinAddress = ZERO_ADDRESS;
      //Approve transfer of 1000

      // Create a trade listing
      const transaction = await tokenExchange.createTradeListing(
        "sUSD",
        100
        0.0087
        shartCoinAddress);

      
    }); */

    it("should allow user to withdraw their tokens for sale", async function() {});

    it("should allow user to exchange ERC20 Tokens for ETH"); //, async function() {});
  });
});
