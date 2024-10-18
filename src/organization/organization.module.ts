/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Admin, AdminSchema } from 'src/schema/admin.schema';
import { Employee, EmployeeSchema } from 'src/schema/emp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from 'src/schema/org.schema';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  providers: [OrganizationService],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
