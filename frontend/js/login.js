// o login é praticamente igual só pega email e senha envia para /login;
// se sucesso → redireciona, se falha → mostra “Usuário ou senha incorretos”.
const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;

      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "paginaPerfil.html";
      } else {
        alert("Usuário ou senha incorretos");
      }
});