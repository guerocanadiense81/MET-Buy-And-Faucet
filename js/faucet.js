
document.addEventListener("DOMContentLoaded", () => {
  let userAddress = null;

  document.getElementById("connect").addEventListener("click", async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      userAddress = accounts[0];
      document.getElementById("wallet-status").innerText = `🟢 Connected: ${userAddress}`;
    }
  });

  document.getElementById("claim").addEventListener("click", async () => {
    if (!userAddress) return alert("Connect your wallet first");

    const res = await fetch("https://met-buy-and-faucet.onrender.com/api/claim-faucet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress })
    });
    const data = await res.json();
    if (data.txHash) {
      document.getElementById("faucet-status").innerText = `✅ Success! Tx: ${data.txHash}`;
    } else {
      document.getElementById("faucet-status").innerText = `❌ Error: ${data.error}`;
    }
  });
});
