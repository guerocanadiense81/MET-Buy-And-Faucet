require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Web3 = require('web3');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: 'https://guerocanadiense81.github.io' }));
app.use(express.json());

// Load ABIs
const MET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'abi', 'METToken.json')));
const FAUCET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'abi', 'Faucet.json')));

// Web3 setup
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
const admin = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(admin);

// Contract instances
const metContract = new web3.eth.Contract(MET_ABI, process.env.MET_CONTRACT_ADDRESS);
const faucetContract = new web3.eth.Contract(FAUCET_ABI, process.env.FAUCET_CONTRACT_ADDRESS);

// API Endpoints

// BNB Price
app.get('/api/bnb-price', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    console.log('BNB Price:', data);
    res.json({ bnbPriceUSD: data.binancecoin.usd });
  } catch (error) {
    console.error('Failed to fetch BNB price:', error);
    res.status(500).json({ error: 'Failed to fetch BNB price' });
  }
});

// MET Calculation
app.post('/api/calculate-met', async (req, res) => {
  const { bnbAmount } = req.body;
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    const met = bnbAmount * data.binancecoin.usd;
    res.json({ metTokens: met });
  } catch (error) {
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Buy MET
app.post('/api/buy-met', async (req, res) => {
  const { buyerAddress, bnbAmount } = req.body;
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    const metTokens = bnbAmount * data.binancecoin.usd;
    const tx = await metContract.methods.transfer(
      buyerAddress,
      web3.utils.toWei(metTokens.toString(), 'ether')
    ).send({ from: admin.address, gas: 200000 });

    res.json({ txHash: tx.transactionHash, metTokens });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Faucet Claim
app.post('/api/claim-faucet', async (req, res) => {
  const { userAddress } = req.body;
  try {
    const tx = await faucetContract.methods.requestTokens().send({
      from: userAddress,
      gas: 150000
    });
    res.json({ txHash: tx.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Drip Amount
app.post('/api/update-drip', async (req, res) => {
  const { amount } = req.body;
  try {
    await faucetContract.methods.updateDripAmount(web3.utils.toWei(amount, 'ether')).send({
      from: admin.address
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(process.env.PORT || 8080, () =>
  console.log(`🚀 Server listening on port ${process.env.PORT || 8080}`)
);
