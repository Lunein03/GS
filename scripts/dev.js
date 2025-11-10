#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const DEFAULT_PORT = Number.parseInt(process.env.PORT ?? '3000', 10) || 3000;
const MAX_ATTEMPTS = 50;

function hasUserDefinedPort(args) {
  return args.some((arg) => arg === '-p' || arg === '--port');
}

function probePort(port, host) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', (error) => {
        if (error && typeof error === 'object' && 'code' in error) {
          const { code } = error;
          if (code === 'EADDRINUSE' || code === 'EACCES') {
            resolve(false);
            return;
          }
        }

        resolve(true);
      })
      .once('listening', () => {
        tester
          .once('close', () => resolve(true))
          .close();
      })
      .listen({ port, host });
  });
}

async function isPortAvailable(port) {
  const hosts = ['::', '0.0.0.0'];

  for (const host of hosts) {
    // eslint-disable-next-line no-await-in-loop
    const available = await probePort(port, host).catch(() => true);
    if (!available) {
      return false;
    }
  }

  return true;
}

async function findAvailablePort(startPort) {
  let attempts = 0;
  let port = startPort;

  while (attempts < MAX_ATTEMPTS) {
    // eslint-disable-next-line no-await-in-loop
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }

    port += 1;
    attempts += 1;
  }

  throw new Error(
    `Could not find an open port after checking ${MAX_ATTEMPTS} options starting at ${startPort}.`,
  );
}

async function run() {
  const args = process.argv.slice(2);
  let port = DEFAULT_PORT;

  if (!hasUserDefinedPort(args)) {
    port = await findAvailablePort(DEFAULT_PORT);
    process.env.PORT = String(port);

    if (port !== DEFAULT_PORT) {
      console.log(
        `⚠️  Port ${DEFAULT_PORT} is busy. Using available port ${port} instead.`,
      );
    }

    args.push('-p', String(port));
  }

  const nextExecutable =
    process.platform === 'win32'
      ? path.join(process.cwd(), 'node_modules', '.bin', 'next.cmd')
      : path.join(process.cwd(), 'node_modules', '.bin', 'next');

  const isWindows = process.platform === 'win32';
  const command = isWindows ? process.env.ComSpec || 'cmd.exe' : nextExecutable;
  const commandArgs = isWindows
    ? ['/c', nextExecutable, 'dev', ...args]
    : ['dev', ...args];

  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
