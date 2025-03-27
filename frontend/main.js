// Set constants
const MET_WALLET_ADDRESS = "0x073f5CaDb9424Ce0a50a6E567AB87c2Be97D76F6";
const MET_CONTRACT_ADDRESS = "0xCFa63A2B76120dda8992Ac9cc5A8Ba7079b0bd29";
const BACKEND_URL = "https://met-buy-and-faucet.onrender.com"; // Replace with your Render.com URL

// Replace with your MET Token ABI from abi/METToken.json
const MET_ABI = [
   {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const metContract = new web3.eth.Contract(MET_ABI, MET_CONTRACT_ADDRESS);

let web3;
let accounts = [];
let walletConnectProvider; // For WalletConnect

// MetaMask Connection
async function connectMetaMask() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    accounts = await web3.eth.getAccounts();
    document.getElementById('walletAddress').innerText = "Connected: " + accounts[0];
  } else {
    alert("Please install MetaMask.");
  }
}

// WalletConnect Connection
async function connectWalletConnect() {
  walletConnectProvider = new WalletConnectProvider.default({
    rpc: { 
      56: "https://bsc-mainnet.infura.io/v3/7b2be2d54a114b8d8f558134c1296e74" 
    },
    chainId: 56
  });
  await walletConnectProvider.enable();
  web3 = new Web3(walletConnectProvider);
  accounts = await web3.eth.getAccounts();
  document.getElementById('walletAddress').innerText = "Connected: " + accounts[0];
}

async function fetchBNBPrice() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/bnb-price`);
    const data = await response.json();
    return data.bnbPriceUSD;
  } catch (error) {
    console.error('Error fetching BNB price:', error);
    return null;
  }
}

async function calculateMET() {
  const bnbAmountInput = document.getElementById('bnbAmount').value;
  const usdAmountInput = document.getElementById('usdAmount').value;
  const bnbPriceUSD = await fetchBNBPrice();

  if (!bnbPriceUSD) {
    alert("Failed to fetch BNB price.");
    return;
  }

  let bnbAmount;
  if (bnbAmountInput) {
    bnbAmount = parseFloat(bnbAmountInput);
  } else if (usdAmountInput) {
    const usdAmount = parseFloat(usdAmountInput);
    bnbAmount = usdAmount / bnbPriceUSD;
    document.getElementById('bnbAmount').value = bnbAmount.toFixed(6);
  } else {
    alert("Please enter an amount in BNB or USD.");
    return;
  }

  const usdValue = bnbAmount * bnbPriceUSD;
  document.getElementById('metAmount').innerText = `You will receive: ${usdValue.toFixed(2)} MET tokens.`;
  document.getElementById('buyButton').style.display = 'inline-block';
}

async function buyMET() {
  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value);
  if (!accounts.length) {
    alert("Please connect your wallet first.");
    return;
  }
  document.getElementById('status').innerText = "Processing purchase...";

  try {
    const response = await fetch(`${BACKEND_URL}/api/buy-met`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bnbAmount,
        buyerAddress: accounts[0]
      })
    });
    const data = await response.json();
    if (data.txHash) {
      document.getElementById('status').innerText = "Purchase successful! Tx Hash: " + data.txHash;
    } else {
      document.getElementById('status').innerText = "Purchase failed: " + data.error;
    }
  } catch (err) {
    document.getElementById('status').innerText = "Error: " + err.message;
  }
}

// Update conversion rate on page load
fetchBNBPrice().then(price => {
  if (price) document.getElementById('bnbPrice').innerText = `1 BNB = $${price} USD`;
});
