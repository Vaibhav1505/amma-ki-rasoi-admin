import SupplierForm from '../SupplierForm';

export const metadata = {
  title: 'Add Supplier | Amma Ki Rasoi Admin'
};

export default function NewSupplierPage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Add Supplier</h1>
      </div>
      <SupplierForm />
    </div>
  );
}
