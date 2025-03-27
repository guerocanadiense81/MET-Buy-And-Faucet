faucet_js = f"""const BASE_URL = '{BASE_URL}';

async function connectWallet() {{
  if (typeof window.ethereum !== 'undefined') {{
    const accounts = await window.ethereum.request({{ method: 'eth_requestAccounts' }});
    document.getElementById('wallet-status').innerText = `Connected: ${{accounts[0]}}`;
    window.userAddress = accounts[0];
  }}
}}

async function claimFaucet() {{
  if (!window.userAddress) return alert('Please connect wallet first');
  const res = await fetch(`${{BASE_URL}}/api/claim-faucet`, {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({{ userAddress: window.userAddress }})
  }});
  const data = await res.json();
  if (data.txHash) {{
    document.getElementById('faucet-status').innerText = `Success! Tx: ${{data.txHash}}`;
  }} else {{
    document.getElementById('faucet-status').innerText = `Error: ${{data.error}}`;
  }}
}}
