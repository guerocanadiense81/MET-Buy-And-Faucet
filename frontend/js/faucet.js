// frontend/js/faucet.js

async function connectWallet() {
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.userAddress = accounts[0];
  } else {
    alert("MetaMask not detected");
  }
}

async function claimFaucet() {
  if (!window.userAddress) return alert('Connect your wallet first');

  const res = await fetch('/api/claim-faucet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress: window.userAddress }),
  });

  const data = await res.json();
  if (data.txHash) {
    document.getElementById('faucet-status').innerText = `Claim successful! Tx: ${data.txHash}`;
  } else {
    document.getElementById('faucet-status').innerText = `Error: ${data.error}`;
  }
}
