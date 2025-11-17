function initMap() {
    const location = { lat: -29.7547, lng: -51.1498 }; // São Leopoldo
    const map = new google.maps.Map(document.getElementById("googleMap"), {
        zoom: 14,
        center: location,
    });
    new google.maps.Marker({
        position: location,
        map: map,
    });
}

document.getElementById("uploadForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const arquivo = document.getElementById("arquivo").files[0];
    if (!arquivo) return alert("Selecione um arquivo antes de enviar!");
  
    const formData = new FormData();
    formData.append("arquivo", arquivo);
  
    try {
        const res = await fetch('http://localhost:3000/uploadPDF', {
            method: 'POST',
            body: formData
      });
  
      const resultado = await resposta.text();
      document.getElementById("mensagem").innerText = resultado;
    } catch (err) {
      document.getElementById("mensagem").innerText = "Erro ao enviar o arquivo!";
    }
  });
  
// paginaPrincipal.js

// paginaPrincipal.js
// paginaPrincipal.js

document.addEventListener("DOMContentLoaded", async () => {
    const listaMedicamentos = document.getElementById("listaMedicamentos");
    const res = await fetch("http://localhost:3000/medicamentos");
    const result = await res.json();
    const medicamentos = result.result
  
    if (medicamentos.length === 0) {
      listaMedicamentos.innerHTML = "<p>Nenhum medicamento cadastrado ainda.</p>";
      return;
    }
  
    listaMedicamentos.innerHTML = ""; // limpa antes de renderizar
  
    medicamentos.forEach((med) => {
      const medDiv = document.createElement("div");
      medDiv.classList.add("med-item");
      medDiv.innerHTML = `
        <h3>${med.nome}</h3>
        <p><strong>Quantidade:</strong> ${med.quantidade}</p>
        <p><strong>Horário:</strong> ${med.horarios}</p>
        <hr>
      `;
      listaMedicamentos.appendChild(medDiv);
    });
  });
  