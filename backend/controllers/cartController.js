const { MongoClient, ObjectId } = require('mongodb');

const uri = 'YOUR_MONGO_URI'; // move to env variable in real app

async function saveForLater(userId, productId) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const carts = db.collection('carts');

    await carts.updateOne(
      { userId, "products.productId": productId },
      { $set: { "products.$.savedForLater": true } }
    );

    console.log('Item moved to saved-for-later');
  } finally {
    await client.close();
  }
}

async function moveToCart(userId, productId) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const carts = db.collection('carts');

    await carts.updateOne(
      { userId, "products.productId": productId },
      { $set: { "products.$.savedForLater": false } }
    );

    console.log('Item moved back to cart');
  } finally {
    await client.close();
  }
}

async function getSavedItems(userId) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const carts = db.collection('carts');

    const savedItems = await carts.findOne(
      { userId },
      { projection: { products: { $elemMatch: { savedForLater: true } } } }
    );

    return savedItems;
  } finally {
    await client.close();
  }
}

module.exports = { saveForLater, moveToCart, getSavedItems };
