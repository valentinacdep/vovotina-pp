const form = document.getElementById("uploadForm");
const mensagem = document.getElementById("mensagem");
const lista = document.getElementById("listaArquivos");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const arquivo = document.getElementById("arquivo").files[0];
  if (!arquivo) return alert("Escolhe um arquivo!");

  const formData = new FormData();
  formData.append("arquivo", arquivo);

  try {
    const res = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });
    const msg = await res.text();
    mensagem.innerText = msg;
    carregarArquivos();
  } catch {
    mensagem.innerText = "Erro ao enviar!";
  }
});

async function carregarArquivos() {
  const res = await fetch("http://localhost:3000/upload");
  const arquivos = await res.json();

  lista.innerHTML = "";
  arquivos.forEach(a => {
    const link = document.createElement("a");
    link.href = a.caminho;
    link.textContent = a.nome_arquivo;
    link.target = "_blank";
    lista.appendChild(link);
    lista.appendChild(document.createElement("br"));
  });
}

// Carregar na abertura da página
carregarArquivos();
