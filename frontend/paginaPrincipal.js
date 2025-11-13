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

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
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
  
