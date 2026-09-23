'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WEIGHT_OPTIONS, kgToGrams, formatKg } from '@/lib/weight';

// Stock is tracked ONCE per product, as a total weight in kg (stored as
// grams under the hood — see lib/weight.js), not per package size. Check
// off whichever of the fixed package sizes (250g/500g/1kg) this product is
// sold in and set a price for each; how much total stock you have is one
// number that all of them draw from.
//
// 1kg jars/packets of Badi, Sweets, and Namkeen don't pack or ship well, so
// those categories are capped at 250g/500g — the 1kg checkbox simply isn't
// offered for them (see allowedWeightsForCategory below). Pickles and Honey
// are unaffected.
const NO_1KG_CATEGORIES = ['Badi', 'Sweets', 'Namkeen'];

function allowedWeightsForCategory(category) {
  return NO_1KG_CATEGORIES.includes(category)
    ? WEIGHT_OPTIONS.filter(w => w !== '1kg')
    : WEIGHT_OPTIONS;
}

export default function ProductForm({ initialData = null, rawMaterials = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialVariants = Object.fromEntries(
    WEIGHT_OPTIONS.map(weight => {
      const existing = initialData?.variants?.find(v => v.weight === weight);
      return [
        weight,
        existing
          ? { enabled: true, price: String(existing.price ?? ''), mrp: existing.mrp != null ? String(existing.mrp) : '' }
          : { enabled: false, price: '', mrp: '' }
      ];
    })
  );

  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    name: initialData?.name || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Pickles',
    image: initialData?.images?.[0] || '',
    badge: initialData?.badge || '',
    ingredients: initialData?.ingredients ? initialData.ingredients.join(', ') : '',
    stockKg: formatKg(initialData?.stockGrams ?? 0)
  });
  const [variants, setVariants] = useState(initialVariants);

  // Recipe (bill of materials): how many grams of each raw material go into
  // 1kg of this finished product. Entirely optional — a product with no
  // recipe rows just isn't tracked against raw material stock; logging a
  // production batch for it only adds finished stock. See lib/rawMaterials.js.
  const initialRecipe = (initialData?.recipe || []).map(line => ({
    rawMaterial: line.rawMaterial || '',
    gramsPerKg: line.gramsPerKg != null ? String(line.gramsPerKg) : ''
  }));
  const [recipe, setRecipe] = useState(initialRecipe.length > 0 ? initialRecipe : []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Switching into a no-1kg category clears any 1kg selection so it can't
    // be silently resurrected by switching back to a category that allows it.
    if (name === 'category' && NO_1KG_CATEGORIES.includes(value)) {
      setVariants(prev => ({ ...prev, '1kg': { enabled: false, price: '', mrp: '' } }));
    }
  };

  const toggleVariant = (weight) => {
    setVariants(prev => ({ ...prev, [weight]: { ...prev[weight], enabled: !prev[weight].enabled } }));
  };

  const handleVariantField = (weight, field, value) => {
    setVariants(prev => ({ ...prev, [weight]: { ...prev[weight], [field]: value } }));
  };

  const addRecipeLine = () => {
    setRecipe(prev => [...prev, { rawMaterial: rawMaterials[0]?._id || '', gramsPerKg: '' }]);
  };

  const removeRecipeLine = (idx) => {
    setRecipe(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRecipeField = (idx, field, value) => {
    setRecipe(prev => prev.map((line, i) => (i === idx ? { ...line, [field]: value } : line)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const selectedVariants = allowedWeightsForCategory(formData.category)
      .filter(w => variants[w].enabled)
      .map(w => {
        const price = Number(variants[w].price);
        const mrp = variants[w].mrp !== '' ? Number(variants[w].mrp) : price;
        return { weight: w, price, mrp };
      });

    if (selectedVariants.length === 0) {
      setError(`Offer at least one package size (${allowedWeightsForCategory(formData.category).join(' / ')}).`);
      return;
    }
    if (selectedVariants.some(v => !v.price || v.price <= 0)) {
      setError('Every offered package size needs a price.');
      return;
    }
    if (recipe.some(line => !line.rawMaterial || !line.gramsPerKg || Number(line.gramsPerKg) <= 0)) {
      setError('Every recipe row needs a raw material and a grams-per-kg amount greater than 0.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        slug: formData.slug,
        name: formData.name,
        subtitle: formData.subtitle,
        description: formData.description,
        category: formData.category,
        badge: formData.badge,
        images: formData.image ? [formData.image] : [],
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        variants: selectedVariants,
        stockGrams: kgToGrams(formData.stockKg),
        recipe: recipe.map(line => ({ rawMaterial: line.rawMaterial, gramsPerKg: Number(line.gramsPerKg) }))
      };

      const url = initialData
        ? `/api/products/${initialData._id}`
        : '/api/products';

      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/products');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '500' };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px' }}>
      {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: 'var(--danger-red)', marginBottom: '16px', borderRadius: '4px' }}>{error}</div>}

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>Product Name</label>
          <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Slug (Unique ID)</label>
          <input required name="slug" value={formData.slug} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Subtitle</label>
        <input name="subtitle" value={formData.subtitle} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Description</label>
        <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" style={inputStyle} />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Package Sizes & Prices</label>
      </div>
      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 0, marginBottom: '10px' }}>
        Enter the final price customers pay — these are treated as GST-inclusive (see Settings → GST), so there's nothing extra to add here whether or not GST applies yet.
      </p>
      <div style={{ border: '1px solid #eee', borderRadius: '6px', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 1fr',
            gap: '16px',
            padding: '10px 12px',
            backgroundColor: '#f7f5f0',
            borderBottom: '1px solid #eee'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selling Price (₹)</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MRP (₹, optional)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(() => { const allowedWeights = allowedWeightsForCategory(formData.category); return allowedWeights.map((weight, idx) => {
            const v = variants[weight];
            return (
              <div
                key={weight}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '12px',
                  borderBottom: idx < allowedWeights.length - 1 ? '1px solid #eee' : 'none',
                  opacity: v.enabled ? 1 : 0.6
                }}
              >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
                <input type="checkbox" checked={v.enabled} onChange={() => toggleVariant(weight)} />
                {weight}
              </label>
              <input
                type="number"
                placeholder="e.g. 220"
                value={v.price}
                onChange={e => handleVariantField(weight, 'price', e.target.value)}
                disabled={!v.enabled}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="e.g. 250 (optional)"
                value={v.mrp}
                onChange={e => handleVariantField(weight, 'mrp', e.target.value)}
                disabled={!v.enabled}
                style={inputStyle}
              />
            </div>
            );
          }); })()}
        </div>
      </div>
      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '8px', marginBottom: '24px' }}>
        Check off every size this product is sold in on the storefront, with its own price. All sizes draw from the one stock total below.
        {NO_1KG_CATEGORIES.includes(formData.category) && ' (1kg isn’t offered for Badi, Sweets, or Namkeen — it doesn’t pack or ship well.)'}
      </p>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '8px' }}>
        <div>
          <label style={labelStyle}>Total Stock (kg)</label>
          <input required type="number" step="0.01" min="0" name="stockKg" value={formData.stockKg} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
            <option value="Pickles">Pickles</option>
            <option value="Badi">Badi</option>
            <option value="Sweets">Sweets</option>
            <option value="Namkeen">Namkeen</option>
            <option value="Honey">Honey</option>
          </select>
        </div>
      </div>
      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 0, marginBottom: '24px' }}>
        Total raw/packed weight you have on hand right now — e.g. 200 for 200kg. Every order deducts from this, regardless of which package size was ordered.
      </p>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Badge (Optional)</label>
        <input name="badge" value={formData.badge} onChange={handleChange} placeholder="e.g. Bestseller" style={inputStyle} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Image URL</label>
        <input name="image" value={formData.image} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Ingredients (comma separated)</label>
        <input name="ingredients" value={formData.ingredients} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Recipe (per kg, optional)</label>
      </div>
      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 0, marginBottom: '10px' }}>
        How much of each raw material this product uses to make 1kg of it — e.g. Thekua might use 300g sugar and 20g elaichi per kg. Leave empty if you don't want to track this product against raw material stock yet. Logging a production batch scales these amounts to whatever batch size you enter.
      </p>
      {rawMaterials.length === 0 ? (
        <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: 0, marginBottom: '32px' }}>
          No raw materials added yet — add some on the Raw Materials page first if you want to set a recipe here.
        </p>
      ) : (
        <>
          <div style={{ border: '1px solid #eee', borderRadius: '6px', overflow: 'hidden', marginBottom: recipe.length > 0 ? '10px' : 0 }}>
            {recipe.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px 40px',
                  gap: '16px',
                  padding: '10px 12px',
                  backgroundColor: '#f7f5f0',
                  borderBottom: '1px solid #eee'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Raw Material</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grams / kg</span>
                <span />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recipe.map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 160px 40px',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: idx < recipe.length - 1 ? '1px solid #eee' : 'none'
                  }}
                >
                  <select
                    value={line.rawMaterial}
                    onChange={e => handleRecipeField(idx, 'rawMaterial', e.target.value)}
                    style={inputStyle}
                  >
                    {rawMaterials.map(rm => (
                      <option key={rm._id} value={rm._id}>{rm.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 300"
                    value={line.gramsPerKg}
                    onChange={e => handleRecipeField(idx, 'gramsPerKg', e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => removeRecipeLine(idx)}
                    className="btn"
                    style={{ padding: '8px', lineHeight: 1 }}
                    aria-label="Remove ingredient"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={addRecipeLine} className="btn" style={{ marginBottom: '32px' }}>
            + Add Ingredient
          </button>
        </>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.push('/products')} className="btn" disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
}
