/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable prettier/prettier */
// employee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Organization } from './org.schema';

@Schema({
  timestamps: true,
})
export class Employee extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  empNo: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop([
    {
      date: { type: Date, required: true },
      time: { type: String, required: true },
      status: { type: String, enum: ['on time', 'late'], required: true },
    },
  ])
  attendance?: Array<{
    date: Date;
    time: String;
    status: 'on time' | 'late';
  }>;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Organization;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
