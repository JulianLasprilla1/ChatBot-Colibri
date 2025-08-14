// Script interactivo para enviar mensajes manuales por WhatsApp desde la terminal
import readline from 'readline';
import axios from 'axios';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('--- Envío manual de mensajes por WhatsApp ---');
  const to = await ask('Número del cliente (ej: 57XXXXXXXXXX): ');
  while (true) {
    const text = await ask('Mensaje (o "salir" para terminar): ');
    if (text.trim().toLowerCase() === 'salir') break;
    try {
      const resp = await axios.post('http://localhost:3000/admin/send', { to, text });
      console.log('Enviado:', resp.data);
    } catch (e) {
      console.error('Error:', e.response?.data || e.message);
    }
  }
  rl.close();
}

main();
