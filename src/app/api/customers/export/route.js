import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const orders = await Order.find().lean();
    const customers = await Customer.find().lean();
    const tagsByPhone = new Map(customers.map(c => [c.phone, c.tags || []]));

    const byPhone = new Map();
    orders.forEach(order => {
      const phone = order.customerPhone;
      if (!byPhone.has(phone)) {
        byPhone.set(phone, {
          name: order.customerName,
          phone,
          email: order.customerEmail || '',
          address: order.shippingAddress || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
        });
      }
      const cust = byPhone.get(phone);
      cust.totalOrders += 1;
      cust.totalSpent += order.totalAmount;
      if (new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
        cust.lastOrderDate = order.createdAt;
      }
    });

    const rows = [['Name', 'Phone', 'Email', 'Total Orders', 'Total Spent', 'Last Order', 'Tags', 'Address']];
    Array.from(byPhone.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .forEach(c => {
        rows.push([
          c.name, c.phone, c.email, c.totalOrders, c.totalSpent,
          new Date(c.lastOrderDate).toISOString().slice(0, 10),
          (tagsByPhone.get(c.phone) || []).join('; '),
          c.address,
        ]);
      });

    const csv = rows.map(row => row.map(csvEscape).join(',')).join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
