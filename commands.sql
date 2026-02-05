-- Comandos SQL usados para el ejercicio 13.2

CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES
('Autor 1', 'https://ejemplo1.com', 'Título 1', 5),
('Autor 2', 'https://ejemplo2.com', 'Título 2', 10);
