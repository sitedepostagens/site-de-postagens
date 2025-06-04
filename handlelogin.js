function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const errorElement = document.getElementById('register-error');
  const successElement = document.getElementById('register-success');

  errorElement.style.display = 'none';
  successElement.style.display = 'none';

  if (username.length < 3) {
    errorElement.textContent = "O nome de usuário deve ter pelo menos 3 caracteres.";
    errorElement.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorElement.textContent = "A senha deve ter pelo menos 6 caracteres.";
    errorElement.style.display = 'block';
    return;
  }

  const fakeEmail = `${username}@compartilha.com`;

  auth.createUserWithEmailAndPassword(fakeEmail, password)
    .then(userCredential => {
      localStorage.setItem('loggedInUser', username);
      loggedInUser = username;

      // Atualizar UI
      updateUI();
      successElement.textContent = `Cadastro bem-sucedido, ${username}! Redirecionando...`;
      successElement.style.display = 'block';

      setTimeout(() => {
        showFeedPage();
      }, 1500);
    })
    .catch(error => {
      errorElement.textContent = "Erro ao cadastrar: " + error.message;
      errorElement.style.display = 'block';
    });
}
