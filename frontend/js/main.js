// frontend/js/main.js

document.getElementById('connectMetaMask').addEventListener('click', async () => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('wallet-status').innerText = 'Connected: ' + accounts[0];
    window.userAddress = accounts[0];
  } else {
    alert("MetaMask not found");
  }
});

async function fetchBNBPrice() {
  try {
    const res = await fetch('/api/bnb-price');
    const { bnbPriceUSD } = await res.json();
    document.getElementById('bnb-price').innerText = `BNB/USD: $${bnbPriceUSD}`;
  } catch {
    document.getElementById('bnb-price').innerText = `Failed to load price`;
  }
}
fetchBNBPrice();

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

document.getElementById('buy').addEventListener('click', async () => {
  if (!window.userAddress) return alert("Connect wallet first");

  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value);
  const res = await fetch('/api/buy-met', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyerAddress: window.userAddress, bnbAmount }),
  });

  const data = await res.json();
  if (data.txHash) {
    alert(`Success! Tx: ${data.txHash}`);
  } else {
    alert(`Error: ${data.error}`);
  }
});
