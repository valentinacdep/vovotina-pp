// pega o ID da URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const botao = document.getElementById("btnEditar");

let editando = false;

// carrega dados do usuário logado
async function carregarUsuario() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || localStorage.getItem("userId");

  if (!id) {
    alert("Usuário não identificado. Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`http://localhost:3000/usuario/${id}`);
  const data = await res.json();

  if (data.success) {
    document.getElementById("nome").value = data.user.name;
    document.getElementById("email").value = data.user.email;
  } else {
    alert("Erro ao carregar informações do usuário.");
  }
}

window.onload = carregarUsuario;