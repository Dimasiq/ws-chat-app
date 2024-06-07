import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({
    required: true,
  })
  username: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: false,
  })
  pic: Buffer;
}

export const UserSchema = SchemaFactory.createForClass(User);
