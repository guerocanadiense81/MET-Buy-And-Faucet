document.addEventListener('DOMContentLoaded', () => {
  const walletStatus = document.getElementById('admin-wallet-status');
  const statusEl = document.getElementById('admin-status');
  let adminAddress = null;

  window.connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      adminAddress = accounts[0];
      walletStatus.textContent = `Connected: ${adminAddress}`;
    } else {
      alert('Please install MetaMask!');
    }
  };

  window.updateDrip = async () => {
    const amount = document.getElementById('dripAmount').value;
    if (!amount) return alert('Enter amount');

    const res = await fetch('https://met-buy-and-faucet.onrender.com/api/update-drip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    if (data.success) {
      statusEl.textContent = `✅ Drip updated to ${amount} MET`;
    } else {
      statusEl.textContent = `❌ Error: ${data.error}`;
    }
  };
});
