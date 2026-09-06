import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import EditOrderForm from './EditOrderForm';

export const metadata = {
  title: 'Edit Order | Amma Ki Rasoi Admin'
};

export default async function EditOrderPage({ params }) {
  const resolvedParams = await params;
  await dbConnect();

  let order;
  try {
    order = await Order.findById(resolvedParams.id).lean();
  } catch (e) {
    notFound();
  }
  if (!order) notFound();

  const serializedOrder = {
    ...order,
    _id: order._id.toString(),
    items: order.items.map(i => ({ product: i.product ? i.product.toString() : '', productName: i.productName, quantity: i.quantity, price: i.price })),
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link href={`/orders/${serializedOrder._id}`} style={{ color: 'var(--primary-terracotta)', textDecoration: 'none', fontWeight: '500' }}>← Back to Order</Link>
      </div>
      <h1 className="page-title" style={{ marginBottom: '32px' }}>Edit Order {order.orderId}</h1>
      <EditOrderForm order={serializedOrder} />
    </div>
  );
}
