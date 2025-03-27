const faucetAddress = "0x09743059aFB2a5C9dC496DEd641B54Dc32577356";
// Replace with your actual Faucet ABI from abi/Faucet.json
const faucetAbi = [ /* Paste your Faucet ABI here */ ];

let web3;
let adminAccount;
let faucetContract;

async function connectAdmin() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    adminAccount = accounts[0];
    document.getElementById("adminWallet").innerText = "Connected: " + adminAccount;
    faucetContract = new web3.eth.Contract(faucetAbi, faucetAddress);
  } else {
    alert("Please install MetaMask.");
  }
}

async function updateDrip() {
  const newDrip = document.getElementById("newDrip").value;
  if (!newDrip || !faucetContract) return alert("Enter a valid drip amount or connect wallet");
  try {
    const tx = await faucetContract.methods.updateDripAmount(web3.utils.toWei(newDrip, "ether")).send({ from: adminAccount });
    document.getElementById("adminStatus").innerText = "Drip amount updated. Tx: " + tx.transactionHash;
  } catch (error) {
    document.getElementById("adminStatus").innerText = "Error: " + error.message;
  }
}

async function updateCooldown() {
  const newCooldown = document.getElementById("newCooldown").value;
  if (!newCooldown || !faucetContract) return alert("Enter a valid cooldown or connect wallet");
  try {
    const tx = await faucetContract.methods.updateCooldown(newCooldown).send({ from: adminAccount });
    document.getElementById("adminStatus").innerText = "Cooldown updated. Tx: " + tx.transactionHash;
  } catch (error) {
    document.getElementById("adminStatus").innerText = "Error: " + error.message;
  }
}

async function withdrawTokens() {
  const amount = document.getElementById("withdrawAmount").value;
  if (!amount || !faucetContract) return alert("Enter a valid amount or connect wallet");
  try {
    const tx = await faucetContract.methods.withdrawTokens(web3.utils.toWei(amount, "ether")).send({ from: adminAccount });
    document.getElementById("adminStatus").innerText = "Withdraw successful. Tx: " + tx.transactionHash;
  } catch (error) {
    document.getElementById("adminStatus").innerText = "Error: " + error.message;
  }
}
