#!/usr/bin/env node
const inquirer = require('inquirer');
const detectPort = require('detect-port-alt');
// const open = require('open');
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Utility function: checks a desiredPort; if it's taken, prompts the user for a new one
async function askForPort(desiredPort, serviceName) {
  const availablePort = await detectPort(desiredPort);

  if (availablePort !== desiredPort) {
    // The port is in use. Ask the user to pick another.
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'newPort',
        message: `${serviceName} port ${desiredPort} is in use. Enter a different port:`,
        default: desiredPort + 1
      }
    ]);
    // Recursively check the new port
    return askForPort(parseInt(answers.newPort, 10), serviceName);
  }

  return desiredPort;
}

// Starts the React frontend and Express backend, checking for occupied ports.
// Automatically opens the React app in the browser when it starts.
async function startServers(frontendFramework, frontendPath, includeBackend, backendPath) {
  // (A) Start the React frontend if user chose React
  if (frontendFramework === 'React') {
    if (fs.existsSync(frontendPath)) {
      console.log(`\n🚀 Starting React frontend from: ${frontendPath}`);

      // 1) Ask for an available port (default 3000)
      const reactPort = await askForPort(3000, 'React');

      // 2) Start the React app with that port
      spawn('npm', ['start'], {
        cwd: frontendPath,
        shell: true,
        stdio: 'inherit',
        env: { ...process.env, PORT: reactPort }
      });

      // 3) Give the dev server a few seconds to spin up, then open in browser
      setTimeout(async () => {
        const url = `http://localhost:${reactPort}`;
        console.log(`\n🌐 Opening React app in your browser at ${url} ...`);
        const { default: openBrowser } = await import('open');
        openBrowser(url);
      }, 5000);

    } else {
      console.log('⚠️ Frontend folder not found, cannot start React.');
    }
  } else {
    console.log('\n(You chose Vanilla JS, so no automatic frontend server to start.)');
  }

  // (B) Start the Express backend if included
  if (includeBackend) {
    if (fs.existsSync(backendPath)) {
      console.log(`\n🚀 Starting Express backend from: ${backendPath}`);

      // 1) Ask for an available port (default 5000)
      const expressPort = await askForPort(5000, 'Express');

      // 2) Start the Express server with that port
      spawn('npm', ['start'], {
        cwd: backendPath,
        shell: true,
        stdio: 'inherit',
        env: { ...process.env, PORT: expressPort }
      });
    } else {
      console.log('⚠️ Backend folder not found, cannot start Express.');
    }
  } else {
    console.log('\n(No Express backend was selected, skipping backend start.)');
  }

  // Both servers are now running in the SAME terminal. Press Ctrl+C to stop them.
}

/**
 * This script:
 * 1. Asks user for project details (like Yeoman does).
 * 2. Calls 'yo mywebgen' with CLI args (if your generator supports them).
 * 3. Automatically checks for occupied ports, starts both servers, and opens React in the browser.
 */
async function main() {
  console.log('Welcome to the Single-File Yeoman Runner + Auto Starter!');

  // 1) Ask the same questions Yeoman does
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter your project name:',
      default: 'my-app'
    },
    {
      type: 'list',
      name: 'frontendFramework',
      message: 'Select a frontend framework:',
      choices: ['React', 'Vanilla JS'],
      default: 'React'
    },
    {
      type: 'confirm',
      name: 'includeBackend',
      message: 'Do you want to include an Express backend?',
      default: true
    }
  ]);

  const { projectName, frontendFramework, includeBackend } = answers;
  const projectPath = path.join(process.cwd(), projectName);
  const frontendPath = path.join(projectPath, 'frontend');
  const backendPath = path.join(projectPath, 'backend');

  // 2) Call Yeoman generator: 'yo mywebgen' with CLI args
  const cliArgs = [
    'mywebgen',
    `--projectName=${projectName}`,
    `--frontendFramework=${frontendFramework}`,
    `--includeBackend=${includeBackend}`
  ];

  console.log('\nRunning Yeoman with these arguments:', cliArgs.join(' '));
  const yeomanResult = spawnSync('yo', cliArgs, {
    stdio: 'inherit',
    shell: true
  });

  if (yeomanResult.status !== 0) {
    console.error('❌ Yeoman generation failed.');
    process.exit(1);
  }

  console.log('\n✅ Yeoman generation complete!');

  // 3) Start servers (React & Express) with port checks and auto-launch browser
  await startServers(frontendFramework, frontendPath, includeBackend, backendPath);
}

main();
