document.getElementById('connectMetaMask').addEventListener('click', async () => {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('wallet-status').innerText = 'Connected: ' + ethereum.selectedAddress;
  }
});

async function fetchBNBPrice() {
  const res = await fetch('/api/bnb-price');
  const { bnbPriceUSD } = await res.json();
  document.getElementById('bnb-price').innerText = `BNB/USD: $${bnbPriceUSD}`;
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
