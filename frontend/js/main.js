document.getElementById('connectMetaMask').addEventListener('click', async () => {
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    document.getElementById('wallet-status').innerText = `Connected: ${address}`;
    window.userAddress = address;
  } else {
    alert("MetaMask not found!");
  }
});

async function fetchBNBPrice() {
  const res = await fetch('/api/bnb-price');
  const { bnbPriceUSD } = await res.json();
  document.getElementById('bnb-price').innerText = `BNB/USD: $${bnbPriceUSD}`;
  return bnbPriceUSD;
}
fetchBNBPrice();

document.getElementById('calculate').addEventListener('click', async () => {
  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  const usdAmount = parseFloat(document.getElementById('usdAmount').value || 0);

  let finalBNB = bnbAmount;
  if (!bnbAmount && usdAmount) {
    const bnbPriceUSD = await fetchBNBPrice();
    finalBNB = usdAmount / bnbPriceUSD;
  }

  const res = await fetch('/api/calculate-met', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bnbAmount: finalBNB })
  });

  const { metTokens } = await res.json();
  document.getElementById('metResult').innerText = `You will receive: ${metTokens.toFixed(4)} MET`;
});

document.getElementById('buyBtn').addEventListener('click', async () => {
  if (!window.userAddress) return alert("Connect MetaMask first");

  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  if (!bnbAmount) return alert("Enter BNB amount");

  const res = await fetch('/api/buy-met', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bnbAmount, buyerAddress: window.userAddress })
  });

  const data = await res.json();
  if (data.txHash) {
    alert(`Success! Transaction Hash: ${data.txHash}`);
  } else {
    alert(`Error: ${data.error}`);
  }
});
