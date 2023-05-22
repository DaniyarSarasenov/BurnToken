// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract TokenBurn is Ownable {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    string public name;
    string public symbol;
    uint8 public decimals;
    
    address public uniswapRouter;
    address public uniswapPair;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed burner, uint256 value);
    event Bought(uint256 amount);
    event Sold(uint256 amount);
    
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply, address _uniswapRouter, address _uniswapPair) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply * 10 ** decimals;
        decimals = 18; // 18 decimal places nis the standard
        balanceOf[msg.sender] = totalSupply;
        uniswapRouter = _uniswapRouter;
        uniswapPair = _uniswapPair;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid recipient address"); // Make sure address is valid
        require(balanceOf[msg.sender] >= _value, "Insufficient balance"); // Check if sender has enough balance
        require(balanceOf[_to] + _value >= balanceOf[_to], "Integer overflow error"); // Prevent integer overflow
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Invalid spender address"); // Make sure address is valid
        
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid recipient address"); // Make sure address is valid
        require(balanceOf[_from] >= _value, "Insufficient balance"); // Check if sender has enough balance
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance"); // Check if sender has enough allowance
        require(balanceOf[_to] + _value >= balanceOf[_to], "Integer overflow error"); // Prevent integer overflow
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance"); // Check if sender has enough balance
        
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        emit Burn(msg.sender, _value);
        return true;
    }
    
    function buy() public payable {
        require(msg.value > 0, "Invalid purchase amount"); // Make sure amount sent is greater than zero
        
        // Get the amount of tokens to buy based on the amount of ETH sent
        address[] memory path = new address[](2);
        path[0] = IUniswapV2Router02(uniswapRouter).WETH();
        path[1] = address(this);
        uint[] memory amounts = IUniswapV2Router02(uniswapRouter).getAmountsOut(msg.value, path);
        uint amountOut = amounts[1];
        
        // Make the swap
        IUniswapV2Router02(uniswapRouter).swapExactTokensForTokens(
            amountOut,
            msg.value,
            path,
            address(this),
            block.timestamp
        );
        
           // Send tokens to the buyer
        balanceOf[msg.sender] += amountOut;
        totalSupply += amountOut;
        
        emit Bought(amountOut);
    }

    function sell(uint256 _amount) public {
        require(_amount > 0, "Invalid sell amount"); // Make sure amount to sell is greater than zero
        
        // Make sure seller has enough tokens to sell
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        
        // Get the amount of ETH to receive based on the tokens being sold
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = IUniswapV2Router02(uniswapRouter).WETH();
        uint[] memory amounts = IUniswapV2Router02(uniswapRouter).getAmountsOut(_amount, path);
        uint amountOut = amounts[1];
        
        // Make the swap
        IUniswapV2Router02(uniswapRouter).swapTokensForExactTokens(
            amountOut,
            _amount,
            path,
            address(this),
            block.timestamp
        );
        
        // Send ETH to the seller
        payable(msg.sender).transfer(amountOut);
        
        emit Sold(_amount);
    }

    function setUniswapRouter(address addre) onlyOwner external {
        require(addre != address(0), "Invalid Address");
        uniswapRouter = addre;
    }

    function setUniswapPair(address addre) onlyOwner external {
        require(addre != address(0), "Invalid Address");
        uniswapPair = addre;
    }
}