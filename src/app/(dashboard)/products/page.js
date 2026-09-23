import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';
import Link from 'next/link';
import { ShoppingBag, Plus } from 'lucide-react';
import ProductsTable from './ProductsTable';

export const metadata = {
  title: 'Products | Amma Ki Rasoi Admin'
};

export default async function ProductsPage() {
  await dbConnect();

  // Fetch all products, sorted by category then name. Serialized to plain
  // JSON (same pattern the storefront uses) so it can be handed to the
  // client-side table below, which owns search/filter/grouping.
  const products = JSON.parse(JSON.stringify(
    await Product.find({}).sort({ category: 1, name: 1 }).lean()
  ));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><ShoppingBag size={22} strokeWidth={2} /> Products & Inventory</h1>
        <Link href="/products/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={15} strokeWidth={2} /> Add New Product
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
