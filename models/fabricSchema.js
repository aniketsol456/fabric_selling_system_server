const mongoose = require("mongoose");

const fabricSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    weight: {
        type: String, 
        required: true,
        trim: true
    },
    fabricContent: {
        type: String,
        required: true,
        trim: true
    },
    width: {
        type: String, // Change to Number if needed for numerical width
        required: true,
        trim: true
    },
    design: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    discountAvailable: {
        type: Boolean,
        default: false
    }
});

// Mongoose pre-save hook to automatically update discountAvailable based on discount
fabricSchema.pre("save", function(next) {
    if (this.discount > 0) {
        this.discountAvailable = true;
    } else {
        this.discountAvailable = false;
    }
    next();
});


const fabricdb = new mongoose.model("fabrics", fabricSchema);
module.exports = fabricdb;
