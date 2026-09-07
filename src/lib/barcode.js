import bwipjs from 'bwip-js';

// Renders a real, scannable Code128 barcode server-side and returns it as a
// data: URI PNG, ready to drop into an <img> on a print page.
export async function generateBarcodeDataUri(text) {
  const png = await bwipjs.toBuffer({
    bcid: 'code128',
    text,
    scale: 3,
    height: 12,
    includetext: false,
    backgroundcolor: 'FFFFFF'
  });
  return `data:image/png;base64,${png.toString('base64')}`;
}
