const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let apostas = {}; // { socket.id: { nome, bandeira, ip } }
let resultadoFinal = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log("Conectado com IP:", ip);

  socket.emit('seu-ip', ip); // envia IP ao próprio cliente
  console.log('Conectado:', socket.id);

  // Registrar a aposta com IP
  socket.on('aposta', (data) => {
    apostas[socket.id] = { ...data, ip };
    io.emit('nova-aposta', { ...data, id: socket.id });

    // Atualizar lista de usuários para o controlador
    const listaUsuarios = Object.values(apostas).map(a => ({
      nome: a.nome,
      ip: a.ip
    }));
    io.emit('lista-de-usuarios', listaUsuarios);
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
    
    // Atualizar lista de usuários ao desconectar
    const listaUsuarios = Object.values(apostas).map(a => ({
      nome: a.nome,
      ip: a.ip
    }));
    io.emit('lista-de-usuarios', listaUsuarios);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});
