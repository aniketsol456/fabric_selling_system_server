const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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
                type: Number, 
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number, 
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: String,
        enum: ["Credit Card", "Debit Card", "Net Banking", "UPI", "Cash on Delivery"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


orderSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
