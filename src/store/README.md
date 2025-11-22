# Store API

The Store API provides e-commerce functionality for the ERC3 "store" benchmark. It simulates an online shopping platform with product catalog, shopping cart, coupons, and checkout.

## Overview

The Store API is a separate API from the main ERC3 client, designed specifically for the "store" benchmark. It provides all the functionality needed to:

- Browse products with pagination
- Manage a shopping basket
- Apply discount coupons
- Complete purchases

**Important:** All prices in the API are in **cents** (divide by 100 for display in dollars).

## Getting Started

```javascript
import { ERC3 } from 'erc3-js';

const client = new ERC3({ apiKey: 'your-api-key' });

// Start a store session
const session = await client.startSession({
  benchmark: 'store',
  workspace: 'my-workspace',
  name: 'Store Test'
});

// Get a task
const status = await client.sessionStatus(session.session_id);
const task = status.tasks[0];

// Start the task
await client.startTask(task);

// Get the Store API client
const store = client.getStoreClient(task);

// Now use the store API
const products = await store.listProducts();
```

## API Reference

Base URL: `https://erc.timetoact-group.at/store/{TASK_ID}`

### Product Management

#### `listProducts({ offset?, limit? })`

Lists products with pagination.

**Parameters:**
- `offset` (number, optional): Starting position (default: 0)
- `limit` (number, optional): Number of items per page (default: 20)

**Returns:**
- `products` (array): Array of product objects
  - `sku` (string): Product SKU
  - `name` (string): Product name
  - `available` (number): Available quantity
  - `price` (number): Price in cents
- `next_offset` (number): Offset for next page, or -1 if no more pages

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "offset": 0,
    "limit": 3
  }' \
  https://erc.timetoact-group.at/store/TASK_ID/products/list
```

**JavaScript Example:**
```javascript
// Get first page
const page1 = await store.listProducts({ offset: 0, limit: 20 });
console.log(page1.products);

// Check if there are more pages
if (page1.next_offset !== -1) {
  const page2 = await store.listProducts({
    offset: page1.next_offset,
    limit: 20
  });
}
```

**Sample Response:**
```json
{
  "products": [
    {
      "sku": "gpu-h100",
      "name": "NVIDIA H100",
      "available": 1,
      "price": 2000000
    },
    {
      "sku": "gpu-a100",
      "name": "NVIDIA A100",
      "available": 4,
      "price": 298750
    }
  ],
  "next_offset": -1
}
```

### Shopping Basket

#### `viewBasket()`

Views the current shopping basket.

**Returns:**
- `items` (array): Array of basket items
  - `sku` (string): Product SKU
  - `quantity` (number): Quantity in basket
  - `price` (number): Unit price in cents
- `subtotal` (number): Subtotal in cents (before discount)
- `discount` (number): Discount amount in cents
- `total` (number): Total in cents (after discount)
- `coupon` (string|null): Applied coupon code, or null

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{}' \
  https://erc.timetoact-group.at/store/TASK_ID/basket/view
```

**JavaScript Example:**
```javascript
const basket = await store.viewBasket();
console.log('Items:', basket.items);
console.log('Total:', basket.total / 100); // Convert cents to dollars
```

**Sample Response:**
```json
{
  "items": [
    {
      "sku": "gpu-h100",
      "quantity": 1,
      "price": 2000000
    }
  ],
  "subtotal": 2000000,
  "discount": 0,
  "total": 2000000,
  "coupon": null
}
```

#### `addToBasket(sku, quantity?)`

Adds a product to the basket.

**Parameters:**
- `sku` (string): Product SKU
- `quantity` (number, optional): Quantity to add (default: 1)

**Returns:**
- `line_count` (number): Number of unique items in basket
- `item_count` (number): Total quantity of items in basket

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "sku": "gpu-h100",
    "quantity": 1
  }' \
  https://erc.timetoact-group.at/store/TASK_ID/basket/add
