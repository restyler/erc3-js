/**
 * ERC3 Core API Commands
 */

import { ERC3, ApiException } from '../../src/index.js';

function parseArgs(args) {
  const parsed = { _: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      parsed[key] = value;
      i++;
    } else {
      parsed._.push(args[i]);
    }
  }
  return parsed;
}

function getClient() {
  const apiKey = process.env.ERC3_API_KEY;
  const baseUrl = process.env.ERC3_BASE_URL;

  if (!apiKey) {
    throw new Error('ERC3_API_KEY environment variable is required');
  }

  return new ERC3({ apiKey, baseUrl });
}

function formatJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

export async function handleCoreCommand(command, args) {
  const parsed = parseArgs(args);
  const client = getClient();

  try {
    switch (command) {
      case 'benchmarks': {
        const result = await client.listBenchmarks();
        formatJSON(result);
        break;
      }

      case 'benchmark': {
        const benchmarkId = parsed._[0];
        if (!benchmarkId) {
          throw new Error('Benchmark ID is required');
        }
        const result = await client.viewBenchmark(benchmarkId);
        formatJSON(result);
        break;
      }

      case 'session:start': {
        const benchmark = parsed._[0];
        const workspace = parsed.workspace;
        const name = parsed.name;
        const architecture = parsed.architecture || 'x86_64';

        if (!benchmark) {
          throw new Error('Benchmark ID is required');
        }
        if (!workspace) {
          throw new Error('--workspace is required');
        }
        if (!name) {
          throw new Error('--name is required');
        }

        const result = await client.startSession({
          benchmark,
          workspace,
          name,
          architecture,
        });
        formatJSON(result);
        break;
      }

      case 'session:status': {
        const sessionId = parsed._[0];
        if (!sessionId) {
          throw new Error('Session ID is required');
        }
        const result = await client.sessionStatus(sessionId);
        formatJSON(result);
        break;
      }

      case 'session:search': {
        const criteria = {};
        if (parsed.workspace) criteria.workspace = parsed.workspace;
        if (parsed.benchmark) criteria.benchmark = parsed.benchmark;

        const result = await client.searchSessions(criteria);
        formatJSON(result);
        break;
      }

      case 'session:submit': {
        const sessionId = parsed._[0];
        if (!sessionId) {
          throw new Error('Session ID is required');
        }
        const result = await client.submitSession(sessionId);
        formatJSON(result);
        break;
      }

      case 'task:start': {
        const taskId = parsed._[0];
        if (!taskId) {
          throw new Error('Task ID is required');
        }
        const result = await client.startTask(taskId);
        formatJSON(result);
        break;
      }

      case 'task:view': {
        const taskId = parsed._[0];
        const since = parsed.since ? parseInt(parsed.since) : null;
        if (!taskId) {
          throw new Error('Task ID is required');
        }
        const result = await client.viewTask(taskId, since);
        formatJSON(result);
        break;
      }

      case 'task:complete': {
        const taskId = parsed._[0];
        if (!taskId) {
          throw new Error('Task ID is required');
        }
        const result = await client.completeTask(taskId);
        formatJSON(result);
        break;
      }

      case 'task:log': {
        const taskId = parsed._[0];
        const model = parsed.model;
        const promptTokens = parsed['prompt-tokens'];
        const completionTokens = parsed['completion-tokens'];
        const duration = parsed.duration;

        if (!taskId) {
          throw new Error('Task ID is required');
        }
        if (!model) {
          throw new Error('--model is required');
        }
        if (!promptTokens) {
          throw new Error('--prompt-tokens is required');
        }
        if (!completionTokens) {
          throw new Error('--completion-tokens is required');
        }
        if (!duration) {
          throw new Error('--duration is required');
        }

        const result = await client.logLLM({
          taskId,
          model,
          usage: {
            prompt_tokens: parseInt(promptTokens),
            completion_tokens: parseInt(completionTokens),
            total_tokens: parseInt(promptTokens) + parseInt(completionTokens),
          },
          durationSec: parseFloat(duration),
        });
        formatJSON(result);
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    if (error instanceof ApiException) {
      console.error('API Error:', error.message);
      console.error('Status:', error.status);
      console.error('Code:', error.code);
      if (process.env.DEBUG) {
        console.error('Detail:', error.detail);
      }
    } else {
      throw error;
    }
    process.exit(1);
  }
}
