import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';

@Schema()
export class Session {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  userId: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
  })
  sessionId: ObjectId;

  @Prop({
    required: true,
  })
  username: string;

  @Prop({
    default: true,
  })
  connected: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
