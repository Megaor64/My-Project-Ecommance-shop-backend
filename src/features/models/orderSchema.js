import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema(
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
  );
  
  const shippingAddressSchema = new mongoose.Schema(
    {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      zip: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    { _id: false }
  );

  const paymentMethodSchema = new mongoose.Schema(
    {
      cardholderName: { type: String, required: true, trim: true },
      cardLast4: { type: String, required: true, minlength: 4, maxlength: 4 },
      expiration: { type: String, required: true, trim: true },
    },
    { _id: false }
  );
  
  const orderSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      items: { type: [orderItemSchema], required: true },
      shippingAddress: { type: shippingAddressSchema, required: true },
      paymentMethod: { type: paymentMethodSchema, required: true },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
      },
      orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing',
      },
      totalAmount: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
  );
  
  const Order = mongoose.model('Order', orderSchema);
  export default Order