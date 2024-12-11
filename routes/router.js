const express = require("express");
const userdb = require("../models/userSchema");
const fabricdb = require("../models/fabricSchema"); 
const router = new express.Router();
var bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

//for user registration

router.post("/register", async (req, res) => {

    const { fname, email, password, cpassword } = req.body;

    if (!fname || !email || !password || !cpassword) {
        res.status(422).json({ error: "Fill all the details" })
    }

    try {
        const preuser = await userdb.findOne({ email: email });
        if (preuser) {
            res.status(422).json({ error: "This email is Already Exist" })
        }
        else if (password !== cpassword) {
            res.status(422).json({ error: "Password and Confirm Password Not Match" })
        }
        else {
            const finalUser = new userdb({
                fname, email, password, cpassword
            });
            //here password hashing
            const storeData = await finalUser.save();
            // console.log(storeData);
            res.status(201).json({ status: 201, storeData });
        }
    } catch (error) {
        res.status(422).json({ error });
        console.log("catch block error");

    }
});

//User Login
router.post("/login", async (req, res) => {
    // console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(422).json({ error: "Fill all the details" })
    }
    try {
        const userValid = await userdb.findOne({ email: email });

        if (userValid) {
            const isMatch = await bcrypt.compare(password, userValid.password);

            if (!isMatch) {
                res.status(422).json({ error: "Invalid details" })
            } else {
                //token generate
                const token = await userValid.generateAuthtoken();

                //cookie generatte
                res.cookie("usercookie", token, {
                    expires: new Date(Date.now() + 9000000),
                    httpOnly: true
                });

                const result = {
                    userValid,
                    token
                }
                res.status(201).json({ status: 201, result })
            }
        }
    } catch (error) {
        res.status(401).json(error);
        console.log("Catch Block");
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

// Fabric apis 
router.post("/fabric/create", authenticate, async (req, res) => {
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
router.get("/fabric/all", authenticate, async (req, res) => {
    try {
        const fabrics = await fabricdb.find();
        res.status(200).json({ status: 200, fabrics });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch fabrics", details: error });
    }
});

// Fetch a particular fabric by ID
router.get("fabric/:id", authenticate, async (req, res) => {
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
router.delete("/fabric/deleteAll", authenticate, async (req, res) => {
    try {
        await fabricdb.deleteMany();
        res.status(200).json({ status: 200, message: "All fabrics deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete fabrics", details: error });
    }
});

// Delete a particular fabric by ID
router.delete("/fabric/delete/:id", authenticate, async (req, res) => {
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
router.patch("/fabric/update/:id", authenticate, async (req, res) => {
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

module.exports = router;