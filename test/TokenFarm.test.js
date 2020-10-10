const { assert } = require("chai")

const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

require("chai")
    .use(require("chai-as-promised"))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, "Ether")
}

contract("TokenFarm", ([owner, investor]) => {

    let daiToken, dappToken, tokenFarm
    
    before(async () => {
        // Load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        // Transfer all Dapp tokens to farm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens("1000000"))

        // Transfer 100 Mock DAI tokens to investor
        await daiToken.transfer(investor, tokens("100"), { from: owner })
    })

    describe("Mock DAI deployment", async () => {
        it("has a name", async () => {
            const name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        })
    })

    describe("Dapp Token deployment", async () => {
        it("has a name", async () => {
            const name = await dappToken.name()
            assert.equal(name, "Dapp Token")
        })
    })

    describe("Token Farm deployment", async () => {
        it("has a name", async () => {
            const name = await tokenFarm.name()
            assert.equal(name, "Dapp Token Farm")
        })

        it("contract has tokens", async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens("1000000"))
        })
    })

    describe("Farming tokens", async () => {
        it("rewards investors for staking mDai tokens", async () => {
            let result

            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("100"), "Investor Mock DAI wallet balance is not correct before staking")

            // ----Stake Mock DAI Tokens----
            await daiToken.approve(tokenFarm.address, tokens("100"), { "from": investor })
            await tokenFarm.stakeTokens(tokens("100"), { "from": investor })

            // Check investor balance after staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("0"), "Investor Mock DAI wallet balance is not correct after staking")

            // Check TokenFarm balance after staking
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens("100"), "Token Farm Mock DAI wallet balance is not correct after staking")

            // Check staking balance
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens("100"), "Investor staking balance is not correct after staking")

            // Check staking status
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), "true", "Investor staking status is not correct after staking")

            // ----Issue tokens-----
            await tokenFarm.issueTokens({ from: owner })

            // Check balance after issueTokens is called
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("100"), "Investor Dapp Token wallet balance is not correct after issuing tokens")

            // Ensure that only owner can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            // ----Unstake tokens----
            await tokenFarm.unstakeTokens({ from: investor })

            // Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("100"), "Investor Mock DAI wallet balance is not correct after staking")

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens("0"), "Token Farm wallet balance is not correct after staking")

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens("0"), "Investor staking  balance is not correct after staking")

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), "false", "Investor staking status is not correct after staking")

        })
    })

})