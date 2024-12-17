const express = require("express");
const userdb = require("../models/userSchema");
const fabricdb = require("../models/fabricSchema"); 
const router = new express.Router();
var bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const Cart = require("../models/cartSchema");
const Order = require("../models/orderSchema");
const jwt = require("jsonwebtoken");
const keysecret = "aniketsolankipareshbhaianiketsol";
//for user registration

router.post("/register", async (req, res) => {
    const { fname, email, password, cpassword } = req.body;

    if (!fname || !email || !password || !cpassword) {
        return res.status(422).json({ error: "Fill all the details" });
    }

    try {
        const preuser = await userdb.findOne({ email: email });

        if (preuser) {
            return res.status(422).json({ error: "This email is Already Exist" });
        } else if (password !== cpassword) {
            return res.status(422).json({ error: "Password and Confirm Password Not Match" });
        } else {
            const finalUser = new userdb({ fname, email, password, cpassword });
            const storeData = await finalUser.save();

            const token = jwt.sign({ _id: storeData._id }, keysecret, { expiresIn: "7d" });

            const result = {
                storeData,
                token,
            };

            res.status(201).json({ status: 201, result });
        }
    } catch (error) {
        console.log("Catch Block Error", error);
        res.status(422).json({ error: "Something went wrong" });
    }
});


//User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "Fill all the details" });
    }

    try {
        const userValid = await userdb.findOne({ email: email });

        if (userValid) {
            const isMatch = await bcrypt.compare(password, userValid.password);

            if (!isMatch) {
                return res.status(422).json({ error: "Invalid details" });
            } else {
                const token = await userValid.generateAuthtoken();

                const result = {
                    userValid: { id: userValid._id, email: userValid.email },
                    token,
                };
                return res.status(201).json({ status: 201, result });
            }
        } else {
            return res.status(422).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(401).json(error);
        console.log("Catch Block Error", error);
    }
});

router.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "Please fill in all details" });
    }

    try {
        if(email === 'aniket63560@gmail.com' && password === 'aniket123'){
    
            res.status(201).json({ status: 201 });
        }
        else{
            return res.status(422).json({ error: "Admin not found" });
        }

        
    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



router.post("/logout", authenticate, async (req, res) => {
    try {
        // Clearing the cookie to log out the user
        res.clearCookie("usercookie", { path: "/" });

        res.status(200).json({ status: 200, message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error", error });
    }
});

//user valid
router.get("/validuser", authenticate, async (req, res) => {
    // console.log("done");
    try {
        const ValidUserOne = await userdb.findOne({ _id: req.userId });
        res.status(201).json({ status: 201, ValidUserOne });
    } catch (error) {
        res.status(401).json({ status: 401, error });
    }
});

// Fetch all users
router.get("/user/all", async (req, res) => {
    try {
        const users = await userdb.find();
        res.status(200).json({ status: 200, users });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users", details: error });
    }
});

// Fetch a particular user by ID
router.get("/user/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userdb.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ status: 200, user });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user", details: error });
    }
});

// Delete a particular user by ID
router.delete("/user/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userdb.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ status: 200, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user", details: error });
    }
});

// Delete all users
router.delete("/user/deleteAll", async (req, res) => {
    try {
        await userdb.deleteMany();
        res.status(200).json({ status: 200, message: "All users deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete users", details: error });
    }
});


// Fabric apis 
router.post("/fabric/create", async (req, res) => {
    const { name, color, type, weight, fabricContent, width, design, price, discount } = req.body;

    if (!name || !color || !type || !weight || !fabricContent || !width || !design || !price) {
        return res.status(422).json({ error: "Please fill in all the details" });
    }

    try {
        const newFabric = new fabricdb({
            name,
            color,
            type,
            weight,
            fabricContent,
            width,
            design,
            price,
            discount
        });

        const storedFabric = await newFabric.save();
        res.status(201).json({ status: 201, storedFabric });
    } catch (error) {
        res.status(500).json({ error: "Failed to create fabric", details: error });
    }
});

// Fetch all fabrics
router.get("/fabric/all", async (req, res) => {
    try {
        const fabrics = await fabricdb.find();
        res.status(200).json({ status: 200, fabrics });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch fabrics", details: error });
    }
});

// Fetch unique color options
router.get("/fabric/colors", async (req, res) => {
  try {
    const colors = await fabricdb.distinct('color');
    res.status(200).json({ status: 200, colors });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch colors", details: error });
  }
});

// Fetch unique type options
router.get("/fabric/types", async (req, res) => {
  try {
    const types = await fabricdb.distinct('type');
    res.status(200).json({ status: 200, types });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch types", details: error });
  }
});

// Fetch unique weight options
router.get("/fabric/weights", async (req, res) => {
  try {
    const weights = await fabricdb.distinct('weight');
    res.status(200).json({ status: 200, weights });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weights", details: error });
  }
});

// Fetch unique fabric content options
router.get("/fabric/contents", async (req, res) => {
  try {
    const contents = await fabricdb.distinct('fabricContent');
    res.status(200).json({ status: 200, contents });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fabric contents", details: error });
  }
});

// Fetch unique width options
router.get("/fabric/widths", async (req, res) => {
  try {
    const widths = await fabricdb.distinct('width');
    res.status(200).json({ status: 200, widths });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch widths", details: error });
  }
});

// Fetch unique design options
router.get("/fabric/designs", async (req, res) => {
  try {
    const designs = await fabricdb.distinct('design');
    res.status(200).json({ status: 200, designs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch designs", details: error });
  }
});

// Fetch a particular fabric by ID
router.get("fabric/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const fabric = await fabricdb.findById(id);
        if (!fabric) {
            return res.status(404).json({ error: "Fabric not found" });
        }
        res.status(200).json({ status: 200, fabric });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch fabric", details: error });
    }
});

