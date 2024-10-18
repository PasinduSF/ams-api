/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Admin } from './admin.schema';
import { Employee } from './emp.schema';

@Schema({
  timestamps: true,
})
export class Organization extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  regNumber: string;

  // @Prop({ type: Boolean, default: false })
  // onBlockChain: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Admin' }] })
  admins: Admin[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Employee' }] })
  employees: Employee[];
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
