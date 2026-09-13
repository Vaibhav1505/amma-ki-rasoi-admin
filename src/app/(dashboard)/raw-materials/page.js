import dbConnect from '@/lib/mongodb';
import RawMaterial from '@/lib/models/RawMaterial';
import Supplier from '@/lib/models/Supplier'; // eslint-disable-line no-unused-vars -- registers the Supplier model so .populate('supplier') can resolve it
import { formatKg } from '@/lib/weight';
import { LOW_STOCK_THRESHOLD_GRAMS } from '@/lib/rawMaterials';
import Link from 'next/link';
import { Wheat, Plus } from 'lucide-react';

export const metadata = {
  title: 'Raw Materials | Amma Ki Rasoi Admin'
};

export default async function RawMaterialsPage() {
  await dbConnect();

  const rawMaterials = await RawMaterial.find({}).sort({ name: 1 }).populate('supplier', 'name').lean();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Wheat size={22} strokeWidth={2} /> Raw Materials</h1>
        <Link href="/raw-materials/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={15} strokeWidth={2} /> Add Raw Material
        </Link>
      </div>

      <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '24px' }}>
        Ingredients bought in bulk — mustard oil, sugar, elaichi, moongfali — used to make finished products. Logging a production batch on a product deducts from here automatically, based on that product's recipe. Manage who you buy from on the <Link href="/suppliers">Suppliers</Link> page.
      </p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rawMaterials.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                  <div className="text-muted">No raw materials yet. Add your first ingredient to start tracking recipes.</div>
                </td>
              </tr>
            ) : (
              rawMaterials.map((rm) => {
                const stock = rm.stockGrams ?? 0;
                return (
                  <tr key={rm._id.toString()}>
                    <td style={{ fontWeight: '600' }}>{rm.name}</td>
                    <td className="data-font">{formatKg(stock)}kg</td>
                    <td>{rm.supplier?.name || <span className="text-muted">—</span>}</td>
                    <td>
                      {stock > LOW_STOCK_THRESHOLD_GRAMS ? (
                        <span className="badge badge-delivered">In Stock</span>
                      ) : stock > 0 ? (
                        <span className="badge badge-pending">Low Stock</span>
                      ) : (
                        <span className="badge badge-shipped" style={{ backgroundColor: '#FEE2E2', color: 'var(--danger-red)' }}>Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/raw-materials/${rm._id.toString()}/edit`} className="btn" style={{ marginRight: '8px' }}>Edit</Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
