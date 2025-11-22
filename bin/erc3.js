#!/usr/bin/env node

/**
 * ERC3 CLI - Command-line interface for the ERC3 JavaScript SDK
 */

import { handleCoreCommand } from './commands/core.js';
import { handleStoreCommand } from './commands/store.js';
import { handleDemoCommand } from './commands/demo.js';

const COMMANDS = {
  // Core ERC3 commands
  'benchmarks': { handler: handleCoreCommand, description: 'List available benchmarks' },
  'benchmark': { handler: handleCoreCommand, description: 'View benchmark details' },
  'session:start': { handler: handleCoreCommand, description: 'Start a new session' },
  'session:status': { handler: handleCoreCommand, description: 'Get session status' },
  'session:search': { handler: handleCoreCommand, description: 'Search sessions' },
  'session:submit': { handler: handleCoreCommand, description: 'Submit session for evaluation' },
  'task:start': { handler: handleCoreCommand, description: 'Start a task' },
  'task:view': { handler: handleCoreCommand, description: 'View task details' },
  'task:complete': { handler: handleCoreCommand, description: 'Complete a task' },
  'task:log': { handler: handleCoreCommand, description: 'Log LLM usage for a task' },

  // Store API commands
  'store:products': { handler: handleStoreCommand, description: 'List products' },
  'store:basket': { handler: handleStoreCommand, description: 'View shopping basket' },
  'store:add': { handler: handleStoreCommand, description: 'Add product to basket' },
  'store:remove': { handler: handleStoreCommand, description: 'Remove product from basket' },
  'store:coupon:apply': { handler: handleStoreCommand, description: 'Apply coupon code' },
  'store:coupon:remove': { handler: handleStoreCommand, description: 'Remove coupon' },
  'store:checkout': { handler: handleStoreCommand, description: 'Checkout basket' },

  // Demo API commands
  'demo:secret': { handler: handleDemoCommand, description: 'Get task secret' },
  'demo:answer': { handler: handleDemoCommand, description: 'Submit answer' },
};

function showHelp() {
  console.log(`
ERC3 CLI - Command-line interface for the ERC3 JavaScript SDK

Usage: erc3 <command> [options]

CORE COMMANDS:
  benchmarks                    List available benchmarks
  benchmark <id>                View benchmark details
  session:start <benchmark>     Start a new session
    --workspace <name>          Workspace name (required)
    --name <name>               Session name (required)
    --architecture <arch>       Architecture (default: x86_64)
  session:status <session-id>   Get session status
  session:search                Search sessions
    --workspace <name>          Filter by workspace
    --benchmark <id>            Filter by benchmark
  session:submit <session-id>   Submit session for evaluation
  task:start <task-id>          Start a task
  task:view <task-id>           View task details
    --since <timestamp>         Get logs since timestamp
  task:complete <task-id>       Complete a task
  task:log <task-id>            Log LLM usage
    --model <name>              Model name (required)
    --prompt-tokens <n>         Prompt tokens (required)
    --completion-tokens <n>     Completion tokens (required)
    --duration <sec>            Duration in seconds (required)

STORE API COMMANDS:
  store:products <task-id>      List products
    --offset <n>                Pagination offset (default: 0)
    --limit <n>                 Page size (default: 20, max: 3)
  store:basket <task-id>        View shopping basket
  store:add <task-id>           Add product to basket
    --sku <sku>                 Product SKU (required)
    --quantity <n>              Quantity (default: 1)
  store:remove <task-id>        Remove product from basket
    --sku <sku>                 Product SKU (required)
    --quantity <n>              Quantity (default: 1)
  store:coupon:apply <task-id>  Apply coupon code
    --coupon <code>             Coupon code (required)
  store:coupon:remove <task-id> Remove applied coupon
  store:checkout <task-id>      Checkout basket

DEMO API COMMANDS:
  demo:secret <task-id>         Get task secret
  demo:answer <task-id>         Submit answer
    --answer <text>             Answer text (required)

ENVIRONMENT VARIABLES:
  ERC3_API_KEY                  API key for authentication
  ERC3_BASE_URL                 Base URL (default: https://erc.timetoact-group.at)

EXAMPLES:
  # List benchmarks
  erc3 benchmarks

  # Start a session
  erc3 session:start store --workspace my-workspace --name "Test Run"

  # List products in a store task
  erc3 store:products task-123 --limit 3

  # Add product to basket
  erc3 store:add task-123 --sku gpu-h100 --quantity 1

  # Get demo secret
  erc3 demo:secret task-456

For more information, visit: https://github.com/restyler/erc3-js
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
    console.error(`Run 'erc3 --help' for usage information.`);
    process.exit(1);
  }

  try {
    await COMMANDS[command].handler(command, commandArgs);
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
