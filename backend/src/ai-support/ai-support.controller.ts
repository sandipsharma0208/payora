import { Controller, Post, Body, Sse, Query } from '@nestjs/common';
import { AiSupportService } from './ai-support.service';
import { Observable } from 'rxjs';

@Controller('ai-support')
export class AiSupportController {
  constructor(private aiService: AiSupportService) {}

  @Post('chat')
  async chat(@Body('message') message: string) {
    const response = this.aiService.generateResponse(message || '');
    return { response };
  }

  @Sse('stream')
  stream(@Query('message') message: string): Observable<MessageEvent> {
    return this.aiService.streamResponse(message || '');
  }
}
