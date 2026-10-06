CREATE DATABASE IF NOT EXISTS aula_crud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aula_crud;

CREATE TABLE funcionarios (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    salario INT NOT NULL
);

INSERT INTO funcionarios (nome, endereco, salario) VALUES
('Ana Souza', 'Rua das Flores, 10', 3500),
('Bruno Lima', 'Avenida Central, 200', 4200),
('Carla Dias', 'Rua do Comércio, 45', 2800);

CREATE TABLE usuarios (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL
);

-- senha_hash é o resultado de password_hash. Não é a senha em texto.
-- Para entrar: usuário admin, senha 123.
INSERT INTO usuarios (usuario, senha_hash) VALUES
('admin', '$2y$10$iAFgNFrSbOwVLfrFocmBf.OzV57VxYenWtMXGcEAVw.PnCI3y3y6u');