```

**JavaScript Example:**
```javascript
// Add 2 units of a product
await store.addToBasket('gpu-h100', 2);

// Add 1 unit (default quantity)
await store.addToBasket('gpu-a100');
```

**Sample Response:**
```json
{
  "line_count": 1,
  "item_count": 1
}
```

#### `removeFromBasket(sku, quantity?)`

Removes a product from the basket.

**Parameters:**
- `sku` (string): Product SKU
- `quantity` (number, optional): Quantity to remove (default: 1)

**Returns:**
- `line_count` (number): Number of unique items in basket
- `item_count` (number): Total quantity of items in basket

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "sku": "gpu-h100",
    "quantity": 1
  }' \
  https://erc.timetoact-group.at/store/TASK_ID/basket/remove
```

**JavaScript Example:**
```javascript
// Remove 1 unit
await store.removeFromBasket('gpu-h100', 1);

// Remove all units of a product
const basket = await store.viewBasket();
const item = basket.items.find(i => i.sku === 'gpu-h100');
if (item) {
  await store.removeFromBasket('gpu-h100', item.quantity);
}
```

**Sample Response:**
```json
{
  "line_count": 0,
  "item_count": 0
}
```

#### `checkout()`

Completes the purchase and clears the basket.

**Returns:**
- `items` (array): Final order items
- `subtotal` (number): Subtotal in cents
- `discount` (number): Discount amount in cents
- `total` (number): Total charged in cents
- `coupon` (string|null): Applied coupon code

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{}' \
  https://erc.timetoact-group.at/store/TASK_ID/basket/checkout
```

**JavaScript Example:**
```javascript
const result = await store.checkout();
console.log('Order total:', result.total / 100);
console.log('Items purchased:', result.items);
console.log('Discount applied:', result.discount / 100);
```

**Sample Response:**
```json
{
  "items": [
    {
      "sku": "gpu-h100",
      "quantity": 1,
      "price": 2000000
    },
    {
      "sku": "gpu-a100",
      "quantity": 4,
      "price": 298750
    }
  ],
  "subtotal": 3195000,
  "discount": 0,
  "total": 3195000,
  "coupon": null
}
```

### Coupons

#### `applyCoupon(coupon)`

Applies a discount coupon to the basket. Only one coupon can be active at a time.

**Parameters:**
- `coupon` (string): Coupon code

**Returns:**
- Empty object `{}` on success

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "coupon": "DOGGY25"
  }' \
  https://erc.timetoact-group.at/store/TASK_ID/coupon/apply
```

**JavaScript Example:**
```javascript
// Apply a coupon
await store.applyCoupon('DOGGY25');

// View updated basket with discount
const basket = await store.viewBasket();
console.log('Discount:', basket.discount / 100);
console.log('Coupon:', basket.coupon);
```

**Sample Response:**
```json
{}
```

#### `removeCoupon()`

Removes the currently applied coupon.

**Returns:**
- Empty object `{}` on success

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{}' \
  https://erc.timetoact-group.at/store/TASK_ID/coupon/remove
```

**JavaScript Example:**
```javascript
await store.removeCoupon();
```

**Sample Response:**
```json
{}
```

### Tool Dispatch (for LLM agents)

#### `dispatch(request)`

Dispatches a request to the appropriate method based on the `tool` field. This is useful for LLM agents that work with tool-based APIs.

**Parameters:**
- `request` (object): Request object with `tool` field and method-specific parameters

**JavaScript Example:**
```javascript
// List products
const products = await store.dispatch({
  tool: '/products/list',
  offset: 0,
  limit: 20
});

// Add to basket
await store.dispatch({
  tool: '/basket/add',
  sku: 'gpu-h100',
  quantity: 1
});

// Apply coupon
await store.dispatch({
  tool: '/coupon/apply',
  coupon: 'DOGGY25'
});
```

## Complete Workflow Example

```javascript
import { ERC3 } from 'erc3-js';

