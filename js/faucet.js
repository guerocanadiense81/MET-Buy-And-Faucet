const BACKEND = "https://met-buy-and-faucet.onrender.com";

document.getElementById('connectFaucet').addEventListener('click', async () => {
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('wallet-status').innerText = `Connected: ${accounts[0]}`;
    window.userAddress = accounts[0];
  }
});

document.getElementById('claimFaucet').addEventListener('click', async () => {
  if (!window.userAddress) return alert("Connect wallet first");

  const res = await fetch(`${BACKEND}/api/claim-faucet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress: window.userAddress })
  });

  const data = await res.json();
  if (data.txHash) {
    alert(`Faucet claimed! Tx: ${data.txHash}`);
  } else {
    alert(`Error: ${data.error}`);
  }
});
