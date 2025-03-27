let bnbPriceUSD = 0;
let userAddress = '';

window.addEventListener('load', async () => {
  await fetchBNBPrice();
});

async function fetchBNBPrice() {
  try {
    const res = await fetch('/api/bnb-price');
    const data = await res.json();
    bnbPriceUSD = data.bnbPriceUSD;
    document.getElementById('bnb-price').textContent = `1 BNB = $${bnbPriceUSD}`;
  } catch {
    document.getElementById('bnb-price').textContent = 'Failed to fetch BNB price';
  }
}

async function connectMetaMask() {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      document.getElementById('wallet-status').textContent = `Connected: ${userAddress}`;
    } catch (err) {
      console.error(err);
    }
  } else {
    alert('MetaMask not detected');
  }
}

async function calculateMET() {
  const bnbAmount = parseFloat(document.getElementById('bnb-amount').value) || 0;
  const usdAmount = parseFloat(document.getElementById('usd-amount').value) || 0;

  let met = 0;
  if (bnbAmount) {
    met = bnbAmount * bnbPriceUSD;
  } else if (usdAmount) {
    met = usdAmount;
  }

  document.getElementById('result').textContent = `You will receive: ${met} MET`;
}

async function buyMET() {
  if (!userAddress) return alert('Connect wallet first.');

  const bnbAmount = parseFloat(document.getElementById('bnb-amount').value);
  if (!bnbAmount || bnbAmount <= 0) return alert('Enter BNB amount');

  try {
    const res = await fetch('/api/buy-met', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bnbAmount, buyerAddress: userAddress })
    });
    const data = await res.json();
    alert(`Success! TX: ${data.txHash}`);
  } catch (err) {
    alert('Transaction failed.');
  }
}
