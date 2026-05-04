import { Injectable } from '@nestjs/common';
import { Job } from 'src/jobs/entities/job.entity';
import { GroqService } from './groq.service';
import { ParsedCV, SkillGap } from './types';

@Injectable()
export class MatchingService {
  constructor(private readonly groq: GroqService) {}

  private normalizeSkillName(skill: unknown): string {
    return String(skill ?? '')
      .toLowerCase()
      .trim()
      .replace(/[\s._-]+/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  async computeMatch(
    job: Job,
    parsed: ParsedCV,
  ): Promise<{ matchScore: number; skillGaps: SkillGap[] }> {
    const parsedSkills = (parsed.skills || [])
      .map((s: any) => this.normalizeSkillName(s?.name ?? s?.skill ?? s))
      .filter(Boolean);
    const required = Array.isArray(job?.requiredSkills)
      ? job.requiredSkills
      : [];

    if (!required.length) {
      return { matchScore: 0, skillGaps: [] };
    }

    const skillGaps: SkillGap[] = [];
    let score = 0;
    let totalWeight = 0;

    for (const req of required) {
      const reqSkill = this.normalizeSkillName(req?.skill);
      if (!reqSkill) {
        continue;
      }

      const baseWeight = req?.priority === 'required' ? 2 : 1;
      totalWeight += baseWeight;

      if (parsedSkills.some((s) => s === reqSkill || s.includes(reqSkill))) {
        score += baseWeight;
        skillGaps.push({ skill: req.skill, status: 'match' });
        continue;
      }

      const partial = await this.isSemanticPartialMatch(
        req.skill,
        parsedSkills,
      );
      if (partial) {
        score += baseWeight * 0.5;
        skillGaps.push({ skill: req.skill, status: 'partial' });
      } else {
        skillGaps.push({ skill: req.skill, status: 'gap' });
      }
    }

    const matchScore = totalWeight ? (score / totalWeight) * 100 : 0;
    return { matchScore: Math.round(matchScore), skillGaps };
  }

  private async isSemanticPartialMatch(
    requiredSkill: string,
    parsedSkills: string[],
  ): Promise<boolean> {
    if (!this.groq.isEnabled || parsedSkills.length === 0) return false;
    try {
      const result = await this.groq.jsonCompletion<{ partial: boolean }>(
        'You are a skills normalizer for technical recruitment. Return JSON: {"partial": true|false}.',
        `Required skill: ${requiredSkill}\nCandidate skills: ${parsedSkills.join(', ')}`,
      );
      return Boolean(result.partial);
    } catch {
      return false;
    }
  }
}
