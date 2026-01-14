document.getElementById('btnTest').addEventListener('click', async () => {
  const res = await fetch('/api/hello');
  const data = await res.json();
  document.getElementById('result').innerText = data.message;
});