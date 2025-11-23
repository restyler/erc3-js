#!/usr/bin/env node

/**
 * ERC3 Store CLI - Command-line interface for the ERC3 Store API
 *
 * This is a standalone CLI for the Store benchmark API.
 * It can be used independently of the main erc3 CLI.
 */

import { handleStoreCommand } from './commands/store.js';

const COMMANDS = {
  'products': 'List products with pagination',
  'basket': 'View shopping basket',
  'add': 'Add product to basket',
  'remove': 'Remove product from basket',
  'coupon:apply': 'Apply coupon code',
  'coupon:remove': 'Remove applied coupon',
  'checkout': 'Checkout basket',
};

function showHelp() {
  console.log(`
ERC3 Store CLI - Command-line interface for the Store API

Usage: erc3-store <command> <task-id> [options]

COMMANDS:
  products <task-id>        List products with pagination
    --offset <n>            Pagination offset (default: 0)
    --limit <n>             Page size (default: 20, max: 3)
    --json                  Output raw JSON

  basket <task-id>          View shopping basket
    --json                  Output raw JSON

  add <task-id>             Add product to basket
    --sku <sku>             Product SKU (required)
    --quantity <n>          Quantity (default: 1)

  remove <task-id>          Remove product from basket
    --sku <sku>             Product SKU (required)
    --quantity <n>          Quantity (default: 1)

  coupon:apply <task-id>    Apply coupon code
    --coupon <code>         Coupon code (required)

  coupon:remove <task-id>   Remove applied coupon

  checkout <task-id>        Checkout basket

ENVIRONMENT VARIABLES:
  ERC3_API_KEY              API key for authentication (required)
  ERC3_BASE_URL             Base URL (default: https://erc.timetoact-group.at)

EXAMPLES:
  # List products (max 3 per page)
  erc3-store products task-123 --limit 3

  # View basket with formatted output
  erc3-store basket task-123

  # Add product to basket
  erc3-store add task-123 --sku gpu-h100 --quantity 1

  # Apply coupon and checkout
  erc3-store coupon:apply task-123 --coupon SAVE20
  erc3-store checkout task-123

  # Get raw JSON output
  erc3-store products task-123 --json

NOTES:
  - Prices are in dollars (no division needed for display)
  - Maximum page limit is 3 items
  - Only one coupon can be applied at a time
  - Task ID must be from a 'store' benchmark session

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
    console.error(`Run 'erc3-store --help' for usage information.`);
    process.exit(1);
  }

  try {
    await handleStoreCommand('store:' + command, commandArgs);
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
