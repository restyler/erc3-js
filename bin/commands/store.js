/**
 * Store API Commands
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

function formatBasket(basket) {
  console.log('\n=== Shopping Basket ===');
  console.log(`Items: ${basket.items?.length || 0}`);
  console.log(`Subtotal: $${(basket.subtotal || 0).toFixed(2)}`);
  console.log(`Discount: $${(basket.discount || 0).toFixed(2)}`);
  console.log(`Total: $${(basket.total || 0).toFixed(2)}`);
  if (basket.coupon) {
    console.log(`Coupon: ${basket.coupon}`);
  }

  if (basket.items && basket.items.length > 0) {
    console.log('\nItems:');
    basket.items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.sku}: ${item.quantity} x $${(item.price).toFixed(2)}`);
    });
  }
  console.log('');
}

function formatProducts(result) {
  console.log('\n=== Products ===');
  console.log(`Showing ${result.products?.length || 0} products`);
  console.log(`Next offset: ${result.next_offset}`);
  console.log('');

  if (result.products && result.products.length > 0) {
    result.products.forEach((product, i) => {
      console.log(`${i + 1}. ${product.name} (${product.sku})`);
      console.log(`   Price: $${(product.price).toFixed(2)}`);
      console.log(`   Available: ${product.available}`);
      console.log('');
    });
  }
}

export async function handleStoreCommand(command, args) {
  const parsed = parseArgs(args);
  const client = getClient();

  try {
    const taskId = parsed._[0];
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const store = client.getStoreClient(taskId);

    switch (command) {
      case 'store:products': {
        const offset = parsed.offset ? parseInt(parsed.offset) : 0;
        const limit = parsed.limit ? parseInt(parsed.limit) : 20;

        const result = await store.listProducts({ offset, limit });

        if (parsed.json) {
          formatJSON(result);
        } else {
          formatProducts(result);
        }
        break;
      }

      case 'store:basket': {
        const result = await store.viewBasket();

        if (parsed.json) {
          formatJSON(result);
        } else {
          formatBasket(result);
        }
        break;
      }

      case 'store:add': {
        const sku = parsed.sku;
        const quantity = parsed.quantity ? parseInt(parsed.quantity) : 1;

        if (!sku) {
          throw new Error('--sku is required');
        }

        const result = await store.addToBasket(sku, quantity);
        console.log(`✓ Added ${quantity}x ${sku} to basket`);
        console.log(`  Line count: ${result.line_count}`);
        console.log(`  Item count: ${result.item_count}`);
        break;
      }

      case 'store:remove': {
        const sku = parsed.sku;
        const quantity = parsed.quantity ? parseInt(parsed.quantity) : 1;

        if (!sku) {
          throw new Error('--sku is required');
        }

        const result = await store.removeFromBasket(sku, quantity);
        console.log(`✓ Removed ${quantity}x ${sku} from basket`);
        console.log(`  Line count: ${result.line_count}`);
        console.log(`  Item count: ${result.item_count}`);
        break;
      }

      case 'store:coupon:apply': {
        const coupon = parsed.coupon;

        if (!coupon) {
          throw new Error('--coupon is required');
        }

        await store.applyCoupon(coupon);
        console.log(`✓ Coupon '${coupon}' applied successfully`);

        // Show updated basket
        const basket = await store.viewBasket();
        formatBasket(basket);
        break;
      }

      case 'store:coupon:remove': {
        await store.removeCoupon();
        console.log('✓ Coupon removed');

        // Show updated basket
        const basket = await store.viewBasket();
        formatBasket(basket);
        break;
      }

      case 'store:checkout': {
        const result = await store.checkout();

        console.log('\n✓ Checkout completed!');
        console.log('\n=== Order Summary ===');
        console.log(`Items: ${result.items?.length || 0}`);
        console.log(`Subtotal: $${(result.subtotal || 0).toFixed(2)}`);
        console.log(`Discount: $${(result.discount || 0).toFixed(2)}`);
        console.log(`Total: $${(result.total || 0).toFixed(2)}`);
        if (result.coupon) {
          console.log(`Coupon used: ${result.coupon}`);
        }

        if (result.items && result.items.length > 0) {
          console.log('\nItems purchased:');
          result.items.forEach((item, i) => {
            console.log(`  ${i + 1}. ${item.sku}: ${item.quantity} x $${(item.price).toFixed(2)}`);
          });
        }
        console.log('');
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
