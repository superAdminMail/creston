import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE "promotion_campaign"
    SET "promotionType" = 'ANNOUNCEMENT'
    WHERE "promotionType" IS NULL
  `;

  console.log(`Updated ${result} campaigns.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
