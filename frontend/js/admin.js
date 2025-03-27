admin_js = f"""const BASE_URL = '{BASE_URL}';

async function connectWallet() {{
  if (typeof window.ethereum !== 'undefined') {{
    const accounts = await window.ethereum.request({{ method: 'eth_requestAccounts' }});
    document.getElementById('admin-wallet-status').innerText = `Connected: ${{accounts[0]}}`;
    window.adminAddress = accounts[0];
  }}
}}

async function updateDrip() {{
  const amount = document.getElementById('dripAmount').value;
  if (!amount) return alert('Enter amount');
  const res = await fetch(`${{BASE_URL}}/api/update-drip`, {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({{ amount }})
  }});
  const data = await res.json();
  if (data.success) {{
    document.getElementById('admin-status').innerText = `Drip updated to ${{amount}} MET`;
  }} else {{
    document.getElementById('admin-status').innerText = `Error: ${{data.error}}`;
  }}
}}
