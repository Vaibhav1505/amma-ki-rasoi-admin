import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // 'id' from old data.js
    name: { type: String, required: true },
    subtitle: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: String, required: true }, // e.g. '500g'
    image: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    category: { type: String, required: true }, // e.g., 'Pickles', 'Badi'
    badge: { type: String } // e.g. 'Bestseller'
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
