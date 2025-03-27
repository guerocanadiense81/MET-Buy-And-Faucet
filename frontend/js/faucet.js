let userAddress = '';

async function connectMetaMaskFaucet() {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      document.getElementById('wallet-status').textContent = `Connected: ${userAddress}`;
    } catch (err) {
      console.error(err);
    }
  } else {
    alert('MetaMask not found');
  }
}

async function claimTokens() {
  if (!userAddress) return alert('Connect wallet first.');

  try {
    const res = await fetch('/api/faucet-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress })
    });
    const data = await res.json();
    alert(`Tokens claimed! TX: ${data.txHash}`);
  } catch (err) {
    alert('Faucet claim failed');
  }
}
