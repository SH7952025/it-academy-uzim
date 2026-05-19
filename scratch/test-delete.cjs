const testDelete = async () => {
  try {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' })
    });
    
    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      process.exit(1);
    }
    
    const { token } = await loginRes.json();
    console.log('Logged in successfully, token received.');

    // 2. Try to delete enrollment ID 51 (which we verified is active)
    const deleteRes = await fetch('http://localhost:5001/api/enrollments/51', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Delete response status:', deleteRes.status);
    console.log('Delete response body:', await deleteRes.text());
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testDelete();
