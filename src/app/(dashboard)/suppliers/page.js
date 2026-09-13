import dbConnect from '@/lib/mongodb';
import Supplier from '@/lib/models/Supplier';
import RawMaterial from '@/lib/models/RawMaterial';
import Link from 'next/link';
import { Building2, Plus } from 'lucide-react';

export const metadata = {
  title: 'Suppliers | Amma Ki Rasoi Admin'
};

export default async function SuppliersPage() {
  await dbConnect();

  const suppliers = await Supplier.find({}).sort({ name: 1 }).lean();
  const rawMaterials = await RawMaterial.find({ supplier: { $ne: null } }, 'supplier').lean();

  const supplyCounts = {};
  for (const rm of rawMaterials) {
    if (!rm.supplier) continue;
    const key = rm.supplier.toString();
    supplyCounts[key] = (supplyCounts[key] || 0) + 1;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Building2 size={22} strokeWidth={2} /> Suppliers</h1>
        <Link href="/suppliers/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={15} strokeWidth={2} /> Add Supplier
        </Link>
      </div>

      <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '24px' }}>
        Who you buy raw materials from — mustard oil, sugar, elaichi, and so on. Pick a supplier here when adding or editing a raw material.
      </p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Raw Materials</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                  <div className="text-muted">No suppliers yet. Add your first one to start linking it to raw materials.</div>
                </td>
              </tr>
            ) : (
              suppliers.map((s) => {
                const count = supplyCounts[s._id.toString()] || 0;
                return (
                  <tr key={s._id.toString()}>
                    <td style={{ fontWeight: '600' }}>{s.name}</td>
                    <td>{s.contactPerson || <span className="text-muted">—</span>}</td>
                    <td className="data-font">{s.phone || <span className="text-muted">—</span>}</td>
                    <td>{s.email || <span className="text-muted">—</span>}</td>
                    <td className="data-font">{count}</td>
                    <td>
                      <Link href={`/suppliers/${s._id.toString()}/edit`} className="btn" style={{ marginRight: '8px' }}>Edit</Link>
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
