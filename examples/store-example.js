/**
 * Store API Example
 *
 * This example demonstrates the Store API workflow:
 * 1. Starting a store session
 * 2. Browsing products with pagination
 * 3. Managing a shopping basket
 * 4. Applying coupons
 * 5. Checking out
 * 6. Completing the task
 */

import { ERC3, ApiException } from '../src/index.js';

async function main() {
  try {
    // Create client
    const client = new ERC3();
    console.log('✓ Client created');

    // Start a store session
    console.log('\n--- Starting Store Session ---');
    const session = await client.startSession({
      benchmark: 'store',
      workspace: 'store-example',
      name: 'Store API Example',
    });
    console.log('Session ID:', session.session_id);

    // Get tasks
    const status = await client.sessionStatus(session.session_id);
    const task = status.tasks[0];
    console.log('Task ID:', task.task_id);

    // Start the task
    await client.startTask(task);
    console.log('✓ Task started');

    // Get Store API client
    const store = client.getStoreClient(task);
    console.log('✓ Store client created');

    // Browse products with pagination
    console.log('\n--- Browsing Products ---');
    let allProducts = [];
    let offset = 0;
    let pageNum = 1;

    while (true) {
      const result = await store.listProducts({ offset, limit: 20 });
      console.log(`Page ${pageNum}: ${result.products.length} products`);

      allProducts.push(...result.products);

      // Show first few products from first page
      if (pageNum === 1) {
        result.products.slice(0, 3).forEach(p => {
          console.log(`  - ${p.name} (${p.sku}): $${p.price} (${p.available} available)`);
        });
      }

      if (result.next_offset === -1) break;
      offset = result.next_offset;
      pageNum++;
    }

    console.log(`\nTotal products found: ${allProducts.length}`);

    // Find cheapest product
    const cheapest = allProducts.reduce((min, p) =>
      p.price < min.price ? p : min
    );
    console.log(`\nCheapest product: ${cheapest.name} ($${cheapest.price})`);

    // Add items to basket
    console.log('\n--- Managing Basket ---');
    if (allProducts.length > 0) {
      const product1 = allProducts[0];
      console.log(`Adding to basket: ${product1.name}`);
      await store.addToBasket(product1.sku, 1);

      if (allProducts.length > 1) {
        const product2 = allProducts[1];
        console.log(`Adding to basket: ${product2.name}`);
        await store.addToBasket(product2.sku, 1);
      }
    }

    // View basket
    console.log('\n--- Viewing Basket ---');
    const basket = await store.viewBasket();
    console.log('Items in basket:', basket.items.length);
    console.log('Subtotal:', `$${basket.subtotal / 100}`);
    console.log('Discount:', `$${basket.discount / 100}`);
    console.log('Total:', `$${basket.total / 100}`);

    basket.items.forEach(item => {
      const product = allProducts.find(p => p.sku === item.sku);
      console.log(`  - ${product?.name || item.sku}: ${item.quantity} x $${item.price}`);
    });

    // Try applying a coupon (example - may not work for all tasks)
    console.log('\n--- Testing Coupons ---');
    const testCoupons = ['SAVE10', 'SAVE20', 'DOGGY25'];

    for (const coupon of testCoupons) {
      try {
        await store.applyCoupon(coupon);
        const updatedBasket = await store.viewBasket();
        console.log(`✓ Coupon ${coupon} applied: -$${updatedBasket.discount / 100}`);
        console.log(`  New total: $${updatedBasket.total / 100}`);

        // Remove coupon for next test
        await store.removeCoupon();
      } catch (error) {
        if (error instanceof ApiException) {
          console.log(`✗ Coupon ${coupon} failed: ${error.message}`);
        }
      }
    }

    // Checkout
    console.log('\n--- Checkout ---');
    const finalBasket = await store.viewBasket();
    console.log('Final basket before checkout:');
    console.log(`  Items: ${finalBasket.items.length}`);
    console.log(`  Total: $${finalBasket.total / 100}`);

    const checkoutResult = await store.checkout();
    console.log('\n✓ Checkout completed!');
    console.log('Order summary:');
    console.log(`  Items purchased: ${checkoutResult.items.length}`);
    console.log(`  Subtotal: $${checkoutResult.subtotal / 100}`);
    console.log(`  Discount: $${checkoutResult.discount / 100}`);
    console.log(`  Total: $${checkoutResult.total / 100}`);
    if (checkoutResult.coupon) {
      console.log(`  Coupon used: ${checkoutResult.coupon}`);
    }

    // Complete the task
    console.log('\n--- Completing Task ---');
    const result = await client.completeTask(task);
    console.log('Task evaluation:', result.eval);
    console.log('Success:', result.eval?.success);

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
  console.log('\n✓ Store example completed successfully!');
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
