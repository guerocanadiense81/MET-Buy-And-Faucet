require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Web3 = require('web3');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Read ABI files from the sibling abi folder
const MET_ABI = JSON.parse(fs.readFileSync('../abi/METToken.json'));
const FAUCET_ABI = JSON.parse(fs.readFileSync('../abi/Faucet.json'));

// Connect to BSC via Infura RPC URL (or your preferred endpoint)
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

// Create contract instances
const metContract = new web3.eth.Contract(MET_ABI, process.env.MET_CONTRACT_ADDRESS);
const faucetContract = new web3.eth.Contract(FAUCET_ABI, process.env.FAUCET_CONTRACT_ADDRESS);

// Serve static files from project root
app.use(express.static(path.join(__dirname, '..')));

// Serve HTML files from /views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});
app.get('/faucet.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'faucet.html'));
});
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});
// Derive admin account from PRIVATE_KEY
const admin = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(admin);

// Endpoint: Get current BNB/USD price from CoinGecko
app.get('/api/bnb-price', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    const bnbPriceUSD = response.data.binancecoin.usd;
    res.json({ bnbPriceUSD });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BNB price' });
  }
});

// Endpoint: Calculate MET tokens for a given BNB amount (1 MET = 1 USD)
app.post('/api/calculate-met', async (req, res) => {
  const { bnbAmount } = req.body;
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    const bnbPriceUSD = response.data.binancecoin.usd;
    const usdValue = bnbAmount * bnbPriceUSD;
    const metTokens = usdValue; // 1 MET = 1 USD
    res.json({ metTokens });
  } catch (error) {
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Endpoint: Process MET purchase by transferring MET tokens to buyer
app.post('/api/buy-met', async (req, res) => {
  const { bnbAmount, buyerAddress } = req.body;
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    const bnbPriceUSD = response.data.binancecoin.usd;
    const usdValue = bnbAmount * bnbPriceUSD;
    const metTokens = usdValue; // 1 MET = 1 USD

    // Transfer MET tokens from admin's account to buyer
    const tx = await metContract.methods.transfer(buyerAddress, web3.utils.toWei(metTokens.toString(), 'ether')).send({
      from: admin.address,
      gas: 200000,
    });
    res.json({ txHash: tx.transactionHash, metTokens });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed: ' + error.message });
  }
});

app.listen(process.env.PORT, () => console.log(`Backend running on port ${process.env.PORT}`));
