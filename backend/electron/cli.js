#!/usr/bin/env node
const { program } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .description('J5 Pharmacy Management System CLI');

program
  .command('start')
  .description('Start the J5 Pharmacy Management System')
  .action(() => {
    console.log('Starting J5 Pharmacy Management System...');
    const electronPath = path.join(__dirname, 'main.js');
    const child = spawn('electron', [electronPath], {
      stdio: 'inherit'
    });

    child.on('error', (err) => {
      console.error('Failed to start:', err);
    });
  });

program
  .command('update')
  .description('Check for and install updates')
  .action(() => {
    console.log('Checking for updates...');
    // TODO: Implement update mechanism
    console.log('Update functionality will be implemented in future versions');
  });

program.parse(process.argv); 