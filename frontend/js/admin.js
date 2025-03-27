async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('admin-wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.adminAddress = accounts[0];
  }
}

async function updateDrip() {
  const amount = document.getElementById('dripAmount').value;
  if (!amount) return alert('Please enter a drip amount');

  const res = await fetch('/api/update-drip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  const data = await res.json();
  const status = document.getElementById('admin-status');
  if (data.success) {
    status.innerText = `Drip updated to ${amount} MET`;
  } else {
    status.innerText = `Error: ${data.error}`;
  }
}
