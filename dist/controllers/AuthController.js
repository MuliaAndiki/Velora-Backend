"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("../models/Auth"));
const auth_1 = require("../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = require("../config/multer");
const cloudinary_1 = require("../config/cloudinary");
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email || !auth.fullName || !auth.phone || !auth.password) {
                    res.status(400).json({
                        status: 400,
                        message: "All field is required",
                    });
                    return;
                }
                const isAlreadyRegistered = await Auth_1.default.findOne({
                    email: auth.email,
                });
                if (isAlreadyRegistered) {
                    res.status(400).json({
                        status: 400,
                        message: "This email is already registered, try another email",
                    });
                    return;
                }
                bcryptjs_1.default.hash(auth.password, 10, async (err, hash) => {
                    if (err) {
                        res.status(500).json(err);
                        return;
                    }
                    const newAuth = new Auth_1.default({
                        email: auth.email,
                        fullName: auth.fullName,
                        phone: auth.phone,
                        password: hash,
                    });
                    await newAuth.save();
                    res.status(201).json({
                        status: 200,
                        data: newAuth,
                        message: "account successfully registered",
                    });
                    return;
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                });
                return;
            }
        };
        this.login = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email || !auth.password) {
                    res.status(400).json({
                        status: 400,
                        message: "All field is required",
                    });
                    return;
                }
                const isAuthExist = await Auth_1.default.findOne({
                    email: auth.email,
                });
                if (!isAuthExist) {
                    res.status(404).json({
                        status: 404,
                        message: "Account not found",
                    });
                    return;
                }
                const validateAuth = await bcryptjs_1.default.compare(auth.password, isAuthExist.password);
                if (!validateAuth) {
                    res
                        .status(400)
                        .json({ status: 400, message: "Wrong email or password" });
                    return;
                }
                const payload = {
                    _id: isAuthExist._id,
                    email: isAuthExist.email,
                    fullName: isAuthExist.fullName,
                    phone: isAuthExist.phone,
                };
                if (!process.env.JWT_SECRET) {
                    console.error("JWT_SECRET is not defined in environment variables");
                    res.status(500).json({
                        status: 500,
                        message: "Server configuration error.",
                    });
                    return;
                }
                jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }, async (err, token) => {
                    if (err) {
                        res.status(500).json(err);
                        return;
                    }
                    isAuthExist.set("token", token);
                    await isAuthExist.save();
                    res.status(200).json({
                        status: 200,
                        data: isAuthExist,
                        message: "Login successfully",
                    });
                    return;
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                });
                return;
            }
        };
        this.getProfileByUser = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const { _id } = req.user;
                    const auth = await Auth_1.default.findById(_id);
                    if (!auth) {
                        res.status(400).json({
                            status: 400,
                            message: "Account not found",
                        });
                        return;
                    }
                    res.status(200).json({
                        status: 200,
                        message: "User Profile Found",
                        data: auth,
                    });
                    return;
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                    return;
                }
            },
        ];
        this.logout = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const { _id } = req.user;
                    const auth = await Auth_1.default.findById(_id);
                    if (!auth) {
                        res.status(404).json({
                            status: 404,
                            message: "Account not found",
                        });
                        return;
                    }
                    auth.set("token", null);
                    await auth.save();
                    res.status(200).json({
                        status: 2000,
                        message: "Account logut successfully",
                    });
                    return;
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Internal server error",
                    });
                    return;
                }
            },
        ];
        this.editProfile = [
            auth_1.verifyToken,
            multer_1.uploadImages,
            async (req, res) => {
                try {
                    const auth = req.body;
                    const user = req.user;
                    if (!user?._id) {
                        res.status(401).json({
                            status: 401,
                            message: "Unauthorized",
                        });
                    }
                    const files = req.files;
                    const foto = files?.fotoProfile?.[0];
                    let fotoUrl;
                    if (foto) {
                        const result = await (0, cloudinary_1.uploadCloudinary)(foto.buffer, "fotoProfile", foto.originalname);
                        fotoUrl = result.secure_url;
                    }
                    const updateData = {
                        ...(auth.fullName && { fullName: auth.fullName }),
                        ...(auth.email && { email: auth.email }),
                        ...(fotoUrl && { fotoProfile: fotoUrl }),
                    };
                    if (Object.keys(updateData).length === 0) {
                        res.status(400).json({
                            status: 400,
                            message: "Nothing to update",
                        });
                    }
                    await Auth_1.default.findByIdAndUpdate(user._id, { $set: updateData });
                    res.status(200).json({
                        status: 200,
                        message: "Profile updated successfully",
                        data: updateData,
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                }
            },
        ];
    }
}
exports.default = new AuthController();
