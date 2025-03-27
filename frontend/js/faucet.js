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

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.userAddress = accounts[0];
    toast('Wallet connected!', 'success');
  } else {
    toast('MetaMask not detected', 'error');
  }
}

async function claimFaucet() {
  if (!window.userAddress) return toast('Please connect wallet first', 'error');
  const res = await fetch('/api/claim-faucet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress: window.userAddress })
  });
  const data = await res.json();
  if (data.txHash) {
    toast(`Faucet claimed! Tx: ${data.txHash}`, 'success');
  } else {
    toast(`Error: ${data.error}`, 'error');
  }
}
