import { Server } from "http";
import app from "./app";
import { config } from "./app/config";
import { seedQuestions } from "./app/utils/seed";
import { prisma } from "./app/utils/prisma";

let server: Server;

const port = config.port;

const main = () => {
  server = app.listen(port, () => {
    console.log(`Harmony 360 server running on port http://localhost:${port}`);
  });

  seedQuestions()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
    exitHandler();
  });
};

main();
