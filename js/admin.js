
document.addEventListener("DOMContentLoaded", () => {
  let adminAddress = null;

  document.getElementById("connect").addEventListener("click", async () => {
    if (window.ethereum) {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      adminAddress = accounts[0];
      document.getElementById("admin-wallet-status").innerText = `🟢 Connected: ${adminAddress}`;
    }
  });

  document.getElementById("update-drip").addEventListener("click", async () => {
    const amount = document.getElementById("dripAmount").value;
    if (!amount) return alert("Enter drip amount in MET");

    const res = await fetch("https://met-buy-and-faucet.onrender.com/api/update-drip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("admin-status").innerText = `✅ Drip updated to ${amount} MET`;
    } else {
      document.getElementById("admin-status").innerText = `❌ Error: ${data.error}`;
    }
  });
});
