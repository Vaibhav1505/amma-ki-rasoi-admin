import { notFound } from 'next/navigation';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../lib/models/Order';
import Link from 'next/link';

export default async function ShippingLabelPage({ params }) {
  const resolvedParams = await params;
  
  await dbConnect();
  
  let order;
  try {
    order = await Order.findById(resolvedParams.orderId).lean();
  } catch (e) {
    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Non-printable controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #ccc' }}>
        <Link href="/print" className="btn">&larr; Back to Print Centre</Link>
        <button className="btn btn-primary" type="button">🖨️ Print Label (4x6)</button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: 4in 6in; }
          body { background: white; margin: 0; }
          #label-area { border: none !important; width: 100% !important; height: 100% !important; margin: 0 !important; }
        }
      `}} />

      {/* 4x6 Shipping Label Area */}
      <div id="label-area" style={{ 
        width: '4in', 
        height: '6in', 
        backgroundColor: 'white', 
        border: '1px solid #000', 
        margin: '0 auto',
        padding: '0.25in',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        color: '#000',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* FROM Section */}
        <div style={{ display: 'flex', borderBottom: '2px solid #000', paddingBottom: '0.25in', marginBottom: '0.25in' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '16px' }}>F<br/>R<br/>O<br/>M</div>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <strong>Amma Ki Rasoi</strong><br/>
            123 Kitchen Road, Heritage Area<br/>
            Varanasi, UP 221001<br/>
            Ph: +91 98765 43210
          </div>
        </div>

        {/* TO Section */}
        <div style={{ display: 'flex', flex: '1' }}>
          <div style={{ fontWeight: 'bold', fontSize: '24px', marginRight: '24px' }}>T<br/>O</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {order.customerName}
            </div>
            <div style={{ fontSize: '16px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {order.shippingAddress}
            </div>
            <div style={{ marginTop: '16px', fontSize: '14px' }}>
              <strong>Phone:</strong> {order.customerPhone}
            </div>
          </div>
        </div>

        {/* Barcode/Order Info Footer */}
        <div style={{ borderTop: '2px solid #000', paddingTop: '0.25in', marginTop: 'auto', textAlign: 'center' }}>
          {/* Mock Barcode */}
          <div style={{ 
            fontFamily: '"Libre Barcode 39", monospace, sans-serif', 
            fontSize: '48px', 
            letterSpacing: '2px', 
            marginBottom: '8px',
            lineHeight: '0.8'
          }}>
            *{order.orderId}*
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>
            ORDER: {order.orderId}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Weight: {order.items.reduce((acc, item) => acc + item.quantity, 0) * 0.5} kg (approx)
          </div>
          
          {/* COD Indicator */}
          {order.paymentMethod === 'COD' && (
            <div style={{ 
              marginTop: '16px', 
              padding: '8px', 
              border: '4px solid #000', 
              fontSize: '24px', 
              fontWeight: 'bold', 
              textAlign: 'center' 
            }}>
              COLLECT COD: ₹{order.totalAmount}
            </div>
          )}
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button[type="button"]').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
