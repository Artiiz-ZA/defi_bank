// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";

contract bankOfArtiiz {
    Token private _token;

    // Mappings
    mapping(address => uint256) public depositedEtherBalance;
    mapping(address => uint256) public depositStartTime;
    mapping(address => bool) public currentlyDeposited;

    // Events
    event Deposit(
        address indexed user,
        uint256 etherAmount,
        uint256 depositTime
    );

    event Withdraw(
        address indexed user,
        uint256 etherAmount,
        uint256 withdrawalTime,
        uint256 interestPaidOut
    );

    // pass as constructor argument deployed Token contract
    constructor(Token token) {
        _token = token;
    }

    function getFundsInvested(address userAddress) external view returns(uint) {
        uint amountInvested = depositedEtherBalance[userAddress];
        return amountInvested;
    }

    function deposit() public payable {
        // Local Variables
        address userAddress = msg.sender;
        uint256 amountDeposited = msg.value;
        uint256 depositTime = block.timestamp;

        // Checking that the amount is greater than 0.01 ETH and that the user is not currently invested
        // Could alternatively use an if/else loop around the below code for a more human understandable code fragment
        require(
            currentlyDeposited[userAddress] == false,
            "Please withdraw all invested funds before depositing"
            // TODO: Improve on this to allow incremental deposits with a reset of the deposit start time to the latest deposit
        );
        require(
            amountDeposited >= 0.01 ether,
            "The deposited amount is below the investment minimum of 0.01 Ether"
        );

        // Adding to map dictionary to increment amount stored in bank
        depositedEtherBalance[userAddress] += amountDeposited;

        // Set deposit start time to that of the latest deposit
        depositStartTime[userAddress] = depositTime;

        // Set that the user is currently invested
        currentlyDeposited[userAddress] = true;

        // Triggering event
        emit Deposit(userAddress, amountDeposited, depositTime);
    }

    function withdraw() public {
        // Local Variables
        address userAddress = msg.sender;
        uint256 amountWithdrawn = depositedEtherBalance[userAddress];
        uint256 withdrawalTime = block.timestamp;

        // Checking that the user is currently invested
        // Could alternatively use an if/else loop around the below code for a more human understandable code fragment
        require(
            currentlyDeposited[userAddress] == true,
            "Please deposit funds to invest before attempting to withdraw"
            // TODO: Improve on this to allow smaller withdrawals at a time
        );

        // Calculate Interest Accrued
        uint256 timeInvested = withdrawalTime - depositStartTime[userAddress];

        // 31668017 = interest per second for (10% APY) for 0.01 ETH Minimum. So we split up the investment by 0.01 ETH to get per second rate
        uint256 interestPerSecond = 31668017 * (amountWithdrawn / 1e16);
        uint256 interestEarned = interestPerSecond * timeInvested;

        // Send Ether to user
        msg.sender.transfer(amountWithdrawn);

        // Mint tokens and send as interest to user
        _token.mint(userAddress, interestEarned);

        // Clear data about how much is invested
        depositedEtherBalance[userAddress] = 0;
        depositStartTime[userAddress] = 0;
        currentlyDeposited[userAddress] = false;

        // Triggering event
        Withdraw(userAddress, amountWithdrawn, withdrawalTime, interestEarned);
    }

    function borrow() public payable {
        //check if collateral is >= than 0.01 ETH
        //check if user doesn't have active loan
        //add msg.value to ether collateral
        //calc tokens amount to mint, 50% of msg.value
        //mint&send tokens to user
        //activate borrower's loan status
        //emit event
    }

    function payOff() public {
        //check if loan is active
        //transfer tokens from user back to the contract
        //calc fee
        //send user's collateral minus fee
        //reset borrower's data
        //emit event
    }
}
