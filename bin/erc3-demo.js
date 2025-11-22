#!/usr/bin/env node

/**
 * ERC3 Demo CLI - Command-line interface for the ERC3 Demo API
 *
 * This is a standalone CLI for the Demo benchmark API.
 * It can be used independently of the main erc3 CLI.
 */

import { handleDemoCommand } from './commands/demo.js';

const COMMANDS = {
  'secret': 'Get task secret',
  'answer': 'Submit answer',
};

function showHelp() {
  console.log(`
ERC3 Demo CLI - Command-line interface for the Demo API

Usage: erc3-demo <command> <task-id> [options]

COMMANDS:
  secret <task-id>          Get the secret for the demo task
    --json                  Output raw JSON

  answer <task-id>          Submit an answer for the demo task
    --answer <text>         Answer text (required)

ENVIRONMENT VARIABLES:
  ERC3_API_KEY              API key for authentication (required)
  ERC3_BASE_URL             Base URL (default: https://erc.timetoact-group.at)

EXAMPLES:
  # Get the secret
  erc3-demo secret task-456

  # Submit answer
  erc3-demo answer task-456 --answer "secret-12345"

  # Complete workflow
  SECRET=$(erc3-demo secret task-456 --json | jq -r '.value')
  erc3-demo answer task-456 --answer "$SECRET"

NOTES:
  - Task ID must be from a 'demo' benchmark session
  - The demo benchmark is a simple test workflow
  - Retrieve the secret and submit it as the answer

For more information: https://github.com/restyler/erc3-js
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (!COMMANDS[command]) {
    console.error(`Error: Unknown command '${command}'`);
    console.error(`Run 'erc3-demo --help' for usage information.`);
    process.exit(1);
  }

  try {
    await handleDemoCommand('demo:' + command, commandArgs);
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
