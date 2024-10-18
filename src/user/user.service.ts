/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Admin } from 'src/schema/admin.schema';
import { Employee } from 'src/schema/emp.schema';
import { Organization } from 'src/schema/org.schema';
import { PO } from 'src/schema/po.schema';

interface AdminDetails {
  name: string;
  email: string;
  walletAddress: string;
  contactNumber: string;
  id: object;
  adminId: string;
}

interface EmpDetails {
  empId: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(PO.name)
    private poModel: Model<PO>,
    @InjectModel(Admin.name)
    private adminModel: Model<Admin>,
    @InjectModel(Employee.name)
    private employeeModel: Model<Employee>,
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  async addPO(poData: Partial<PO>): Promise<PO> {
    const existingOrganization = await this.poModel.findOne({
      walletAddress: poData.walletAddress,
    });
    if (existingOrganization) {
      throw new ConflictException('PO with this wallet address already exists');
    }
    const newPoData = new this.poModel(poData);
    return newPoData.save();
  }

  async createAdmin(
    adminData: Partial<Admin>,
    organizationId: string,
  ): Promise<Admin> {
    const organization = await this.organizationModel.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const alreadyAdmin = await this.adminModel.findOne({
      email: adminData.email,
    });

    const exsistsWalletAddressAdmin = await this.adminModel.findOne({
      walletAddress: adminData.walletAddress,
    });

    if (alreadyAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    if (exsistsWalletAddressAdmin) {
      throw new ConflictException(
        'Admin with this Wallet Address already exists',
      );
    }

    const newAdmin = new this.adminModel({
      ...adminData,
      organization: organizationId,
    });
    const savedAdmin = await newAdmin.save();

    // Update the organization with the new admin
    await this.organizationModel.findByIdAndUpdate(organizationId, {
      $push: { admins: savedAdmin._id },
    });

    return savedAdmin;
  }

  async deleteAdminById(adminId: string): Promise<void> {
    // Find the admin by ID
    const admin = await this.adminModel.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    // Convert adminId to ObjectId
    const objectIdAdmin = new Types.ObjectId(adminId);
    // Remove the reference of the admin from the organization
    await this.organizationModel.findByIdAndUpdate(admin.organization, {
      $pull: { admins: objectIdAdmin },
    });

    // Delete the admin
    await this.adminModel.findByIdAndDelete(adminId);
  }

  async addEmployee(
    employeeData: Partial<Employee>,
    organizationId: string,
  ): Promise<Employee> {
    const organization = await this.organizationModel.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const alreadyEmployee = await this.employeeModel.findOne({
      email: employeeData.email,
    });

    if (alreadyEmployee) {
      throw new ConflictException('Employee with this email already exists');
    }

    const newEmployee = new this.employeeModel({
      ...employeeData,
      organization: organizationId,
    });

    const savedEmployee = await newEmployee.save();

    // Update the organization with the new admin
    await this.organizationModel.findByIdAndUpdate(organizationId, {
      $push: { employees: savedEmployee._id },
    });

    return savedEmployee;
  }

  async deleteEmployeeById(empId: string): Promise<void> {
    // Find the employee by ID
    const employee = await this.employeeModel.findById(empId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    // Convert adminId to ObjectId
    const objectIdEmp = new Types.ObjectId(empId);
    // Remove the reference of the admin from the organization
    await this.organizationModel.findByIdAndUpdate(employee.organization, {
      $pull: { employees: objectIdEmp },
    });

    // Delete the admin
    await this.employeeModel.findByIdAndDelete(empId);
  }

  async markAttendance(
    employeeId: string,
    status: 'on time' | 'late',
  ): Promise<Employee> {
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance has already been marked today
    const attendanceToday = employee.attendance?.find(
      (att) => new Date(att.date).getTime() === today.getTime(),
    );

    if (attendanceToday) {
      throw new ConflictException('Attendance already marked for today');
    }

    // Mark attendance with current date, time, and status (on time or late)
    const currentTime = new Date();
    const newAttendanceRecord = {
      date: today, // Only date without time for comparison
      time: currentTime.toLocaleTimeString('en-US', { hour12: false }),
      status, // Status: 'on time' or 'late'
    };

    // Add new attendance record to the array
    employee.attendance = employee.attendance || []; // Ensure the array is initialized
    employee.attendance.push(newAttendanceRecord);

    return employee.save();
  }

  async getAttendance(employeeId: string): Promise<
    {
      date: Date;
      time: String;
      status: 'on time' | 'late';
      lastAttendance?: { date: Date; time: String };
    }[]
  > {
    const employee = await this.employeeModel
      .findById(employeeId)
      .select('attendance');

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const attendance = employee.attendance;

    if (attendance.length === 0) {
      return [];
    }

    const lastAttendance = attendance[attendance.length - 1];

    return attendance.map((record) => ({
      date: record.date,
      time: record.time,
      status: record.status,
      lastAttendance: { date: lastAttendance.date, time: lastAttendance.time },
    }));
  }

  // Method to find the PO address in the database
  async findPOAddress(poData: Partial<PO>): Promise<string> {
    const poUser = await this.poModel.findOne({
      walletAddress: poData.walletAddress,
    });
    return poUser.walletAddress;
  }

  // Method to find the Admin address in the database
  async findAdminAddress(adminData: Partial<Admin>): Promise<string> {
    const adminUser = await this.adminModel.findOne({
      walletAddress: adminData.walletAddress,
    });
    return adminUser.walletAddress;
  }

  // Method to find the employee address in the database
  async findEmpAddress(empData: Partial<Employee>): Promise<string> {
    const empUser = await this.employeeModel.findOne({
      walletAddress: empData.walletAddress,
    });
    return empUser.walletAddress;
  }

  // Get admin details with organization information
  async getAdminDetails(walletAddress: string): Promise<AdminDetails> {
    console.log(`Searching for admin with wallet address: ${walletAddress}`);
    const admin = await this.adminModel.findOne({
      walletAddress: walletAddress,
    });
    console.log(`Admin found:`, admin);
    if (!admin) {
      throw new NotFoundException(
        `Admin with wallet address ${walletAddress} not found`,
      );
    }
    // Map the admin data to AdminDetails interface
    const adminDetails: AdminDetails = {
      name: admin.name,
      email: admin.email,
      walletAddress: admin.walletAddress,
      contactNumber: admin.contactNumber,
      id: admin.organization,
      adminId: admin._id.toString(),
    };

    return adminDetails;
  }

  // Get Employee information
  async getEmpDetails(walletAddress: string): Promise<EmpDetails> {
    const employee = await this.employeeModel.findOne({
      walletAddress: walletAddress,
    });
    if (!employee) {
      throw new NotFoundException(
        `Admin with wallet address ${walletAddress} not found`,
      );
    }
    // Map the admin data to AdminDetails interface
    const empDetails: EmpDetails = {
      empId: employee._id.toString(),
    };

    return empDetails;
  }
}
