// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Faucet {
    address public admin;
    IERC20 public token;
    uint256 public dripAmount = 1 ether; // Default 1 MET (18 decimals)
    uint256 public cooldown = 1 days;

    mapping(address => uint256) public lastRequestTime;

    event Drip(address indexed recipient, uint256 amount);
    event DripAmountChanged(uint256 newAmount);
    event CooldownChanged(uint256 newCooldown);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(address _tokenAddress) {
        admin = msg.sender;
        token = IERC20(_tokenAddress);
    }

    function requestTokens() external {
        require(block.timestamp - lastRequestTime[msg.sender] >= cooldown, "Cooldown active");
        require(token.balanceOf(address(this)) >= dripAmount, "Faucet dry");

        lastRequestTime[msg.sender] = block.timestamp;
        token.transfer(msg.sender, dripAmount);
        emit Drip(msg.sender, dripAmount);
    }

    function updateDripAmount(uint256 _amount) external onlyAdmin {
        dripAmount = _amount;
        emit DripAmountChanged(_amount);
    }

    function updateCooldown(uint256 _cooldown) external onlyAdmin {
        cooldown = _cooldown;
        emit CooldownChanged(_cooldown);
    }

    function withdrawTokens(uint256 _amount) external onlyAdmin {
        require(token.transfer(admin, _amount), "Withdraw failed");
    }

    function changeTokenAddress(address _newToken) external onlyAdmin {
        token = IERC20(_newToken);
    }
}
