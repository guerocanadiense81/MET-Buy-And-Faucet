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
    document.getElementById('admin-wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.adminAddress = accounts[0];
    toast('Admin wallet connected!', 'success');
  } else {
    toast('MetaMask not found!', 'error');
  }
}

async function updateDrip() {
  const amount = document.getElementById('dripAmount').value;
  if (!amount) return toast('Enter amount', 'error');

  const res = await fetch('/api/update-drip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
  const data = await res.json();
  if (data.success) {
    toast(`Drip updated to ${amount} MET`, 'success');
  } else {
    toast(`Update failed: ${data.error}`, 'error');
  }
}
