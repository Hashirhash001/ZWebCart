import { PrismaClient } from '../generated-central';

const prisma = new PrismaClient();

async function main() {
  // Create an admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@central.com',
      password: '$2b$10$O1uMw4S2CU.tfM5hlSdFneI0jcBz8HhRDlQ2MuWkfxGR2scdn6Efu', // Use bcrypt to hash the password
      role: 'ADMIN',
    },
  });

  console.log('Admin User created:', adminUser);

  // Create a store and link it to the admin user
  const store = await prisma.store.create({
    data: {
      name: 'Test Store',
      dbName: 'test_store_db',
      dbUrl: 'postgresql://postgres:postgres@localhost:5433/zwebcart', // Replace with actual DB URL
      ownerId: adminUser.id,
    },
  });

  console.log('Store created:', store);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
