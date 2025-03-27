document.addEventListener('DOMContentLoaded', () => {
  const walletStatus = document.getElementById('wallet-status');
  const statusEl = document.getElementById('faucet-status');
  let userAddress = null;

  window.connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      walletStatus.textContent = `Connected: ${userAddress}`;
    } else {
      alert('Please install MetaMask!');
    }
  };

  window.claimFaucet = async () => {
    if (!userAddress) return alert('Please connect wallet first');

    const res = await fetch('https://met-buy-and-faucet.onrender.com/api/claim-faucet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress }),
    });

    const data = await res.json();
    if (data.txHash) {
      statusEl.textContent = `✅ Claimed! TX: ${data.txHash}`;
    } else {
      statusEl.textContent = `❌ Error: ${data.error}`;
    }
  };
});
