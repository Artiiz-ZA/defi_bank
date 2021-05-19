import { EVM_REVERT, wait } from "./helpers";

const Token = artifacts.require("./Token");
const DecentralizedBank = artifacts.require("./bankOfArtiiz");

require("chai").use(require("chai-as-promised")).should();

contract("bankOfArtiiz", ([deployer, user]) => {
  let bankOfArtiiz, token;
  const interestPerSecond = 31668017; // (10% APY) for min. deposit (0.01 ETH)

  beforeEach(async () => {
    token = await Token.new();
    bankOfArtiiz = await DecentralizedBank.new(token.address);
    await token.changeMinterAddress(bankOfArtiiz.address, { from: deployer });
  });

  describe("testing token contract...", () => {
    describe("success", () => {
      it("checking token name", async () => {
        expect(await token.name()).to.be.eq("Bank of Artiiz Coin");
      });

      it("checking token symbol", async () => {
        expect(await token.symbol()).to.be.eq("BoAC");
      });

      it("checking token initial total supply", async () => {
        expect(Number(await token.totalSupply())).to.eq(0);
      });

      it("bankOfArtiiz should have Token minter role", async () => {
        expect(await token.minter()).to.eq(bankOfArtiiz.address);
      });
    });

    describe("failure", () => {
      it("passing minter role should be rejected", async () => {
        await token
          .changeMinterAddress(user, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("tokens minting should be rejected", async () => {
        await token
          .mint(user, "1", { from: deployer })
          .should.be.rejectedWith(EVM_REVERT); //unauthorized minter
      });
    });
  });

  describe("testing deposit...", () => {
    let balance;

    describe("success", () => {
      beforeEach(async () => {
        await bankOfArtiiz.deposit({ value: 10 ** 16, from: user }); //0.01 ETH
      });

      it("balance should be 0.01 ETH", async () => {
        expect(Number(await bankOfArtiiz.depositedEtherBalance(user))).to.eq(
          10 ** 16
        );
      });

      it("deposit time should > 0", async () => {
        expect(Number(await bankOfArtiiz.depositStartTime(user))).to.be.above(
          0
        );
      });

      it("deposit status should = true", async () => {
        expect(await bankOfArtiiz.currentlyDeposited(user)).to.eq(true);
      });
    });

    describe("failure", () => {
      it("depositing should be rejected as amount too small", async () => {
        await bankOfArtiiz
          .deposit({ value: 10 ** 15, from: user })
          .should.be.rejectedWith(EVM_REVERT); // amount too small
      });
    });
  });

  describe("testing withdraw...", () => {
    let balance;

    describe("success", () => {
      beforeEach(async () => {
        await bankOfArtiiz.deposit({ value: 10 ** 16, from: user }); //0.01 ETH

        await wait(2); //accruing interest

        balance = await web3.eth.getBalance(user);
        await bankOfArtiiz.withdraw({ from: user });
      });

      it("balances should be = 0", async () => {
        expect(Number(await web3.eth.getBalance(bankOfArtiiz.address))).to.eq(
          0
        );
        expect(Number(await bankOfArtiiz.depositedEtherBalance(user))).to.eq(0);
      });

      it("user should be paid their ether back", async () => {
        expect(Number(await web3.eth.getBalance(user))).to.be.above(
          Number(balance)
        );
      });

      it("user should calculated amount of interest", async () => {
        //time synchronization problem make us check the 1-3s range for 2s deposit time
        balance = Number(await token.balanceOf(user));
        expect(balance).to.be.above(0);
        expect(balance % interestPerSecond).to.eq(0);
        expect(balance).to.be.below(interestPerSecond * 4);
      });

      it("dictionary data should be reset", async () => {
        expect(Number(await bankOfArtiiz.depositStartTime(user))).to.eq(0);
        expect(Number(await bankOfArtiiz.depositedEtherBalance(user))).to.eq(0);
        expect(await bankOfArtiiz.currentlyDeposited(user)).to.eq(false);
      });
    });

    describe("failure", () => {
      it("withdrawing should be rejected as the wrong user", async () => {
        await bankOfArtiiz.deposit({ value: 10 ** 16, from: user }); //0.01 ETH
        await wait(2); //accruing interest
        await bankOfArtiiz
          .withdraw({ from: deployer })
          .should.be.rejectedWith(EVM_REVERT); //wrong user
      });
    });
  });
});