const client = new ERC3({ apiKey: 'your-api-key' });

// Start session and get task
const session = await client.startSession({
  benchmark: 'store',
  workspace: 'test',
  name: 'Shopping Test'
});

const status = await client.sessionStatus(session.session_id);
const task = status.tasks[0];
await client.startTask(task);

// Get store client
const store = client.getStoreClient(task);

// Browse products
let allProducts = [];
let offset = 0;
while (true) {
  const result = await store.listProducts({ offset, limit: 20 });
  allProducts.push(...result.products);

  if (result.next_offset === -1) break;
  offset = result.next_offset;
}

console.log(`Found ${allProducts.length} products`);

// Add items to basket
await store.addToBasket('gpu-h100', 1);
await store.addToBasket('gpu-a100', 2);

// View basket
const basket = await store.viewBasket();
console.log('Subtotal:', basket.subtotal / 100);

// Apply coupon
await store.applyCoupon('SAVE20');

// View updated basket
const updatedBasket = await store.viewBasket();
console.log('Discount:', updatedBasket.discount / 100);
console.log('Total:', updatedBasket.total / 100);

// Checkout
const order = await store.checkout();
console.log('Order completed! Total:', order.total / 100);

// Complete the task
const result = await client.completeTask(task);
console.log('Task evaluation:', result.eval);
```

## Common Patterns

### Find Cheapest Product

```javascript
const products = [];
let offset = 0;

// Get all products
while (true) {
  const result = await store.listProducts({ offset, limit: 20 });
  products.push(...result.products);
  if (result.next_offset === -1) break;
  offset = result.next_offset;
}

// Find cheapest
const cheapest = products.reduce((min, p) =>
  p.price < min.price ? p : min
);

console.log('Cheapest:', cheapest.name, cheapest.price / 100);
```

### Test Multiple Coupons

```javascript
const coupons = ['SAVE10', 'SAVE20', 'DOGGY25'];
const results = [];

for (const coupon of coupons) {
  try {
    await store.applyCoupon(coupon);
    const basket = await store.viewBasket();
    results.push({
      coupon,
      discount: basket.discount,
      total: basket.total
    });
    await store.removeCoupon();
  } catch (error) {
    console.log(`Coupon ${coupon} failed:`, error.message);
  }
}

// Find best coupon
const best = results.reduce((max, r) =>
  r.discount > max.discount ? r : max
);

console.log('Best coupon:', best.coupon, 'saves', best.discount / 100);
```

## Error Handling

```javascript
import { ApiException } from 'erc3-js';

try {
  await store.addToBasket('invalid-sku', 1);
} catch (error) {
  if (error instanceof ApiException) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  }
}
```

## Important Notes

1. **Prices in Cents**: All prices are in cents. Always divide by 100 for display.
   ```javascript
   console.log(`$${price / 100}`);
   ```

2. **Pagination**: Some benchmarks have very small page limits (e.g., 2-3 items). Always paginate through all results.

3. **Single Coupon**: Only one coupon can be applied at a time. Applying a new coupon replaces the old one.

4. **Checkout Clears Basket**: After checkout, the basket is emptied.

5. **Task-Specific**: Each task has its own isolated store with different products and coupons.

## Benchmark Specifications

The store benchmark includes various task types:

- **gpu_race**: Buy ALL GPUs (even if some sell out)
- **pet_store_best_coupon**: Find best coupon for Dog Food Premium
- **soda_pack_optimizer**: Buy 24 sodas as cheaply as possible
- **insufficient_inventory_simple**: Detect impossible purchase (not enough stock)
- **product_doesnt_exist**: Detect non-existent product
- **budget_constraint_violation**: Detect budget violations
- **hidden_cheap_gpu**: Find cheapest GPU across paginated results
- And more...

Each task tests different aspects of shopping logic, inventory management, and optimization.
