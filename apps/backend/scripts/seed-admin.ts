import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/entities/user.entity';
import { Department } from '../src/departments/entities/department.entity';

async function run() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'ai_recruiter',
    entities: [User, Department],
    synchronize: false,
  });

  await ds.initialize();
  const depRepo = ds.getRepository(Department);
  const userRepo = ds.getRepository(User);

  let dept = await depRepo.findOne({ where: { name: 'Engineering' } });
  if (!dept) {
    dept = depRepo.create({
      name: 'Engineering',
      description: 'Default department',
    });
    await depRepo.save(dept);
    console.log('Created department:', dept.name);
  }

  const adminEmail = process.env.INIT_ADMIN_EMAIL || 'admin@company.local';
  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin user already exists:', adminEmail);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(
    process.env.INIT_ADMIN_PASSWORD || 'adminpass',
    10,
  );
  const admin = userRepo.create({
    email: adminEmail,
    password: hashed,
    firstName: 'Platform',
    lastName: 'Admin',
    role: 'admin',
    departmentId: dept.id,
  } as any);
  await userRepo.save(admin);
  console.log('Created admin user:', adminEmail);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
