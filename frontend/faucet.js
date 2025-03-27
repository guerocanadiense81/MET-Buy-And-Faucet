const faucetAddress = "0x09743059aFB2a5C9dC496DEd641B54Dc32577356";
// Replace with your actual Faucet ABI from abi/Faucet.json
const faucetAbi = [ /* Paste your Faucet ABI here */ ];

async function requestFaucet() {
  if (typeof window.ethereum === 'undefined') {
    alert("Please install MetaMask.");
    return;
  }
  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const accounts = await web3.eth.getAccounts();
  const faucetContract = new web3.eth.Contract(faucetAbi, faucetAddress);
  try {
    await faucetContract.methods.requestTokens().send({ from: accounts[0] });
    document.getElementById("faucetStatus").innerText = "Faucet request successful!";
  } catch (err) {
    document.getElementById("faucetStatus").innerText = "Error: " + err.message;
  }
}
