import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private readonly client?: Groq;
  readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    this.model = this.config.get<string>(
      'GROQ_MODEL',
      'llama-3.3-70b-versatile',
    );
    if (apiKey) {
      this.client = new Groq({ apiKey });
    }
  }

  get isEnabled(): boolean {
    return Boolean(this.client);
  }

  async jsonCompletion<T>(system: string, user: string): Promise<T> {
    if (!this.client) {
      throw new Error('GROQ_API_KEY is missing');
    }
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }
    return JSON.parse(content) as T;
  }
}
