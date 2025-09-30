import app from "./app";
import connectDB from "./config/database";

// Connect to MongoDB
connectDB();

// Export the Express app for Vercel
export default app;
