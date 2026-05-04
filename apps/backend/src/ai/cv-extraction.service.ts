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
        `Extract structured CV data. Return ONLY valid JSON with these exact keys:
  - skills: array of {name: string, level: "junior"|"mid"|"senior"} — infer level from years of experience, project complexity, leadership, or explicit mentions in the CV
  - experience: array of {company: string, role: string, duration: string, technologies: string[]}
  - education: array of {school: string, degree: string, field: string, year: string}
  - certifications: array of {name: string, issuer: string, date: string}

For skill level inference rules:
  - junior: mentioned briefly, basic usage, learning context, or implied <2 years with that technology
  - mid: used across multiple projects or roles, typical professional depth, roughly 2–4 years implied
  - senior: led or architected work with it, mentoring, 4+ years implied, "expert"/"advanced", or staff/principal titles tied to that stack

If unsure, prefer "mid". Every skill object MUST include a valid level string: "junior", "mid", or "senior".`,
        `CV text:\n${rawText}`,
      );

      const allowed = new Set(['junior', 'mid', 'senior']);
      const coerceLevel = (raw: unknown): 'junior' | 'mid' | 'senior' => {
        const v = String(raw ?? '')
          .toLowerCase()
          .trim();
        if (allowed.has(v)) return v as 'junior' | 'mid' | 'senior';
        return 'mid';
      };

      return {
        skills: Array.isArray(data.skills)
          ? data.skills
              .map((skill: any) => ({
                name: String(skill?.name ?? skill?.skill ?? skill ?? '').trim(),
                level: coerceLevel(skill?.level),
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
