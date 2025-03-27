const BACKEND = "https://met-buy-and-faucet.onrender.com";

document.getElementById('connectAdmin').addEventListener('click', async () => {
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('admin-wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.adminAddress = accounts[0];
  }
});

document.getElementById('updateDrip').addEventListener('click', async () => {
  const amount = document.getElementById('dripAmount').value;
  if (!amount) return alert("Enter a drip amount");

  const res = await fetch(`${BACKEND}/api/update-drip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  const data = await res.json();
  if (data.success) {
    alert(`Drip updated to ${amount} MET`);
  } else {
    alert(`Error: ${data.error}`);
  }
});