const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connection = require("./db_config"); // conexão MySQL
const multer = require("multer"); // 🔹 ADICIONADO para upload

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== ROTAS DE API =====

// Cadastro
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

// Login
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

// ===== UPLOAD DE ARQUIVOS =====

// Configuração do armazenamento
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

// Rota de upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// ===== PÁGINA INICIAL =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== SOCKET.IO (CHAT PRIVADO) =====

// lista de usuários online: userId → { socketId, nome }
const onlineUsers = new Map();
// histórico: "menorId:maiorId" → [mensagens]
const messages = {};

function chatKey(a, b) {
  return [String(a), String(b)].sort().join(":");
}

io.on("connection", (socket) => {
  console.log("🟢 Usuário conectado:", socket.id);

  // autenticação inicial (o cliente manda { id, nome })
  socket.on("authenticate", ({ id, name }) => {
    if (!id) return;
    onlineUsers.set(String(id), { socketId: socket.id, name });
    console.log(`🔹 ${name} autenticado (${id})`);
    atualizarUsuariosOnline();
  });

  // carregar histórico
  socket.on("load-history", (otherId) => {
    const userEntry = [...onlineUsers.entries()].find(([, v]) => v.socketId === socket.id);
    const userId = userEntry ? userEntry[0] : null;
    if (!userId) return;
    const key = chatKey(userId, otherId);
    socket.emit("history", messages[key] || []);
  });

  // envio de mensagens privadas
  socket.on("private-message", ({ recipient, message, senderId, senderName }) => {
    if (!recipient || !message) return;
    const key = chatKey(senderId, recipient);
    messages[key] = messages[key] || [];
    const data = { senderId, senderName, message, ts: Date.now() };
    messages[key].push(data);

    // enviar pro destinatário se estiver online
    const rec = onlineUsers.get(String(recipient));
    if (rec && rec.socketId) {
      io.to(rec.socketId).emit("private-message", { sender: senderId, senderName, message });
    }

    // e também pro próprio remetente
    socket.emit("private-message", { sender: senderId, senderName, message });
  });

  // desconexão
  socket.on("disconnect", () => {
    const entry = [...onlineUsers.entries()].find(([, v]) => v.socketId === socket.id);
    if (entry) {
      onlineUsers.delete(entry[0]);
      console.log(`🔴 Usuário ${entry[1].name} saiu.`);
      atualizarUsuariosOnline();
    }
  });
});

// envia lista de online para todos
function atualizarUsuariosOnline() {
  const list = [...onlineUsers.entries()].map(([id, v]) => ({ id, name: v.name }));
  io.emit("update-user-list", list);
}

// ===== INICIAR SERVIDOR =====
const PORT = 3000;
server.listen(PORT, () => {
  console.log();
});
