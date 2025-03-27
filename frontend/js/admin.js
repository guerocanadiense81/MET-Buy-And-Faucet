// frontend/js/admin.js

async function connectWallet() {
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('admin-wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.adminAddress = accounts[0];
  } else {
    alert("Please install MetaMask");
  }
}

async function updateDrip() {
  const amount = document.getElementById('dripAmount').value;
  if (!amount) return alert('Enter a drip amount');

  const res = await fetch('/api/update-drip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById('admin-status').innerText = `Drip updated to ${amount} MET`;
  } else {
    document.getElementById('admin-status').innerText = `Error: ${data.error}`;
  }
}
