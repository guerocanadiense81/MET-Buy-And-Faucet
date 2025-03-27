document.addEventListener('DOMContentLoaded', () => {
  const toast = (msg, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        toast.remove();
      }, 3000);
    }, 100);
  };

  document.getElementById('connectMetaMask').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        document.getElementById('wallet-status').innerText = `Connected: ${ethereum.selectedAddress}`;
        toast('Wallet connected!', 'success');
      } catch (err) {
        toast('Connection failed: ' + err.message, 'error');
      }
    } else {
      toast('MetaMask is not installed!', 'error');
    }
  });

  async function fetchBNBPrice() {
    try {
      const res = await fetch('/api/bnb-price');
      const { bnbPriceUSD } = await res.json();
      document.getElementById('bnb-price').innerText = `BNB/USD: $${bnbPriceUSD}`;
    } catch {
      toast('Failed to fetch BNB price', 'error');
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
    const buyerAddress = window.ethereum.selectedAddress;
    const bnbAmount = parseFloat(document.getElementById('bnbAmount').value);
    if (!buyerAddress || !bnbAmount) return toast('Missing wallet or BNB amount', 'error');

    const res = await fetch('/api/buy-met', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bnbAmount, buyerAddress }),
    });

    const data = await res.json();
    if (data.txHash) {
      toast(`Purchase successful! Tx: ${data.txHash}`, 'success');
    } else {
      toast(`Purchase failed: ${data.error}`, 'error');
    }
  });
});
