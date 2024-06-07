import { Controller } from '@nestjs/common';
import { ChatService } from './chat/chat.service';

@Controller()
export class AppController {
  constructor(private readonly chatService: ChatService) {}
}
