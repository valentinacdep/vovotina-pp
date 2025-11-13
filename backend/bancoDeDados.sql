CREATE DATABASE vovotina;
USE vovotina;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) not null,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE medicamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,              -- se tiver login, liga o remédio ao usuário
  nome VARCHAR(100) NOT NULL,
  quantidade VARCHAR(50),
  horarios TEXT,               -- pode salvar como texto tipo "08:00, 12:00, 18:00"
  imagem_url VARCHAR(255),     -- link da imagem (caso tu envie pro servidor)
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conteudos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);