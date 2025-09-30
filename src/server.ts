import app from "./app";
import connectDB from "./config/database";

// Handle database connection
let isConnected = false;

async function initializeServer() {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }
  return app;
}

// Export the handler for Vercel
module.exports = async (req: any, res: any) => {
  try {
    const server = await initializeServer();
    return server(req, res);
  } catch (err) {
    console.error("Server initialization error:", err);
    const error = err as Error;
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
