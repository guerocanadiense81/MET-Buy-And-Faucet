document.getElementById('claimFaucet').addEventListener('click', async () => {
  if (!window.ethereum) return alert("Install MetaMask");

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const userAddress = ethereum.selectedAddress;

  const res = await fetch('/api/claim-faucet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress }),
  });

  const result = await res.json();
  alert(result.txHash ? "Success!" : `Error: ${result.error}`);
});

