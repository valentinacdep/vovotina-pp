const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connection = require("./db_config");
const multer = require("multer");

const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIGURAÇÃO DO MULTER =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ===== ROTAS DE CADASTRO E LOGIN =====
app.post("/cadastro", (req, res) => {
  const { name, email, senha } = req.body;
  const query = "INSERT INTO users (name, email, senha) VALUES (?, ?, ?)";
  connection.query(query, [name, email, senha], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao cadastrar." });
    }
    res.json({ success: true, message: "Você foi cadastrado", id: result.insertId });
  });
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND senha = ?";
  connection.query(query, [email, senha], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro no login." });
    }
    if (results.length > 0) {
      res.json({ success: true, message: "Login realizado com sucesso", user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Usuário ou senha inválidos" });
    }
  });
});

// ===== UPLOAD DE CONTEÚDOS DIDÁTICOS =====
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
  }

  const nome_arquivo = req.file.originalname;
  const caminho = `/uploads/${req.file.filename}`;

  const query = "INSERT INTO conteudos (nome_arquivo, caminho) VALUES (?, ?)";
  connection.query(query, [nome_arquivo, caminho], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Erro ao salvar no banco." });
    }
    res.json({
      success: true,
      message: "Arquivo enviado com sucesso!",
      id: result.insertId,
      caminho,
    });
  });
});

// ===== LISTAR CONTEÚDOS =====
app.get("/conteudos", (req, res) => {
  connection.query("SELECT * FROM conteudos ORDER BY criado_em DESC", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

// ===== SERVIR ARQUIVOS UPLOADS E PDFS =====
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/pdfs", express.static(path.join(__dirname, "public", "pdfs")));

// ===== PÁGINA INICIAL =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/medicamentos", (req, res) => {
  const { nome,
    horario,
    quantidade,
    usuario_id } = req.body;

  connection.query("INSERT INTO medicamentos (nome, horarios, quantidade, usuario_id) VALUES (?, ?, ?, ?)", [nome, horario, quantidade, usuario_id], (err, result) => {
    console.log(err)
    if (err) {
      res.status(500).json({error: "Erro"});
    }
    res.json({ message: "Sucesso" });
  })
})

app.get("/medicamentos", (req, res) => {
  connection.query("SELECT * FROM medicamentos", (err, result) => {
    console.log(err)
    if (err) {
      res.status(500).json({error: "Erro"});
    }
    res.json({ message: "Sucesso", result });
  })
})

// ===== SOCKET.IO (CHAT PRIVADO) =====
const onlineUsers = new Map();
const messages = {};

function chatKey(a, b) {
  return [String(a), String(b)].sort().join(":");
}

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  socket.on("authenticate", ({ id, name }) => {
    if (!id) return;
    onlineUsers.set(String(id), { socketId: socket.id, name });
    console.log(`🔹 ${name} autenticado (${id})`);
    atualizarUsuariosOnline();
  });

  socket.on("load-history", (otherId) => {
    const userEntry = [...onlineUsers.entries()].find(([, v]) => v.socketId === socket.id);
    const userId = userEntry ? userEntry[0] : null;
    if (!userId) return;
    const key = chatKey(userId, otherId);
    socket.emit("history", messages[key] || []);
  });

  socket.on("private-message", ({ recipient, message, senderId, senderName }) => {
    if (!recipient || !message) return;
    const key = chatKey(senderId, recipient);
    messages[key] = messages[key] || [];
    const data = { senderId, senderName, message, ts: Date.now() };
    messages[key].push(data);

    const rec = onlineUsers.get(String(recipient));
    if (rec && rec.socketId) {
      io.to(rec.socketId).emit("private-message", { sender: senderId, senderName, message });
    }

    socket.emit("private-message", { sender: senderId, senderName, message });
  });

  socket.on("disconnect", () => {
    const entry = [...onlineUsers.entries()].find(([, v]) => v.socketId === socket.id);
    if (entry) {
      onlineUsers.delete(entry[0]);
      console.log(`Usuário ${entry[1].name} saiu.`);
      atualizarUsuariosOnline();
    }
  });
});

function atualizarUsuariosOnline() {
  const list = [...onlineUsers.entries()].map(([id, v]) => ({ id, name: v.name }));
  io.emit("update-user-list", list);
}




// ===== BUSCAR DADOS DE UM USUÁRIO =====
// Em server.js, dentro da rota GET
app.get("/usuario/:id", (req, res) => {
  const { id } = req.params;
  // DEBUG DO SERVIDOR
  console.log(`[Servidor] Recebida requisição GET para /usuario/${id}`);
  const query = "SELECT id, name, email FROM users WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar usuário." });
    if (results.length === 0) {
      // DEBUG DO SERVIDOR
      console.log(`[Servidor] NENHUM usuário encontrado com ID: ${id}`);
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }
    console.log(`[Servidor] Usuário encontrado: ${results[0].name}`);
    res.json({ success: true, user: results[0] });
  });
});


// ===== EXCLUIR UM USUÁRIO (DELETE) =====

app.delete("/usuario/:id", (req, res) => {

  // 1. Pega o ID que veio na URL (ex: /usuario/42)

  const { id } = req.params;
 
  // 2. Cria a query SQL

  // (Certifique-se que sua tabela 'users' permite DELETE)

  const query = "DELETE FROM users WHERE id = ?";

  // 3. Executa a query no banco

  connection.query(query, [id], (err, result) => {

    // Se der erro no banco

    if (err) {

      console.error("Erro no banco de dados:", err);

      return res.status(500).json({ 

        success: false, 

        message: "Erro ao tentar excluir o usuário." 

      });

    }

    // 4. Verifica se algo foi realmente deletado

    // Se affectedRows for 0, significa que o ID não existia

    if (result.affectedRows === 0) {

      return res.status(404).json({ 

        success: false, 

        message: "Usuário não encontrado. Nenhum usuário foi excluído." 

      });

    }
 
    // 5. Sucesso!

    res.json({ 

      success: true, 

      message: "Usuário excluído com sucesso." 

    });

  });

});
 

// ===== INICIAR SERVIDOR =====
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em ${PORT}`);
});
