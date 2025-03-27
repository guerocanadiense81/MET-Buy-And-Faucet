require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Web3 = require('web3');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
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

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Endpoints

// Price feed
app.get('/api/bnb-price', async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`);
    res.json({ bnbPriceUSD: data.binancecoin.usd });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch BNB price' });
  }
});

// Calculate MET amount
app.post('/api/calculate-met', async (req, res) => {
  const { bnbAmount } = req.body;
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`);
    const met = bnbAmount * data.binancecoin.usd;
    res.json({ metTokens: met });
  } catch {
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Buy MET tokens
app.post('/api/buy-met', async (req, res) => {
  const { buyerAddress, bnbAmount } = req.body;
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`);
    const metTokens = bnbAmount * data.binancecoin.usd;

    const tx = await metContract.methods.transfer(buyerAddress, web3.utils.toWei(metTokens.toString(), 'ether')).send({
      from: admin.address,
      gas: 200000,
    });

    res.json({ txHash: tx.transactionHash, metTokens });
  } catch (e) {
    res.status(500).json({ error: e.message });
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

// Admin updates
app.post('/api/update-drip', async (req, res) => {
  const { amount } = req.body;
  try {
    await faucetContract.methods.updateDripAmount(web3.utils.toWei(amount, 'ether')).send({ from: admin.address });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
