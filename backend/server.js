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

const MET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abi', 'METToken.json')));
const FAUCET_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abi', 'Faucet.json')));

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
const admin = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(admin);

const metContract = new web3.eth.Contract(MET_ABI, process.env.MET_CONTRACT_ADDRESS);
const faucetContract = new web3.eth.Contract(FAUCET_ABI, process.env.FAUCET_CONTRACT_ADDRESS);

app.use(express.static(path.join(__dirname, '..')));

app.get('/api/bnb-price', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    res.json({ bnbPriceUSD: data.binancecoin.usd });
  } catch {
    res.status(500).json({ error: 'Failed to fetch BNB price' });
  }
});

app.post('/api/calculate-met', async (req, res) => {
  const { bnbAmount } = req.body;
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
    const met = bnbAmount * data.binancecoin.usd;
    res.json({ metTokens: met });
  } catch {
    res.status(500).json({ error: 'Conversion failed' });
  }
});

app.post('/api/buy-met', async (req, res) => {
  const { buyerAddress, bnbAmount } = req.body;
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'binancecoin', vs_currencies: 'usd' }
    });
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

app.post('/api/update-drip', async (req, res) => {
  const { amount } = req.body;
  try {
    await faucetContract.methods.updateDripAmount(web3.utils.toWei(amount, 'ether')).send({ from: admin.address });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => console.log(`🚀 Server listening on port ${process.env.PORT}`));