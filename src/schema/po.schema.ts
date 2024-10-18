/* eslint-disable prettier/prettier */
// admin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class PO extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  walletAddress: string;
}

export const POSchema = SchemaFactory.createForClass(PO);
