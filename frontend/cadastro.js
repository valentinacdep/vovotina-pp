
// pega o formulário pelo id cadastroForm
const form = document.getElementById('cadastroForm');
// Cria um evento para quando o usuário clicar em "Enviar".
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

// Envia os dados na rota /cadastro, usando POST
  const response = await fetch('http://localhost:3000/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({name, email, senha })
  });

  const result = await response.json();

  if (result.success) {
    localStorage.setItem("userId", result.id)
    window.location.href = "paginaPrincipal.html";
  } else {
    alert("Não foi possível realizar seu cadastro, tente novamente.");
  }
});

// Se o cadastro deu certo → redireciona. Se deu errado → mostra alerta. 
