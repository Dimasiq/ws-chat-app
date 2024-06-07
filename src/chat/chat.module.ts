import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Session, SessionSchema } from 'src/entities/session.entity';
import { Message, MessageSchema } from 'src/entities/message.entity';
import { User, UserSchema } from 'src/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
