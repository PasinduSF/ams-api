import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schema/admin.schema';
import { Employee } from 'src/schema/emp.schema';
import { Organization } from 'src/schema/org.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    @InjectModel(Admin.name)
    private adminModel: Model<Admin>,
    @InjectModel(Employee.name)
    private employeeModel: Model<Employee>,
  ) {}

  async createOrganization(
    organizationData: Partial<Organization>,
  ): Promise<Organization> {
    const existingOrganization = await this.organizationModel.findOne({
      title: organizationData.title,
    });
    if (existingOrganization) {
      throw new ConflictException('Organization with this name already exists');
    }

    const newOrganization = new this.organizationModel(organizationData);
    return newOrganization.save();
  }

  async deleteOrganizationById(organizationId: string): Promise<void> {
    const deletedOrganization =
      await this.organizationModel.findByIdAndDelete(organizationId);
    if (!deletedOrganization) {
      throw new NotFoundException('Organization not found');
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return this.organizationModel.find().exec();
  }

  async getAdminsByOrganization(organizationId: string): Promise<Admin[]> {
    const organization = await this.organizationModel.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return this.adminModel.find({ organization: organizationId }).exec();
  }

  async getEmployeeByOrganization(organizationId: string): Promise<Employee[]> {
    const organization = await this.organizationModel.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return this.employeeModel.find({ organization: organizationId }).exec();
  }
}
