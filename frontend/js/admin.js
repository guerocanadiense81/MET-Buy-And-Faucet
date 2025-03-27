document.getElementById('updateDrip').addEventListener('click', async () => {
  const amount = document.getElementById('dripAmount').value;
  const res = await fetch('/api/update-drip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  alert(data.success ? "Drip updated!" : data.error);
});
