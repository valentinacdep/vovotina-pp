
// pode trocqar a foto com um arquivo
function trocarFoto(event) {
      const imagem = document.getElementById("fotoPerfil");
      const arquivo = event.target.files[0];
      if (arquivo) {
        imagem.src = URL.createObjectURL(arquivo);
      }
    }

  // define se está editando ou não, e pega os elementos da tela
    let editando = false;
    function editarConta() {
      const nome = document.getElementById("nome");
      const email = document.getElementById("email");
      const botao = document.getElementById("btnEditar");

    // se não estava editando libera os campos e muda o botão para “salvar” e se tava editando, 
    // trava os campos, muda o botão e mostra alerta.
      if (!editando) {
        nome.disabled = false;
        email.disabled = false;
        nome.focus();
        botao.textContent = "Salvar informações";
        editando = true;
      } else {
        nome.disabled = true;
        email.disabled = true;
        botao.textContent = "Editar informações da conta";
        alert("Informações salvas!");
        editando = false;
      }
    }