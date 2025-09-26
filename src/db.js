
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


prisma
  .$connect()
  .then(() => {
    console.log("✅ DIVONICA!");
  })
  .catch((error) => {
    console.error("❌ We fucked up:", error.message);
  });


export default prisma;
