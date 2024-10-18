/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Param,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Organization } from './schema/org.schema';
import { Admin } from './schema/admin.schema';
import { Employee } from './schema/emp.schema';

@Controller('api/')
export class AppController {
  constructor(private readonly appService: AppService) {}
}
