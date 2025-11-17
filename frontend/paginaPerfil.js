document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Seleção dos Elementos ---
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const botaoEditar = document.getElementById("btnEditar");
  const botaoExcluir = document.getElementById("btnExcluir");

  // Flag para controlar o estado de edição
  let editando = false;

  // --- 2. Obter o ID do Usuário ---
  // Pega o ID que foi salvo no localStorage durante o login
  const userId = localStorage.getItem("userId");

  if (!userId) {
      alert("Usuário não identificado. Faça login novamente.");
      window.location.href = "login.html"; // Redireciona para o login
      return;
  }

  // --- 3. Carregar Dados Atuais do Usuário (GET) ---
  async function carregarDados() {
      try {
          const res = await fetch(`http://localhost:3000/usuario/${userId}`);
          const data = await res.json();

          if (data.success) {
              nomeInput.value = data.user.name;
              emailInput.value = data.user.email;
          } else {
              alert("Erro ao carregar informações do usuário.");
          }
      } catch (error) {
          console.error("Falha ao carregar dados:", error);
          alert("Não foi possível conectar ao servidor.");
      }
  }

  // --- 4. Função de ATUALIZAR (UPDATE / PUT) ---
  async function salvarAlteracoes() {
      try {
          const res = await fetch(`http://localhost:3000/usuario/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: nomeInput.value, email: emailInput.value })
          });

          const data = await res.json();
          
          alert(data.message); // "Informações atualizadas com sucesso!"
          
          if (data.success) {
              // Trava os campos novamente
              nomeInput.disabled = true;
              emailInput.disabled = true;
              botaoEditar.textContent = "Editar informações da conta";
              editando = false;
          }

      } catch (error) {
          console.error("Falha ao salvar:", error);
          alert("Erro ao salvar dados.");
      }
  }
  
  // --- 5. Função de EXCLUIR (DELETE) ---
  // Esta é a função que usa a sua rota do server.js
  async function excluirUsuario() {
      // Pede confirmação
      if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é permanente.")) {
          return;
      }

      try {
          const res = await fetch(`http://localhost:3000/usuario/${userId}`, {
              method: 'DELETE'
          });

          // Pega a resposta do servidor (ex: { success: true, message: "..." })
          const data = await res.json();
          
          alert(data.message); // Mostra a mensagem (sucesso ou erro)
          
          if(data.success) {
              // Se deu certo, limpa o login e manda para a página inicial
              localStorage.clear();
              window.location.href = "login.html";
          }

      } catch (error) {
          console.error("Falha ao excluir:", error);
          alert("Erro ao conectar com o servidor para excluir a conta.");
      }
  }


  // --- 6. Adicionar Event Listeners ---
  
  // Botão Editar/Salvar
  botaoEditar.addEventListener('click', () => {
      if (editando) {
          // Se estava editando, agora Salva
          salvarAlteracoes();
      } else {
          // Se não estava editando, Habilita a edição
          nomeInput.disabled = false;
          emailInput.disabled = false;
          botaoEditar.textContent = "Salvar Alterações";
          editando = true;
          nomeInput.focus();
      }
  });

  // Botão Excluir
  botaoExcluir.addEventListener('click', excluirUsuario);

  // --- 7. Carregar os dados iniciais ---
  carregarDados();

}); // Fim do DOMContentLoaded


// --- Função para a Foto (Chamada pelo HTML 'onchange') ---
// Esta função apenas troca a imagem na tela, ela não salva no servidor.
function trocarFoto(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          document.getElementById('fotoPerfil').src = e.target.result;
      }
      reader.readAsDataURL(file);
      
      // Lembrete: A lógica de salvar a foto no servidor ainda precisa ser implementada.
      alert("Visualização da foto atualizada (não salva no servidor).");
  }
}