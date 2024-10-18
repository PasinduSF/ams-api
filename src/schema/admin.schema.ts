/* eslint-disable prettier/prettier */
// admin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Organization } from './org.schema';

@Schema({
  timestamps: true,
})
export class Admin extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Organization;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
