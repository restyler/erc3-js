/**
 * Basic Usage Example
 *
 * This example demonstrates the core workflow of the ERC3 SDK:
 * 1. Creating a client
 * 2. Listing benchmarks
 * 3. Starting a session
 * 4. Managing tasks
 */

import { ERC3, ApiException } from '../src/index.js';

async function main() {
  try {
    // Create client (uses ERC3_API_KEY environment variable)
    const client = new ERC3();
    console.log('✓ Client created');

    // List available benchmarks
    console.log('\n--- Listing Benchmarks ---');
    const benchmarks = await client.listBenchmarks();
    console.log('Available benchmarks:', benchmarks.benchmarks);

    // View details of a specific benchmark
    console.log('\n--- Viewing Store Benchmark ---');
    const storeBenchmark = await client.viewBenchmark('store');
    console.log('Benchmark ID:', storeBenchmark.id);
    console.log('Description:', storeBenchmark.description);
    console.log('Number of specs:', storeBenchmark.specs?.length);

    // Start a new session
    console.log('\n--- Starting Session ---');
    const session = await client.startSession({
      benchmark: 'store',
      workspace: 'example-workspace',
      name: 'Basic Usage Example',
      architecture: 'x86_64'
    });
    console.log('Session ID:', session.session_id);
    console.log('Task count:', session.task_count);

    // Get session status
    console.log('\n--- Session Status ---');
    const status = await client.sessionStatus(session.session_id);
    console.log('Session ID:', status.session_id);
    console.log('Tasks:', status.tasks.length);

    // Start a task
    if (status.tasks.length > 0) {
      const task = status.tasks[0];
      console.log('\n--- Starting Task ---');
      console.log('Task ID:', task.task_id);

      await client.startTask(task);
      console.log('✓ Task started');

      // View task details
      const taskDetails = await client.viewTask(task.task_id);
      console.log('Task details:', taskDetails);

      // Note: In a real workflow, you would:
      // 1. Get the appropriate client (store/demo)
      // 2. Interact with the benchmark API
      // 3. Complete the task
      //
      // Example:
      // const storeClient = client.getStoreClient(task);
      // const products = await storeClient.listProducts();
      // ... perform task actions ...
      // const result = await client.completeTask(task);

      console.log('\n--- Task Workflow ---');
      console.log('To complete this task, you would:');
      console.log('1. Get specialized client: client.getStoreClient(task)');
      console.log('2. Interact with the API');
      console.log('3. Complete the task: client.completeTask(task)');
    }

    // Search for sessions
    console.log('\n--- Searching Sessions ---');
    const sessions = await client.searchSessions({
      workspace: 'example-workspace'
    });
    console.log('Found sessions:', sessions.sessions?.length || 0);

  } catch (error) {
    if (error instanceof ApiException) {
      console.error('\nAPI Error:', error.message);
      console.error('Status:', error.status);
      console.error('Code:', error.code);
      console.error('Detail:', error.detail);
    } else {
      console.error('\nUnexpected error:', error.message);
    }
    process.exit(1);
  }
}

// Run the example
main().then(() => {
  console.log('\n✓ Example completed successfully!');
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
