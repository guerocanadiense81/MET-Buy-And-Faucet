// backend/server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Web3 = require('web3').default;
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load ABIs
const MET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abi', 'METToken.json')));
const FAUCET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abi', 'Faucet.json')));

// Setup Web3
const web3 = new Web3(process.env.INFURA_URL);

// Add admin account from PRIVATE_KEY
const admin = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(admin);
web3.eth.defaultAccount = admin.address;

// Create contract instances
const metContract = new web3.eth.Contract(MET_ABI, process.env.MET_CONTRACT_ADDRESS);
const faucetContract = new web3.eth.Contract(FAUCET_ABI, process.env.FAUCET_CONTRACT_ADDRESS);

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// === API Routes ===

// Get live BNB/USD rate
app.get('/api/bnb-price', async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: 'binancecoin',
        vs_currencies: 'usd'
      }
    });
    res.json({ bnbPriceUSD: data.binancecoin.usd });
  } catch {
    res.status(500).json({ error: 'Failed to fetch BNB price' });
  }
});

// Calculate MET based on BNB
app.post('/api/calculate-met', async (req, res) => {
  const { bnbAmount } = req.body;
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`);
    const usd = bnbAmount * data.binancecoin.usd;
    res.json({ metTokens: usd }); // 1 MET = $1
  } catch {
    res.status(500).json({ error: 'Failed to calculate' });
  }
});

// Buy MET
app.post('/api/buy-met', async (req, res) => {
  const { buyerAddress, bnbAmount } = req.body;
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`);
    const metAmount = bnbAmount * data.binancecoin.usd;

    const tx = await metContract.methods
      .transfer(buyerAddress, web3.utils.toWei(metAmount.toString(), 'ether'))
      .send({ from: admin.address, gas: 200000 });

    res.json({ txHash: tx.transactionHash, metTokens: metAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faucet claim
app.post('/api/claim-faucet', async (req, res) => {
  const { userAddress } = req.body;
  try {
    const tx = await faucetContract.methods.requestTokens().send({
      from: userAddress,
      gas: 150000,
    });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin set new drip amount
app.post('/api/update-drip', async (req, res) => {
  const { amount } = req.body;
  try {
    await faucetContract.methods
      .updateDripAmount(web3.utils.toWei(amount, 'ether'))
      .send({ from: admin.address });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 8080, () =>
  console.log(`🚀 Server listening on port ${process.env.PORT || 8080}`)
);
