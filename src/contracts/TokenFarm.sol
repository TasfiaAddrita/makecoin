pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm"; 
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner; 

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Stakes Tokens (Deposit)
    function stakeTokens(uint _amount) public {

        // Require _amount be greater than 0
        require(_amount > 0, "amount can not be 0");

        // Transfer to Mock DAI tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array only if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Issuing Tokens (Owner calls this function to set up interest) ??? 
    // Convert DAI tokens to Dapp tokens
    function issueTokens() public {

        require(msg.sender == owner, "Only owner can call this function");

        // Issue tokens to all stakers
        for (uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
            
        }
    }
    
    // Unstaking Tokens (Withdraw)

    
}