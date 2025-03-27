# Recreate updated frontend JS scripts with Render backend URL
BASE_URL = "https://met-buy-and-faucet.onrender.com"

main_js = f"""const BASE_URL = '{BASE_URL}';

document.getElementById('connectMetaMask').addEventListener('click', async () => {{
  if (typeof window.ethereum !== 'undefined') {{
    await window.ethereum.request({{ method: 'eth_requestAccounts' }});
    document.getElementById('wallet-status').innerText = 'Connected: ' + ethereum.selectedAddress;
  }}
}});

async function fetchBNBPrice() {{
  const res = await fetch(`${{BASE_URL}}/api/bnb-price`);
  const {{ bnbPriceUSD }} = await res.json();
  document.getElementById('bnb-price').innerText = `BNB/USD: $${{bnbPriceUSD}}`;
}}
fetchBNBPrice();

document.getElementById('calculate').addEventListener('click', async () => {{
  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  const usdAmount = parseFloat(document.getElementById('usdAmount').value || 0);

  let finalBNB = bnbAmount;
  if (!bnbAmount && usdAmount) {{
    const res = await fetch(`${{BASE_URL}}/api/bnb-price`);
    const {{ bnbPriceUSD }} = await res.json();
    finalBNB = usdAmount / bnbPriceUSD;
  }}

  const res = await fetch(`${{BASE_URL}}/api/calculate-met`, {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({{ bnbAmount: finalBNB }}),
  }});
  const {{ metTokens }} = await res.json();
  document.getElementById('metResult').innerText = `You will receive: ${{metTokens.toFixed(4)}} MET`;
}});

document.getElementById('buy').addEventListener('click', async () => {{
  const bnbAmount = parseFloat(document.getElementById('bnbAmount').value || 0);
  if (!bnbAmount || !ethereum.selectedAddress) return alert('Enter BNB and connect wallet.');

  const res = await fetch(`${{BASE_URL}}/api/buy-met`, {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({{
      buyerAddress: ethereum.selectedAddress,
      bnbAmount
    }}),
  }});
  const data = await res.json();
  if (data.txHash) {{
    alert('Purchase successful! TX: ' + data.txHash);
  }} else {{
    alert('Error: ' + data.error);
  }}
}});
