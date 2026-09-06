import ProductForm from '../ProductForm';

export const metadata = {
  title: 'Add New Product | Amma Ki Rasoi Admin'
};

export default function NewProductPage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Add New Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
