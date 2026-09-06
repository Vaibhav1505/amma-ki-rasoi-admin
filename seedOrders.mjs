import mongoose from 'mongoose';
import Order from './src/lib/models/Order.js';
import Counter from './src/lib/models/Counter.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amma_ki_rasoi';

async function seedOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Order.deleteMany({});
    console.log('Cleared existing orders');

    const orders = [
      {
        orderId: '#AKR-0245',
        customerName: 'Sunita Verma',
        customerPhone: '+91 9876543210',
        customerEmail: 'sunita@example.com',
        items: [
          { productName: 'Classic Aam Ka Achar', quantity: 2, price: 349 },
          { productName: 'Laal Bharua', quantity: 1, price: 449 }
        ],
        totalAmount: 1147,
        status: 'pending',
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        shippingAddress: '123 MG Road, Apt 4B\nLucknow, UP 226001'
      },
      {
        orderId: '#AKR-0246',
        customerName: 'Amit Kumar',
        customerPhone: '+91 9123456789',
        items: [
          { productName: 'Kathal Achaar', quantity: 1, price: 399 }
        ],
        totalAmount: 399,
        status: 'confirmed',
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        shippingAddress: '45 Civil Lines\nKanpur, UP 208001'
      },
      {
        orderId: '#AKR-0247',
        customerName: 'Meena Devi',
        customerPhone: '+91 9988776655',
        items: [
          { productName: 'Urad Dal Badi', quantity: 3, price: 220 }
        ],
        totalAmount: 660,
        status: 'packing',
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        shippingAddress: '78 Dashashwamedh Ghat\nVaranasi, UP 221001'
      }
    ];

    await Order.insertMany(orders);
    console.log(`Seeded ${orders.length} orders successfully.`);

    // Keep the auto-increment counter ahead of the seeded order numbers
    await Counter.findByIdAndUpdate('orderId', { $set: { seq: 247 } }, { upsert: true });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
}

seedOrders();
