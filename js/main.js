
document.addEventListener("DOMContentLoaded", async () => {
  const connectButton = document.getElementById("connectMetaMask");
  const walletStatus = document.getElementById("wallet-status");
  const buyButton = document.getElementById("buy");
  const calculateBtn = document.getElementById("calculate");

  let userAddress = null;
  let bnbPriceUSD = 0;

  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      userAddress = accounts[0];
      walletStatus.innerText = "🟢 Connected: " + userAddress;
    } else {
      alert("MetaMask not found!");
    }
  }

  async function fetchBNBPrice() {
    const res = await fetch("https://met-buy-and-faucet.onrender.com/api/bnb-price");
    const { bnbPriceUSD: price } = await res.json();
    bnbPriceUSD = price;
    document.getElementById("bnb-price").innerText = `BNB/USD: $${bnbPriceUSD}`;
  }

  async function calculateMET() {
    const bnbAmount = parseFloat(document.getElementById("bnbAmount").value || 0);
    const usdAmount = parseFloat(document.getElementById("usdAmount").value || 0);
    let finalBNB = bnbAmount || (usdAmount / bnbPriceUSD);

    const res = await fetch("https://met-buy-and-faucet.onrender.com/api/calculate-met", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bnbAmount: finalBNB }),
    });
    const { metTokens } = await res.json();
    document.getElementById("metResult").innerText = `You will receive: ${metTokens.toFixed(4)} MET`;
  }

  async function buyMET() {
    if (!userAddress) return alert("Please connect wallet");
    const bnbAmount = parseFloat(document.getElementById("bnbAmount").value || 0);
    if (!bnbAmount) return alert("Enter BNB amount");

    const res = await fetch("https://met-buy-and-faucet.onrender.com/api/buy-met", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerAddress: userAddress, bnbAmount })
    });
    const data = await res.json();
    if (data.txHash) {
      alert(`Transaction successful! Tx Hash: ${data.txHash}`);
    } else {
      alert("Error: " + data.error);
    }
  }

  connectButton.addEventListener("click", connectWallet);
  calculateBtn.addEventListener("click", calculateMET);
  buyButton.addEventListener("click", buyMET);

  fetchBNBPrice();
});
