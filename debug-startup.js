#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Starting Vidur in debug mode...\n');

// Check if .env file exists
const fs = require('fs');
if (!fs.existsSync('.env')) {
  console.error('❌ .env file not found. Please copy .env.example to .env and configure it.');
  process.exit(1);
}

// Start the development server with detailed logging
const nuxtProcess = spawn('yarn', ['dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DEBUG: 'nuxt:*',
    NODE_ENV: 'development',
    NUXT_DELAY_RESPONSE: 'false',
  }
});

nuxtProcess.on('error', (error) => {
  console.error('❌ Failed to start Nuxt:', error);
  process.exit(1);
});

nuxtProcess.on('exit', (code) => {
  console.log(`\n🔍 Nuxt process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug session...');
  nuxtProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down debug session...');
  nuxtProcess.kill('SIGTERM');
});