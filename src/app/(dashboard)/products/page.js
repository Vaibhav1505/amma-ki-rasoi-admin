import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';
import Link from 'next/link';

export const metadata = {
  title: 'Products | Amma Ki Rasoi Admin'
};

export default async function ProductsPage() {
  await dbConnect();
  
  // Fetch all products, sorted by category then name
  const products = await Product.find({}).sort({ category: 1, name: 1 }).lean();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Products & Inventory</h1>
        <Link href="/products/new" className="btn btn-primary">+ Add New Product</Link>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                  <div className="text-muted">No products found in the database.</div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id.toString()}>
                  <td>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                      {/* Placeholder for image */}
                      <span style={{ fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>IMG</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{product.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{product.subtitle}</div>
                  </td>
                  <td>{product.category}</td>
                  <td className="data-font">₹{product.price}</td>
                  <td className="data-font">
                    {product.stock}
                  </td>
                  <td>
                    {product.stock > 10 ? (
                      <span className="badge badge-delivered">In Stock</span>
                    ) : product.stock > 0 ? (
                      <span className="badge badge-pending">Low Stock</span>
                    ) : (
                      <span className="badge badge-shipped" style={{ backgroundColor: '#FEE2E2', color: 'var(--danger-red)' }}>Out of Stock</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/products/${product._id.toString()}/edit`} className="btn" style={{ marginRight: '8px' }}>Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
