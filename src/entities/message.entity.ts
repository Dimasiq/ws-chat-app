import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, ObjectId, Types } from 'mongoose';

@Schema()
export class Message {
  @Prop({
    required: true,
  })
  text: string;

  @Prop({
    required: true,
  })
  room: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  from: ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  to: ObjectId;

  @Prop({
    type: Date,
    required: false,
    default: Date.now(),
  })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
