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

// ✅ Load ABI files
const MET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abi', 'METToken.json')));
const FAUCET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abi', 'Faucet.json')));

// ✅ Web3 Setup
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

// ✅ Admin Account Setup
const admin = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(admin);

// ✅ Contract Instances
const metContract = new web3.eth.Contract(MET_ABI, process.env.MET_CONTRACT_ADDRESS);
const faucetContract = new web3.eth.Contract(FAUCET_ABI, process.env.FAUCET_CONTRACT_ADDRESS);

// ✅ Serve frontend from GitHub Pages (external) – no need to serve static files here

// === API Endpoints ===

// ✅ Get BNB to USD conversion
app.get('/api/bnb-price', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    res.json({ bnbPriceUSD: data.binancecoin.usd });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BNB price' });
  }
});

// ✅ Calculate MET tokens based on BNB
app.post('/api/calculate-met', async (req, res) => {
  const { bnbAmount } = req.body;
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    const metTokens = bnbAmount * data.binancecoin.usd;
    res.json({ metTokens });
  } catch (err) {
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// ✅ Buy MET tokens with BNB (admin wallet sends MET to buyer)
app.post('/api/buy-met', async (req, res) => {
  const { buyerAddress, bnbAmount } = req.body;
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });

    const metTokens = bnbAmount * data.binancecoin.usd;
    const weiAmount = web3.utils.toWei(metTokens.toString(), 'ether');

    const tx = await metContract.methods.transfer(buyerAddress, weiAmount).send({
      from: admin.address,
      gas: 200000,
    });

    res.json({ txHash: tx.transactionHash, metTokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Claim Faucet
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

// ✅ Update drip amount (admin only)
app.post('/api/update-drip', async (req, res) => {
  const { amount } = req.body;
  try {
    await faucetContract.methods.updateDripAmount(web3.utils.toWei(amount, 'ether')).send({
      from: admin.address,
      gas: 150000,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Server listening
app.listen(process.env.PORT || 8080, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
