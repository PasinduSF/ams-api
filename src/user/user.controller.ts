/* eslint-disable prettier/prettier */
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PO } from 'src/schema/po.schema';
import { Admin } from 'src/schema/admin.schema';
import { Employee } from 'src/schema/emp.schema';

@Controller('/api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('po')
  async addPO(@Body() organizationData: Partial<PO>): Promise<PO> {
    try {
      return await this.userService.addPO(organizationData);
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  @Post('/addAdmin/:orgId')
  async createAdmin(
    @Param('orgId') orgId: string,
    @Body() adminData: Partial<Admin>,
  ): Promise<Admin> {
    try {
      return await this.userService.createAdmin(adminData, orgId);
    } catch (error) {
      if (error.message === 'Organization not found') {
        throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
      }
      throw new ConflictException(error.message);
    }
  }

  @Post('/addEmployee/:orgId')
  async addEmployee(
    @Param('orgId') orgId: string,
    @Body() empData: Partial<Employee>,
  ): Promise<Employee> {
    try {
      return await this.userService.addEmployee(empData, orgId);
    } catch (error) {
      if (error.message === 'Organization not found') {
        throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
      }
      throw new ConflictException(error.message);
    }
  }

  @Post('/employee/mark-attendance/:employeeId')
  async markAttendance(
    @Param('employeeId') employeeId: string,
    @Body('status') status: 'on time' | 'late',
  ): Promise<Employee> {
    try {
      return await this.userService.markAttendance(employeeId, status);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get('employee/attendance/:employeeId')
  async getAttendance(@Param('employeeId') employeeId: string) {
    try {
      return await this.userService.getAttendance(employeeId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Delete('admin/:adminId')
  async deleteAdmin(@Param('adminId') adminId: string): Promise<void> {
    try {
      await this.userService.deleteAdminById(adminId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }

  @Delete('employee/:empId')
  async deleteEmployee(@Param('empId') empId: string): Promise<void> {
    try {
      await this.userService.deleteEmployeeById(empId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }
}
