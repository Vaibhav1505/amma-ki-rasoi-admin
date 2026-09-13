import ProductForm from '../ProductForm';
import dbConnect from '@/lib/mongodb';
import RawMaterial from '@/lib/models/RawMaterial';

export const metadata = {
  title: 'Add New Product | Amma Ki Rasoi Admin'
};

export default async function NewProductPage() {
  await dbConnect();
  const rawMaterials = await RawMaterial.find({}).sort({ name: 1 }).lean();
  // Only pass what the recipe picker on ProductForm actually needs — not the
  // raw document, which can carry a `supplier` ObjectId that isn't a plain
  // value React can pass from a Server to a Client Component.
  const serializedRawMaterials = rawMaterials.map(rm => ({ _id: rm._id.toString(), name: rm.name }));

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Add New Product</h1>
      </div>
      <ProductForm rawMaterials={serializedRawMaterials} />
    </div>
  );
}
