PRAGMA foreign_keys = ON;

CREATE TABLE ecomonitor (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  telefone TEXT NOT NULL
);

CREATE TABLE cargo (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  salario REAL NOT NULL,
  leciona INTEGER NOT NULL CHECK (leciona IN (0, 1))
);

CREATE TABLE pessoa (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  telefone TEXT,
  email TEXT
);

CREATE TABLE colaborador (
  id INTEGER PRIMARY KEY,
  pessoa_id INTEGER NOT NULL UNIQUE,
  cargo_id INTEGER NOT NULL,
  data_admissao TEXT NOT NULL,
  FOREIGN KEY (pessoa_id) REFERENCES pessoa (id),
  FOREIGN KEY (cargo_id) REFERENCES cargo (id)
);

CREATE TABLE supervisor (
  id INTEGER PRIMARY KEY,
  pessoa_id INTEGER NOT NULL UNIQUE,
  matricula TEXT NOT NULL UNIQUE,
  data_ingresso TEXT NOT NULL,
  FOREIGN KEY (pessoa_id) REFERENCES pessoa (id)
);

CREATE TABLE usuario (
  id INTEGER PRIMARY KEY,
  pessoa_id INTEGER NOT NULL UNIQUE,
  login TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('diretor', 'secretaria', 'professor', 'aluno', 'mestre')),
  FOREIGN KEY (pessoa_id) REFERENCES pessoa (id)
);


CREATE TABLE oequipe (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  sobrenome INTEGER NOT NULL,
  turno TEXT NOT NULL
);

CREATE TABLE aula (
  id INTEGER PRIMARY KEY,
  turma_id INTEGER NOT NULL,
  _id INTEGER NOT NULL,
  colaborador_id INTEGER NOT NULL,
  UNIQUE (turma_id, disciplina_id),
  FOREIGN KEY (turma_id) REFERENCES turma (id),
  FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
  FOREIGN KEY (colaborador_id) REFERENCES colaborador (id)
);

CREATE TABLE matricula (
  id INTEGER PRIMARY KEY,
  aluno_id INTEGER NOT NULL,
  turma_id INTEGER NOT NULL,
  situacao TEXT NOT NULL CHECK (situacao IN ('cursando', 'aprovado', 'reprovado')),
  UNIQUE (aluno_id, turma_id),
  FOREIGN KEY (aluno_id) REFERENCES aluno (id),
  FOREIGN KEY (turma_id) REFERENCES turma (id)
);

CREATE TABLE nota (
  id INTEGER PRIMARY KEY,
  matricula_id INTEGER NOT NULL,
  disciplina_id INTEGER NOT NULL,
  bimestre INTEGER NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
  valor REAL NOT NULL CHECK (valor >= 0 AND valor <= 10),
  UNIQUE (matricula_id, disciplina_id, bimestre),
  FOREIGN KEY (matricula_id) REFERENCES matricula (id),
  FOREIGN KEY (disciplina_id) REFERENCES disciplina (id)
);

-- A folha não guarda cópia do salário.
-- Se o salário do cargo mudar, a folha muda junto.
CREATE VIEW vw_folha_pagamento AS
SELECT p.nome AS nome,
       cg.nome AS cargo,
       cg.salario AS salario
FROM colaborador c
JOIN pessoa p ON p.id = c.pessoa_id
JOIN cargo cg ON cg.id = c.cargo_id;

INSERT INTO escola (id, nome, endereco, telefone) VALUES
  (1, 'Escola Municipal Horizonte', 'Rua das Acácias, 120 - Centro', '(11) 3333-1200');

INSERT INTO cargo (id, nome, salario, leciona) VALUES
  (1, 'Diretor', 8500.00, 0),
  (2, 'Professor', 4200.00, 1),
  (3, 'Secretário', 3100.00, 0),
  (4, 'Estagiário', 1400.00, 0);

