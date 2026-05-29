import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema);
export default Product;
