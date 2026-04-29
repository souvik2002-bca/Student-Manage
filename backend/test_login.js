(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'adminpassword' })
    });
    const data = await res.json();
    console.log('Login response:', data);
  } catch (error) {
    console.error('Login request failed:', error);
  }
})();
