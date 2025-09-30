"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
// Handle database connection
let isConnected = false;
async function initializeServer() {
    if (!isConnected) {
        try {
            await (0, database_1.default)();
            isConnected = true;
            console.log("Database connected successfully");
        }
        catch (error) {
            console.error("Database connection error:", error);
            throw error;
        }
    }
    return app_1.default;
}
// Export the handler for Vercel
module.exports = async (req, res) => {
    try {
        const server = await initializeServer();
        return server(req, res);
    }
    catch (err) {
        console.error("Server initialization error:", err);
        const error = err;
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
