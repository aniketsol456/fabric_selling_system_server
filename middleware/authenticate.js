const keysecret = "aniketsolankipareshbhaianiketsol";
const userdb = require("../models/userSchema");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.usercookie;

        if (!token) {
            throw new Error("No token provided");
        }

        const verifytoken = jwt.verify(token, keysecret);
        const rootUser = await userdb.findOne({ _id: verifytoken._id });

        if (!rootUser) {
            throw new Error("User Not Found");
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;
        next();
    } catch (error) {
        res.status(401).json({ status: 401, message: "Unauthorized: No token provided or invalid token" });
    }
};


module.exports = authenticate