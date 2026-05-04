import { Injectable } from '@nestjs/common';
import { ParserService } from 'src/candidates/parser.service';
import { GroqService } from './groq.service';
import { ParsedCV } from './types';

@Injectable()
export class CvExtractionService {
  constructor(
    private readonly groq: GroqService,
    private readonly parserService: ParserService,
  ) {}

  async extract(rawText: string): Promise<ParsedCV> {
    if (!this.groq.isEnabled) {
      return this.parserService.parseCV(rawText);
    }

    try {
      const data = await this.groq.jsonCompletion<ParsedCV>(
        'Extract structured CV data. Return ONLY valid JSON matching keys: skills, experience, education, certifications.',
        `CV text:\n${rawText}`,
      );

      return {
        skills: Array.isArray(data.skills)
          ? data.skills
              .map((skill: any) => ({
                name: String(skill?.name ?? skill?.skill ?? skill ?? '').trim(),
                level: skill?.level,
              }))
              .filter((skill) => skill.name.length > 0)
          : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        certifications: Array.isArray(data.certifications)
          ? data.certifications
          : [],
      };
    } catch {
      return this.parserService.parseCV(rawText);
    }
  }
}
