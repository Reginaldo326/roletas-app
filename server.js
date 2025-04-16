const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let apostas = {};
let resultadoFinal = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Conectado:', socket.id);

  socket.on('aposta', (data) => {
    apostas[socket.id] = data;
    io.emit('nova-aposta', { ...data, id: socket.id });
  });

  socket.on('iniciar-roletas', () => {
    io.emit('girar-roletas');
  });

  socket.on('resultado', (data) => {
    resultadoFinal = data;
    const ganhadores = Object.entries(apostas)
      .filter(([_, aposta]) => data.includes(aposta.bandeira))
      .map(([_, aposta]) => aposta.nome);
    io.emit('mostrar-ganhadores', ganhadores);
    apostas = {};
  });

  socket.on('disconnect', () => {
    delete apostas[socket.id];
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});
