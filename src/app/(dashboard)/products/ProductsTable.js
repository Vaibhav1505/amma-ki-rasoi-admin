'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatKg } from '../../../lib/weight';
import { LOW_STOCK_THRESHOLD_GRAMS } from '../../../lib/stockThreshold';

// Fixed display order for category groups — mirrors the Category dropdown
// in ProductForm (Pickles first, since it's the flagship line), rather than
// alphabetical. Any category not in this list (shouldn't happen, but data
// can drift) is appended at the end so nothing silently disappears.
const CATEGORY_ORDER = ['Pickles', 'Badi', 'Sweets', 'Namkeen', 'Honey'];

function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export default function ProductsTable({ products }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const allCategories = useMemo(
    () => sortCategories([...new Set(products.map(p => p.category))]),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.subtitle || '').toLowerCase().includes(q);
      const matchesCategory = category === 'All' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const grouped = useMemo(() => {
    const byCategory = {};
    filtered.forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p);
    });
    return sortCategories(Object.keys(byCategory)).map(cat => ({ category: cat, items: byCategory[cat] }));
  }, [filtered]);

  const inputStyle = { padding: '9px 14px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontSize: '0.875rem' };

  return (
    <>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 240px', minWidth: '200px' }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="btn"
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="All">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Prices</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                  <div className="text-muted">
                    {products.length === 0 ? 'No products found in the database.' : 'No products match your search/filter.'}
                  </div>
                </td>
              </tr>
            ) : (
              grouped.map(group => (
                <FragmentGroup key={group.category} category={group.category} items={group.items} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FragmentGroup({ category, items }) {
  return (
    <>
      <tr>
        <td colSpan="7" style={{ backgroundColor: '#f7f5f0', fontWeight: '700', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '8px 12px' }}>
          {category} <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 'normal' }}>({items.length})</span>
        </td>
      </tr>
      {items.map(product => {
        const variants = product.variants || [];
        const stockGrams = product.stockGrams ?? 0;
        const priceLabel = variants.length === 0
          ? '—'
          : variants.map(v => `₹${v.price}/${v.weight}`).join(', ');
        return (
          <tr key={product._id}>
            <td>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                <span style={{ fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>IMG</span>
              </div>
            </td>
            <td>
              <div style={{ fontWeight: '600' }}>{product.name}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{product.subtitle}</div>
            </td>
            <td>{product.category}</td>
            <td className="data-font" style={{ fontSize: '0.8rem' }}>{priceLabel}</td>
            <td className="data-font">
              {formatKg(stockGrams)} kg
            </td>
            <td>
              {stockGrams > LOW_STOCK_THRESHOLD_GRAMS ? (
                <span className="badge badge-delivered">In Stock</span>
              ) : stockGrams > 0 ? (
                <span className="badge badge-pending">Low Stock</span>
              ) : (
                <span className="badge badge-shipped" style={{ backgroundColor: '#FEE2E2', color: 'var(--danger-red)' }}>Out of Stock</span>
              )}
            </td>
            <td>
              <Link href={`/products/${product._id}/edit`} className="btn" style={{ marginRight: '8px' }}>Edit</Link>
            </td>
          </tr>
        );
      })}
    </>
  );
}
