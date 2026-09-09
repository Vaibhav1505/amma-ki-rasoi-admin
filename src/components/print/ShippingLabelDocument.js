export default function ShippingLabelDocument({ order, business, barcodeDataUri }) {
  const fromCityLine = [business.city, business.state, business.pincode].filter(Boolean).join(', ');

  return (
    <div className="label-area" style={{
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
          <strong>{business.name}</strong><br/>
          {business.address && <>{business.address}<br/></>}
          {fromCityLine && <>{fromCityLine}<br/></>}
          {business.phone && <>Ph: {business.phone}</>}
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={barcodeDataUri} alt={order.orderId} style={{ maxWidth: '100%', height: '60px' }} />
        <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', marginTop: '8px' }}>
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
  );
}
