/**
 * Demo API Commands
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

export async function handleDemoCommand(command, args) {
  const parsed = parseArgs(args);
  const client = getClient();

  try {
    const taskId = parsed._[0];
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const demo = client.getDemoClient(taskId);

    switch (command) {
      case 'demo:secret': {
        const result = await demo.getSecret();

        if (parsed.json) {
          formatJSON(result);
        } else {
          console.log('\n=== Task Secret ===');
          console.log(`Secret: ${result.value}`);
          console.log('');
        }
        break;
      }

      case 'demo:answer': {
        const answer = parsed.answer;

        if (!answer) {
          throw new Error('--answer is required');
        }

        await demo.submitAnswer(answer);
        console.log('✓ Answer submitted successfully');
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
