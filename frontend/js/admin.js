async function updateDripAmount() {
  const amount = parseFloat(document.getElementById('drip-amount').value);
  if (!amount || amount <= 0) return alert('Enter a valid amount');

  try {
    const res = await fetch('/api/update-drip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    alert(`Drip updated! TX: ${data.txHash}`);
  } catch {
    alert('Failed to update drip');
  }
}

async function updateCooldown() {
  const cooldown = parseInt(document.getElementById('cooldown').value);
  if (!cooldown || cooldown < 60) return alert('Enter cooldown in seconds');

  try {
    const res = await fetch('/api/update-cooldown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cooldown })
    });
    const data = await res.json();
    alert(`Cooldown updated! TX: ${data.txHash}`);
  } catch {
    alert('Failed to update cooldown');
  }
}

async function withdrawTokens() {
  const amount = parseFloat(document.getElementById('withdraw-amount').value);
  if (!amount || amount <= 0) return alert('Invalid amount');

  try {
    const res = await fetch('/api/withdraw-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    alert(`Withdraw TX: ${data.txHash}`);
  } catch {
    alert('Withdraw failed');
  }
}
