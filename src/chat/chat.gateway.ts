import {
  OnGatewayInit,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { Session } from 'src/entities/session.entity';
import { Message } from 'src/entities/message.entity';
import { UnauthorizedException } from '@nestjs/common';
import { ISocketConnection } from 'src/types';

@WebSocketGateway(81)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}
  @WebSocketServer()
  server: Server;

  afterInit() {
    this.server.use(async (socket: ISocketConnection, next) => {
      let sessionId = socket.handshake.auth.sessionId;
      if (sessionId) {
        const session = await this.sessionModel.findById(sessionId);
        if (session) {
          socket.sessionId = sessionId;
          socket.userId = session.userId;
          socket.username = session.username;
          return next();
        }
      }
      const username = socket.username;
      const userId = socket.userId;

      if (!username || !userId) {
        throw new UnauthorizedException('Invalid user data!');
      }

      sessionId = this.generateSessionId(userId);
      socket.sessionId = sessionId;

      this.sessionModel.create({
        sessionId,
        userId,
        username,
        connected: true,
      });

      next();
    });
  }

  handleConnection(@ConnectedSocket() socket: ISocketConnection) {
    const session = {
      sessionId: socket.sessionId,
      userId: socket.userId,
      username: socket.username,
    };

    socket.emit('session', session);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() payload,
    @ConnectedSocket() socket: ISocketConnection,
  ) {
    const message = {
      text: payload.text,
      from: socket.userId,
      to: payload.to,
      room: payload.room,
    };

    this.messageModel.create(message);
    socket.to(payload.to).to(socket.userId).emit('message', {
      text: payload.text,
      from: socket.userId,
      to: payload.to,
      room: payload.room,
    });
  }

  handleDisconnect(socket: ISocketConnection) {
    this.sessionModel.findOneAndUpdate(
      { userId: socket.userId },
      { connected: false },
    );
  }

  private generateSessionId(userId: string): string {
    // да, не супер безопасно, но, в данном случае, не хочется заморачиваться с хэшированием, как и делать мидлвар проверки авторизации в сокетах
    return Buffer.from(`${userId}_${Date.now().toString()}`).toString('base64');
  }
}
