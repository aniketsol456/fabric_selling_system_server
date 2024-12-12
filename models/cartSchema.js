const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", 
        required: true
    },
    items: [
        {
            fabricId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "fabrics", 
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            discount: {
                type: Number,
                default: 0
            },
            finalPrice: {
                type: Number, // price after applying discount
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to update timestamps
cartSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
