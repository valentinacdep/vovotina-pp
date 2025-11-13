const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connection = require("./db_config");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

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

// ===== SOCKET.IO (CHAT PRIVADO) =====
const onlineUsers = new Map();
const messages = {};

function chatKey(a, b) {
  return [String(a), String(b)].sort().join(":");
}

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
app.get("/usuario/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT id, name, email FROM users WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar usuário." });
    if (results.length === 0) return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    res.json({ success: true, user: results[0] });
  });
});


// ===== ATUALIZAR DADOS DE UM USUÁRIO =====
app.put("/usuario/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const query = "UPDATE users SET name = ?, email = ? WHERE id = ?";
  connection.query(query, [name, email, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao atualizar usuário." });
    res.json({ success: true, message: "Informações atualizadas com sucesso!" });
  });
});


// ===== INICIAR SERVIDOR =====
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em ${PORT}`);
});
