const socket = io();
const paises = [
  { nome: "Brasil", img: "https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg" },
  { nome: "EUA", img: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" },
  { nome: "França", img: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg" },
  { nome: "Japão", img: "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg" },
  { nome: "Itália", img: "https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg" },
  { nome: "Alemanha", img: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg" },
  { nome: "Reino Unido", img: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" }
];

function iniciarCliente() {
  const container = document.getElementById('bandeiras');
  const status = document.getElementById('status');
  const nomeInput = document.getElementById('nome');
  const resultados = document.getElementById('resultados');

  paises.forEach(pais => {
    const img = document.createElement('img');
    img.src = pais.img;
    img.className = "bandeira";
    img.onclick = () => {
      const nome = nomeInput.value.trim();
      if (!nome) return alert('Digite seu nome');
      socket.emit('aposta', { nome, bandeira: pais.nome });
      status.textContent = `Você escolheu: ${pais.nome}`;
    };
    container.appendChild(img);
  });

  socket.on('girar-roletas', () => {
    status.textContent = 'Roletas girando...';
    resultados.innerHTML = '';
    let rodadas = 10;
    const intervalo = setInterval(() => {
      const aleatorio = paises[Math.floor(Math.random() * paises.length)];
      status.innerHTML = `<img src="${aleatorio.img}"><br>${aleatorio.nome}`;
      rodadas--;
      if (rodadas === 0) {
        clearInterval(intervalo);
        socket.emit('resultado', [aleatorio.nome]);
      }
    }, 500);
  });

  socket.on('mostrar-ganhadores', (ganhadores) => {
    if (ganhadores.length === 0) {
      resultados.textContent = "Ninguém acertou 😢";
    } else {
      resultados.innerHTML = `<h2>🏆 Ganhadores:</h2><ul>${ganhadores.map(n => `<li>${n}</li>`).join('')}</ul>`;
    }
  });
}