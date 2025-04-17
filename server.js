const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let apostas = {};
let usuariosConectados = {};
let resultadoFinal = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  socket.emit('seu-ip', ip);

  console.log("Conectado com IP:", ip);
  console.log('Conectado:', socket.id);

  // Enviar aposta com nome e bandeira
  socket.on('aposta', (data) => {
    apostas[socket.id] = data;
    usuariosConectados[socket.id] = {
      nome: data.nome,
      ip: ip
    };

    io.emit('nova-aposta', { ...data, id: socket.id });
    atualizarListaUsuarios();
  });

  // Iniciar roletas
  socket.on('iniciar-roletas', () => {
    io.emit('girar-roletas');
  });

  // Resultado final
  socket.on('resultado', (data) => {
    resultadoFinal = data;
    const ganhadores = Object.entries(apostas)
      .filter(([_, aposta]) => data.includes(aposta.bandeira))
      .map(([_, aposta]) => aposta.nome);
    io.emit('mostrar-ganhadores', ganhadores);
    apostas = {};
  });

  socket.on('disconnect', () => {
    const usuario = usuariosConectados[socket.id];
    if (usuario) {
      console.log(`Cliente desconectado: ${usuario.nome}`);
      io.emit('usuario-desconectado', usuario.nome);
    }

    delete apostas[socket.id];
    delete usuariosConectados[socket.id];
    atualizarListaUsuarios();
  });

  function atualizarListaUsuarios() {
    const lista = Object.values(usuariosConectados);
    io.emit('lista-de-usuarios', lista);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});

