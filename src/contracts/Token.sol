// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

// Existing ERC 20 Token Code
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    // Public variables
    address public minter;

    // Events
    event MinterAddressChanged(address indexed fromAddress, address toAddress);

    constructor() payable ERC20("Bank of Artiiz Coin", "BoAC") {
        minter = msg.sender;
    }

    // Functions

    function changeMinterAddress(address newMinter) public returns (bool) {
        // Ensuring that the minter is the only person that can pass the minter address
        require(
            msg.sender == minter,
            "Only the current Token minter can change the minter address."
        );
        minter = newMinter;

        emit MinterAddressChanged(msg.sender, newMinter);
        return true;
    }

    function mint(address account, uint256 amount) public {
        // Ensuring that the minter is the only person that can mint tokens
        require(
            msg.sender == minter,
            "Only the current Token minter can mint new tokens."
        );
        _mint(account, amount);
    }
}
