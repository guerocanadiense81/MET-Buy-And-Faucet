let userAddress = null;

// Connect Wallet Button
document.getElementById('connectMetaMask').addEventListener('click', async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      document.getElementById('wallet-status').innerText = 'Connected: ' + userAddress;
    } catch (err) {
      console.error('Connection failed:', err);
    }
  } else {
    alert('MetaMask not found. Please install it.');
  }
});

// Fetch BNB/USD Price on Load
async function fetchBNBPrice() {
  try {
    const res = await fetch('/api/bnb-price');
    const { bnbPriceUSD } = await res.json();
    document.getElementById('bnb-price').innerText = `BNB/USD: $${bnbPriceUSD}`;
  } catch {
    document.getElementById('bnb-price').innerText = 'Failed to fetch BNB price';
  }
}
fetchBNBPrice();

// Calculate MET Tokens
document.getElementById('calculate').addEventListener('click', async () => {
  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  const usdAmount = parseFloat(document.getElementById('usdAmount').value || 0);

  let finalBNB = bnbAmount;
  if (!bnbAmount && usdAmount) {
    const res = await fetch('/api/bnb-price');
    const { bnbPriceUSD } = await res.json();
    finalBNB = usdAmount / bnbPriceUSD;
  }

  const res = await fetch('/api/calculate-met', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bnbAmount: finalBNB }),
  });
  const { metTokens } = await res.json();
  document.getElementById('metResult').innerText = `You will receive: ${metTokens.toFixed(4)} MET`;
});

// Buy MET Button
document.getElementById('buy').addEventListener('click', async () => {
  if (!userAddress) return alert('Please connect MetaMask first.');

  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  if (!bnbAmount || bnbAmount <= 0) return alert('Enter valid BNB amount');

  try {
    const res = await fetch('/api/buy-met', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerAddress: userAddress, bnbAmount }),
    });
    const data = await res.json();

    if (data.txHash) {
      alert(`✅ MET Purchase Successful!\nTX: ${data.txHash}`);
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    alert('❌ Transaction Failed');
    console.error(err);
  }
});
