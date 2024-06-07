import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../entities/session.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}
}