// Delete all fabrics
router.delete("/fabric/deleteAll", async (req, res) => {
    try {
        await fabricdb.deleteMany();
        res.status(200).json({ status: 200, message: "All fabrics deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete fabrics", details: error });
    }
});

// Delete a particular fabric by ID
router.delete("/fabric/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const fabric = await fabricdb.findByIdAndDelete(id);
        if (!fabric) {
            return res.status(404).json({ error: "Fabric not found" });
        }
        res.status(200).json({ status: 200, message: "Fabric deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete fabric", details: error });
    }
});

// Update a particular fabric by ID
router.patch("/fabric/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, color, type, weight, fabricContent, width, design, price, discount } = req.body;

    try {
        const updatedFabric = await fabricdb.findByIdAndUpdate(id, {
            name,
            color,
            type,
            weight,
            fabricContent,
            width,
            design,
            price,
            discount
        }, { new: true });

        if (!updatedFabric) {
            return res.status(404).json({ error: "Fabric not found" });
        }
        res.status(200).json({ status: 200, updatedFabric });
    } catch (error) {
        res.status(500).json({ error: "Failed to update fabric", details: error });
    }
});

// Add or update an item in the cart
router.post("/cart/add", async (req, res) => {
    const { userId, fabricId, quantity, price, discount } = req.body;

    if (!userId || !fabricId || !quantity || !price) {
        return res.status(422).json({ error: "Please provide all required fields" });
    }

    try {
        const cart = await Cart.findOne({ userId });

        const finalPrice = price - (price * (discount || 0)) / 100;

        if (cart) {
            // Check if the fabric already exists in the cart
            const itemIndex = cart.items.findIndex(item => item.fabricId.toString() === fabricId);
            if (itemIndex > -1) {
                // Update quantity if it exists
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].finalPrice = cart.items[itemIndex].quantity * finalPrice;
            } else {
                // Add new item to cart
                cart.items.push({ fabricId, quantity, price, discount, finalPrice });
            }
            await cart.save();
            res.status(200).json({ status: 200, cart });
        } else {
            // Create a new cart
            const newCart = new Cart({
                userId,
                items: [{ fabricId, quantity, price, discount, finalPrice }]
            });
            const savedCart = await newCart.save();
            res.status(201).json({ status: 201, cart: savedCart });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to add item to cart", details: error });
    }
});

// Get cart details for a user
router.get("/cart/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ userId }).populate("items.fabricId"); 
        if (!cart) {
            return res.status(404).json({ error: "Cart not found for the user" });
        }
        res.status(200).json({ status: 200, cart });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cart", details: error });
    }
});

// Update the quantity of an item in the cart
router.patch("/cart/update/:userId/:fabricId", async (req, res) => {
    const { userId, fabricId } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found for the user" });
        }

        const itemIndex = cart.items.findIndex(item => item.fabricId.toString() === fabricId);

        if (itemIndex > -1) {
            // Update the quantity
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].finalPrice = quantity * cart.items[itemIndex].price;
            await cart.save();
            res.status(200).json({ status: 200, cart });
        } else {
            res.status(404).json({ error: "Item not found in the cart" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update cart", details: error });
    }
});

// Remove an item from the cart
router.delete("/cart/remove/:userId/:fabricId", async (req, res) => {
    const { userId, fabricId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found for the user" });
        }

        cart.items = cart.items.filter(item => item.fabricId.toString() !== fabricId);

        await cart.save();
        res.status(200).json({ status: 200, cart });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove item from cart", details: error });
    }
});

// Clear the entire cart
router.delete("/cart/clear/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOneAndDelete({ userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found for the user" });
        }
        res.status(200).json({ status: 200, message: "Cart cleared successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to clear cart", details: error });
    }
});


// Create a new order
router.post("/order/create", async (req, res) => {
    const { userId, items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!userId || !items || !shippingAddress || !paymentMethod || !totalAmount) {
        return res.status(422).json({ error: "Please provide all required fields" });
    }

    try {
        const newOrder = new Order({
            userId,
            items,
            shippingAddress,
            paymentMethod,
            totalAmount,
            status: "Pending" 
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ status: 201, order: savedOrder });
    } catch (error) {
        console.error('Error saving order:', error);  // Log the error details
        res.status(500).json({ error: "Failed to create order", details: error });
    }
});


// Fetch all orders
router.get("/order/all", async (req, res) => {
    try {
        const orders = await Order.find().populate("items.fabricId"); // Populates fabric details
        res.status(200).json({ status: 200, orders });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders", details: error });
    }
});

// Fetch orders for a specific user
router.get("/order/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ userId }).populate("items.fabricId");
        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: "No orders found for the user" });
        }
        res.status(200).json({ status: 200, orders });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user orders", details: error });
    }
});

// Fetch a single order by ID
router.get("/order/:orderId", async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId).populate("items.fabricId");
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ status: 200, order });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order", details: error });
    }
});

// Update order status
router.patch("/order/update-status/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(422).json({ error: "Please provide a valid status" });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ status: 200, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: "Failed to update order status", details: error });
    }
});

// Delete an order by ID
router.delete("/order/delete/:orderId", async (req, res) => {
    const { orderId } = req.params;

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ status: 200, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order", details: error });
    }
});

// Delete all orders (admin functionality)
router.delete("/order/deleteAll", async (req, res) => {
    try {
        await Order.deleteMany();
        res.status(200).json({ status: 200, message: "All orders deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete orders", details: error });
    }
});

module.exports = router;