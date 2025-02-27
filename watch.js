const { spawn } = require('child_process');
const { WebSocketServer } = require('ws');
const { watchFile } = require('fs');
const path = require('path');

const cmd = (program, ...args) => {
   console.log('CMD:', program, ...args);

   const p = spawn(program, args, { stdio: 'inherit' });

   p.on('close', (code) => {
      if (code !== 0) {
         console.error('ERROR:', program, ...args, 'exited with', code);
      }
   });
};

cmd('tsc', '-w');
cmd('http-server', '-p', '8080', '-a', '127.0.0.1', '-s', '-c-1');

const wss = new WebSocketServer({
   port: 5000,
});

/** @type {import('ws').WebSocket[]} */
const websockets = [];

wss.on('connection', (ws) => {
   websockets.push(ws);

   ws.on('close', () => {
      websockets.splice(websockets.indexOf(ws), 1);
   });
});

const COLD_RELOAD_FILES = ['index.html', 'main.js'];

COLD_RELOAD_FILES.forEach(file => {
   watchFile(path.join(__dirname, file), { interval: 50 }, () => {
      websockets.forEach(socket => socket.send('cold'));
   });
});

const HOT_RELOAD_FILES = ['game.js'];

HOT_RELOAD_FILES.forEach(file => {
   watchFile(path.join(__dirname, file), { interval: 50 }, () => {
      websockets.forEach(socket => socket.send('hot'));
   });
});
