// // medicamentos.js

// const form = document.getElementById("medForm");
// const preview = document.getElementById("preview");
// const imagemInput = document.getElementById("imagem");

// let imagemBase64 = "";

// // Mostra a imagem antes do envio
// imagemInput.addEventListener("change", () => {
//     const file = imagemInput.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = () => {
//             imagemBase64 = reader.result;
//             preview.innerHTML = `<img src="${imagemBase64}" alt="Preview" style="width:100px; border-radius:8px;">`;
//         };
//         reader.readAsDataURL(file);
//     }
// });

// // Salva medicamento no Local Storage
// form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const nome = document.getElementById("nome").value;
//     const horario = document.getElementById("horario").value;
//     const quantidade = document.getElementById("quantidade").value;

//     const novoMedicamento = {
//         nome,
//         horario,
//         quantidade,
//         imagem: imagemBase64
//     };

//     // Pega lista atual do localStorage (ou cria uma nova)
//     const medicamentos = JSON.parse(localStorage.getItem("medicamentos")) || [];

//     // Adiciona novo
//     medicamentos.push(novoMedicamento);

//     // Salva de volta
//     localStorage.setItem("medicamentos", JSON.stringify(medicamentos));

//     alert("Medicamento cadastrado com sucesso!");

//     // Redireciona de volta para a página principal
//     window.location.href = "paginaPrincipal.html";
// });
// medicamentos.js
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("medForm");
    const preview = document.getElementById("preview");
    const imagemInput = document.getElementById("imagem");
    let imagemBase64 = "";

    if (!form) {
        console.error("❌ Formulário com id='medForm' não encontrado.");
        return;
    }

    // Pré-visualização da imagem
    imagemInput.addEventListener("change", () => {
        const file = imagemInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                imagemBase64 = reader.result;
                preview.innerHTML = `<img src="${imagemBase64}" alt="Preview" style="width:100px; border-radius:8px;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Cadastro de medicamento
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const horario = document.getElementById("horario").value.trim();
        const quantidade = document.getElementById("quantidade").value.trim();

        if (!nome || !horario || !quantidade) {
            alert("Preencha todos os campos!");
            return;
        }

        const novoMedicamento = {
            nome,
            horario,
            quantidade,
            imagem: imagemBase64
        };

        const medicamentos = JSON.parse(localStorage.getItem("medicamentos")) || [];
        medicamentos.push(novoMedicamento);
        localStorage.setItem("medicamentos", JSON.stringify(medicamentos));

        console.log("✅ Medicamento salvo no localStorage:", medicamentos);
        alert("Medicamento cadastrado com sucesso!");
        window.location.href = "paginaPrincipal.html";
    });
});
