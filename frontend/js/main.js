document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectMetaMask');
  const walletStatus = document.getElementById('wallet-status');
  const bnbPriceEl = document.getElementById('bnb-price');
  const metResult = document.getElementById('metResult');

  let userAddress = null;

  connectBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      walletStatus.textContent = `Connected: ${userAddress}`;
    } else {
      alert('Please install MetaMask!');
    }
  });

  async function fetchBNBPrice() {
    const res = await fetch('https://met-buy-and-faucet.onrender.com/api/bnb-price');
    const { bnbPriceUSD } = await res.json();
    bnbPriceEl.textContent = `BNB/USD: $${bnbPriceUSD}`;
    return bnbPriceUSD;
  }

  fetchBNBPrice();

  document.getElementById('calculate').addEventListener('click', async () => {
    const bnb = parseFloat(document.getElementById('bnbAmount').value) || 0;
    const usd = parseFloat(document.getElementById('usdAmount').value) || 0;

    let finalBNB = bnb;
    if (!bnb && usd) {
      const price = await fetchBNBPrice();
      finalBNB = usd / price;
    }

    const res = await fetch('https://met-buy-and-faucet.onrender.com/api/calculate-met', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bnbAmount: finalBNB }),
    });

    const { metTokens } = await res.json();
    metResult.textContent = `You will receive: ${metTokens.toFixed(4)} MET`;
  });

  document.getElementById('buy').addEventListener('click', async () => {
    if (!userAddress) return alert('Connect MetaMask first');

    const bnbAmount = parseFloat(document.getElementById('bnbAmount').value);
    if (!bnbAmount) return alert('Enter BNB amount');

    const res = await fetch('https://met-buy-and-faucet.onrender.com/api/buy-met', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerAddress: userAddress, bnbAmount }),
    });

    const data = await res.json();
    if (data.txHash) {
      alert(`✅ Success! TX Hash: ${data.txHash}`);
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  });
});
