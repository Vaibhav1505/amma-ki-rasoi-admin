import RawMaterialForm from '../RawMaterialForm';
import dbConnect from '@/lib/mongodb';
import Supplier from '@/lib/models/Supplier';

export const metadata = {
  title: 'Add Raw Material | Amma Ki Rasoi Admin'
};

export default async function NewRawMaterialPage() {
  await dbConnect();
  const suppliers = await Supplier.find({}).sort({ name: 1 }).lean();
  const serializedSuppliers = suppliers.map(s => ({ ...s, _id: s._id.toString() }));

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Add Raw Material</h1>
      </div>
      <RawMaterialForm suppliers={serializedSuppliers} />
    </div>
  );
}
