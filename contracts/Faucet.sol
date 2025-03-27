// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Faucet {
    address public admin;
    IERC20 public token;
    uint256 public dripAmount;
    mapping(address => uint256) public lastRequestTime;
    uint256 public cooldown = 1 days;
    uint256 public bnbPriceUSD; // Price of 1 BNB in USD (18 decimals)

    event Drip(address indexed recipient, uint256 amount);
    event DripAmountChanged(uint256 newAmount);
    event CooldownChanged(uint256 newCooldown);

    /// @notice Constructor sets the token address and the initial BNB/USD price.
    /// @param _tokenAddress The ERC20 token address (MET).
    /// @param _bnbPriceUSD The current price of 1 BNB in USD (with 18 decimals).
    constructor(address _tokenAddress, uint256 _bnbPriceUSD) {
        admin = msg.sender;
        token = IERC20(_tokenAddress);
        dripAmount = 1 * 10 ** 18; // Default drip amount: 1 MET token (with 18 decimals)
        bnbPriceUSD = _bnbPriceUSD;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    /// @notice Allows a user to request tokens once per cooldown period.
    function requestTokens() external {
        require(block.timestamp - lastRequestTime[msg.sender] >= cooldown, "Please wait before requesting again");
        require(token.balanceOf(address(this)) >= dripAmount, "Faucet has insufficient tokens");

        lastRequestTime[msg.sender] = block.timestamp;
        require(token.transfer(msg.sender, dripAmount), "Token transfer failed");
        emit Drip(msg.sender, dripAmount);
    }

    /// @notice Admin function to update the drip amount.
    function updateDripAmount(uint256 _amount) external onlyAdmin {
        dripAmount = _amount;
        emit DripAmountChanged(_amount);
    }

    /// @notice Admin function to update the cooldown period.
    function updateCooldown(uint256 _cooldown) external onlyAdmin {
        cooldown = _cooldown;
        emit CooldownChanged(_cooldown);
    }

    /// @notice Admin function to withdraw tokens from the faucet.
    function withdrawTokens(uint256 _amount) external onlyAdmin {
        require(token.transfer(admin, _amount), "Withdraw failed");
    }

    /// @notice Admin function to change the token address.
    function changeTokenAddress(address _newToken) external onlyAdmin {
        token = IERC20(_newToken);
    }
}
