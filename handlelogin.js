function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!username || !password) { 
    alert("Preencha todos os campos!"); 
    return; 
  }
  fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw new Error(err.message || "Erro ao realizar login"); });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem('loggedInUser', username);
      loggedInUser = username;
      alert(`Login bem-sucedido, ${username}!`);
      hideAllSections();
      document.getElementById('profile-section').style.display = 'block';
      document.getElementById('profile-username').textContent = loggedInUser;
    } else {
      document.getElementById('login-error').style.display = 'block';
    }
  })
  .catch(err => { 
    console.error("Erro ao realizar login:", err);
    alert("Erro ao realizar login: " + err.message);
  });
}