INSERT INTO pessoa (id, nome, cpf, telefone, email) VALUES
  (1, 'Carlos Mendes', '111.111.111-11', '(11) 98888-0001', 'carlos@escola.br'),
  (2, 'Ana Souza', '222.222.222-22', '(11) 98888-0002', 'ana@escola.br'),
  (3, 'João Lima', '333.333.333-33', '(11) 98888-0003', 'joao@escola.br'),
  (4, 'Rita Costa', '444.444.444-44', '(11) 98888-0004', 'rita@escola.br'),
  (5, 'Lucas Pereira', '555.555.555-55', '(11) 98888-0005', 'lucas@escola.br'),
  (6, 'Maria Oliveira', '666.666.666-66', '(11) 97777-0006', 'maria@aluno.br'),
  (7, 'Pedro Santos', '777.777.777-77', '(11) 97777-0007', 'pedro@aluno.br'),
  (8, 'Helena Dias', '888.888.888-88', '(11) 97777-0008', 'helena@aluno.br'),
  (9, 'Usuário Mestre', '000.000.000-00', NULL, 'sr@gmail.com');

INSERT INTO colaborador (id, pessoa_id, cargo_id, data_admissao) VALUES
  (1, 1, 1, '10/01/2018'),
  (2, 2, 3, '02/03/2020'),
  (3, 3, 2, '15/02/2019'),
  (4, 4, 2, '20/02/2021'),
  (5, 5, 4, '01/02/2026');

INSERT INTO aluno (id, pessoa_id, matricula, data_ingresso) VALUES
  (1, 6, '2025001', '03/02/2025'),
  (2, 7, '2025002', '03/02/2025'),
  (3, 8, '2026008', '02/02/2026');

INSERT INTO usuario (id, pessoa_id, login, senha, papel) VALUES
  (1, 1, 'diretor', '123', 'diretor'),
  (2, 2, 'secretaria', '123', 'secretaria'),
  (3, 3, 'joao', '123', 'professor'),
  (4, 4, 'rita', '123', 'professor'),
  (5, 6, 'maria', '123', 'aluno'),
  (6, 7, 'pedro', '123', 'aluno'),
  (7, 8, 'helena', '123', 'aluno'),
  (8, 9, 'sr@gmail.com', '123', 'mestre');

INSERT INTO disciplina (id, nome) VALUES
  (1, 'Matemática'),
  (2, 'Português'),
  (3, 'Ciências');

INSERT INTO turma (id, nome, ano_letivo, turno) VALUES
  (1, '7º Ano A', 2025, 'manhã'),
  (2, '8º Ano A', 2026, 'manhã'),
  (3, '8º Ano B', 2026, 'tarde');

INSERT INTO aula (id, turma_id, disciplina_id, colaborador_id) VALUES
  (1, 1, 1, 3),
  (2, 1, 2, 4),
  (3, 2, 1, 3),
  (4, 2, 2, 4),
  (5, 2, 3, 4),
  (6, 3, 1, 3);

INSERT INTO matricula (id, aluno_id, turma_id, situacao) VALUES
  (1, 1, 1, 'aprovado'),
  (2, 1, 2, 'cursando'),
  (3, 2, 1, 'aprovado'),
  (4, 2, 2, 'cursando'),
  (5, 3, 3, 'cursando');

INSERT INTO nota (matricula_id, disciplina_id, bimestre, valor) VALUES
  (1, 1, 1, 8.0),
  (1, 1, 2, 7.5),
  (1, 1, 3, 8.5),
  (1, 1, 4, 9.0),
  (1, 2, 1, 9.0),
  (1, 2, 2, 8.5),
  (1, 2, 3, 9.0),
  (1, 2, 4, 9.5),
  (3, 1, 1, 6.0),
  (3, 1, 2, 6.5),
  (3, 1, 3, 7.0),
  (3, 1, 4, 7.5),
  (3, 2, 1, 7.0),
  (3, 2, 2, 7.0),
  (3, 2, 3, 6.5),
  (3, 2, 4, 7.5),
  (2, 1, 1, 8.0),
  (2, 1, 2, 7.5),
  (2, 2, 1, 9.0),
  (2, 3, 1, 8.0),
  (4, 1, 1, 6.5),
  (4, 2, 1, 7.0),
  (5, 1, 1, 8.5),
  (5, 1, 2, 9.0);
