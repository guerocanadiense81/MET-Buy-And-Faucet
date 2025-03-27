const BACKEND = "https://met-buy-and-faucet.onrender.com";

document.getElementById('connectMetaMask').addEventListener('click', async () => {
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.userAddress = accounts[0];
  }
});

async function fetchBNBPrice() {
  try {
    const res = await fetch(`${BACKEND}/api/bnb-price`);
    const { bnbPriceUSD } = await res.json();
    document.getElementById('bnb-price').innerText = `BNB/USD: $${bnbPriceUSD}`;
    window.currentBNBPrice = bnbPriceUSD;
  } catch (e) {
    document.getElementById('bnb-price').innerText = `BNB/USD: Error`;
  }
}
fetchBNBPrice();

document.getElementById('calculate').addEventListener('click', async () => {
  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  const usdAmount = parseFloat(document.getElementById('usdAmount').value || 0);
  let finalBNB = bnbAmount;

  if (!bnbAmount && usdAmount && window.currentBNBPrice) {
    finalBNB = usdAmount / window.currentBNBPrice;
  }

  const res = await fetch(`${BACKEND}/api/calculate-met`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bnbAmount: finalBNB })
  });

  const { metTokens } = await res.json();
  document.getElementById('metResult').innerText = `You will receive: ${metTokens.toFixed(4)} MET`;
});

document.getElementById('buy').addEventListener('click', async () => {
  if (!window.userAddress) return alert("Connect MetaMask first");
  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  if (!bnbAmount) return alert("Enter valid BNB amount");

  const res = await fetch(`${BACKEND}/api/buy-met`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyerAddress: window.userAddress, bnbAmount })
  });

  const data = await res.json();
  if (data.txHash) {
    alert(`Transaction successful: ${data.txHash}`);
  } else {
    alert(`Transaction failed: ${data.error}`);
  }
});
