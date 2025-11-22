#!/usr/bin/env node

/**
 * ERC3 CLI - Command-line interface for the ERC3 Core API
 *
 * This CLI handles core ERC3 functionality: benchmarks, sessions, and tasks.
 * For benchmark-specific APIs, use the dedicated CLIs:
 * - erc3-store: Store API commands
 * - erc3-demo: Demo API commands
 */

import { handleCoreCommand } from './commands/core.js';

const COMMANDS = {
  'benchmarks': 'List available benchmarks',
  'benchmark': 'View benchmark details',
  'session:start': 'Start a new session',
  'session:status': 'Get session status',
  'session:search': 'Search sessions',
  'session:submit': 'Submit session for evaluation',
  'task:start': 'Start a task',
  'task:view': 'View task details',
  'task:complete': 'Complete a task',
  'task:log': 'Log LLM usage for a task',
};

function showHelp() {
  console.log(`
ERC3 CLI - Command-line interface for the ERC3 Core API

Usage: erc3 <command> [options]

CORE COMMANDS:
  benchmarks                    List available benchmarks

  benchmark <id>                View benchmark details
    Example: erc3 benchmark store

  session:start <benchmark>     Start a new session
    --workspace <name>          Workspace name (required)
    --name <name>               Session name (required)
    --architecture <arch>       Architecture (default: x86_64)
    Example: erc3 session:start store --workspace my-ws --name "Test"

  session:status <session-id>   Get session status
    Example: erc3 session:status ssn-123

  session:search                Search sessions
    --workspace <name>          Filter by workspace
    --benchmark <id>            Filter by benchmark
    Example: erc3 session:search --workspace my-ws

  session:submit <session-id>   Submit session for evaluation
    Example: erc3 session:submit ssn-123

  task:start <task-id>          Start a task
    Example: erc3 task:start tsk-456

  task:view <task-id>           View task details
    --since <timestamp>         Get logs since timestamp
    Example: erc3 task:view tsk-456

  task:complete <task-id>       Complete a task
    Example: erc3 task:complete tsk-456

  task:log <task-id>            Log LLM usage for a task
    --model <name>              Model name (required)
    --prompt-tokens <n>         Prompt tokens (required)
    --completion-tokens <n>     Completion tokens (required)
    --duration <sec>            Duration in seconds (required)
    Example: erc3 task:log tsk-456 --model gpt-4 --prompt-tokens 100 --completion-tokens 50 --duration 2.5

BENCHMARK-SPECIFIC CLIS:
  For Store API commands, use:    erc3-store --help
  For Demo API commands, use:     erc3-demo --help

ENVIRONMENT VARIABLES:
  ERC3_API_KEY                  API key for authentication (required)
  ERC3_BASE_URL                 Base URL (default: https://erc.timetoact-group.at)

COMMON WORKFLOW:
  1. List benchmarks:           erc3 benchmarks
  2. Start a session:           erc3 session:start store --workspace my-ws --name "Test"
  3. Get session status:        erc3 session:status <session-id>
  4. Start a task:              erc3 task:start <task-id>
  5. Use benchmark CLI:         erc3-store products <task-id> --limit 3
  6. Complete the task:         erc3 task:complete <task-id>

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
    console.error(`\nDid you mean to use a benchmark-specific CLI?`);
    console.error(`  Store API: erc3-store --help`);
    console.error(`  Demo API:  erc3-demo --help`);
    console.error(`\nRun 'erc3 --help' for core commands.`);
    process.exit(1);
  }

  try {
    await handleCoreCommand(command, commandArgs);
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
