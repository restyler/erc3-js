/**
 * Demo API Example
 *
 * This example demonstrates the Demo API workflow:
 * 1. Starting a demo session
 * 2. Retrieving the secret
 * 3. Submitting the answer
 * 4. Completing the task
 */

import { ERC3, ApiException } from '../src/index.js';

async function main() {
  try {
    // Create client
    const client = new ERC3();
    console.log('✓ Client created');

    // Start a demo session
    console.log('\n--- Starting Demo Session ---');
    const session = await client.startSession({
      benchmark: 'demo',
      workspace: 'demo-example',
      name: 'Demo API Example',
    });
    console.log('Session ID:', session.session_id);
    console.log('Task count:', session.task_count);

    // Get tasks
    const status = await client.sessionStatus(session.session_id);
    console.log('Tasks available:', status.tasks.length);

    // Process the first task
    const task = status.tasks[0];
    console.log('\n--- Processing Task ---');
    console.log('Task ID:', task.task_id);

    // Start the task
    await client.startTask(task);
    console.log('✓ Task started');

    // Get Demo API client
    const demo = client.getDemoClient(task);
    console.log('✓ Demo client created');

    // Get the secret
    console.log('\n--- Retrieving Secret ---');
    const secretResult = await demo.getSecret();
    console.log('Secret retrieved:', secretResult.value);

    // Submit the answer
    console.log('\n--- Submitting Answer ---');
    await demo.submitAnswer(secretResult.value);
    console.log('✓ Answer submitted');

    // Complete the task
    console.log('\n--- Completing Task ---');
    const result = await client.completeTask(task);
    console.log('Task evaluation:', result.eval);
    console.log('Success:', result.eval?.success);

    // Example using dispatch method (for LLM agents)
    console.log('\n--- Alternative: Using Dispatch Method ---');
    if (status.tasks.length > 1) {
      const task2 = status.tasks[1];
      await client.startTask(task2);

      const demo2 = client.getDemoClient(task2);

      // Use dispatch for tool-based workflow
      const secret = await demo2.dispatch({ tool: '/secret' });
      console.log('Secret (via dispatch):', secret.value);

      await demo2.dispatch({
        tool: '/answer',
        answer: secret.value
      });
      console.log('✓ Answer submitted (via dispatch)');

      const result2 = await client.completeTask(task2);
      console.log('Task 2 success:', result2.eval?.success);
    }

  } catch (error) {
    if (error instanceof ApiException) {
      console.error('\nAPI Error:', error.message);
      console.error('Status:', error.status);
      console.error('Code:', error.code);
    } else {
      console.error('\nUnexpected error:', error.message);
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the example
main().then(() => {
  console.log('\n✓ Demo example completed successfully!');
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
