import { spawn } from 'child_process';

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
cmd('http-server', '-p', '8080', '-a', '127.0.0.1', '-s');
