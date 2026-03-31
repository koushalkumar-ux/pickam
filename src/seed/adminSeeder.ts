import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../modules/admin/v1/auth/service/admin.service';
import { Role } from '../modules/admin/v1/auth/enum/role.enum';

const seed = async () => {
  try {
    // Create application context to ensure all Mongoose hooks and providers are loaded
    const app = await NestFactory.createApplicationContext(AppModule);
    const adminService = app.get(AdminService);

    await adminService.createAdmin({
      email: 'adminpickam@yopmail.com',
      password: 'Admin@123',
      role: Role.SUPER_ADMIN,
    });

    console.log('🎉 Admin seeded successfully');
    await app.close();
  } catch (err: any) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
};

seed();