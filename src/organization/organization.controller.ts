/* eslint-disable prettier/prettier */
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from 'src/schema/org.schema';
import { Admin } from 'src/schema/admin.schema';
import { Employee } from 'src/schema/emp.schema';

@Controller('api/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async createOrganization(
    @Body() organizationData: Partial<Organization>,
  ): Promise<Organization> {
    try {
      return await this.organizationService.createOrganization(
        organizationData,
      );
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  // New Delete Endpoint
  @Delete('/:organizationId')
  async deleteOrganization(
    @Param('organizationId') organizationId: string,
  ): Promise<void> {
    try {
      await this.organizationService.deleteOrganizationById(organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }

  @Get()
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      return await this.organizationService.getAllOrganizations();
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  @Get('/admins/:organizationId')
  async getAdminsByOrganization(
    @Param('organizationId') organizationId: string,
  ): Promise<Admin[]> {
    try {
      return await this.organizationService.getAdminsByOrganization(
        organizationId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }

  @Get('/employees/:organizationId')
  async getEmployeeByOrganization(
    @Param('organizationId') organizationId: string,
  ): Promise<Employee[]> {
    try {
      return await this.organizationService.getEmployeeByOrganization(
        organizationId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }
}
