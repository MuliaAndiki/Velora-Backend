import app from "./app";
import { connectWithRetry } from "./config/databases";
import prisma from "prisma/client";

connectWithRetry()
  .then(() => {
    const port = process.env.PORT ? Number(process.env.PORT) : 5000;
    const server = app.listen(port);
    console.log(`🦊 Elysia running at http://localhost:${port}`);

    const shutdown = async () => {
      console.log("🧹 Shutting down server...");
      await prisma.$disconnect();
      server.stop?.();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((err) => {
    console.error("❌ Could not connect to database after retries:", err);
  });
