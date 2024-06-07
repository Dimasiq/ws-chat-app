import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { User, UserSchema } from './entities/user.entity';
import { Message, MessageSchema } from './entities/message.entity';
import { Session, SessionSchema } from './entities/session.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ChatModule,
    MongooseModule.forRoot(process.env.MONGO_URL),
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatService],
})
export class AppModule {}
