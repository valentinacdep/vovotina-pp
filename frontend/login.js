const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    console.log(response);

    const result = await response.json();

    if (response.ok && result.success) {
      // guarda o id do usuário no localStorage
      localStorage.setItem('userId', result.user.id);

      // redireciona pro perfil com o id na URL
      window.location.href = `paginaPerfil.html?id=${result.user.id}`;
    } else {
      alert("Usuário ou senha incorretos");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao conectar com o servidor.");
  }

  if (data.success) {
    localStorage.setItem("userId", data.user.id); // <- ESSA LINHA É ESSENCIAL
    localStorage.setItem("userName", data.user.name);
    window.location.href = "paginaPrincipal.html";
}
});
