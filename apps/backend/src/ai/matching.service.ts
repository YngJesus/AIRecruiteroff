import { Injectable } from '@nestjs/common';
import { Job } from 'src/jobs/entities/job.entity';
import { GroqService } from './groq.service';
import { ParsedCV, SkillGap } from './types';

const LEVEL_SCORE: Record<string, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
};

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

  /** Map free-text level to junior | mid | senior for scoring. */
  private normalizeLevel(level: unknown): keyof typeof LEVEL_SCORE {
    const v = String(level ?? '')
      .toLowerCase()
      .trim();
    if (
      v.includes('junior') ||
      v === 'jr' ||
      v.includes('beginner') ||
      v.includes('entry')
    ) {
      return 'junior';
    }
    if (
      v.includes('senior') ||
      v === 'sr' ||
      v.includes('lead') ||
      v.includes('principal') ||
      v.includes('staff')
    ) {
      return 'senior';
    }
    if (v.includes('mid') || v.includes('intermediate') || v.includes('med')) {
      return 'mid';
    }
    return 'mid';
  }

  private findMatchingCandidateSkill(
    parsed: ParsedCV,
    reqSkill: string,
  ): { name?: string; level?: string } | undefined {
    for (const s of parsed.skills || []) {
      const n = this.normalizeSkillName(
        (s as any)?.name ?? (s as any)?.skill ?? s,
      );
      if (!n) continue;
      if (n === reqSkill || n.includes(reqSkill) || reqSkill.includes(n)) {
        return s as { name?: string; level?: string };
      }
    }
    return undefined;
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

      const candidateSkillObj = this.findMatchingCandidateSkill(
        parsed,
        reqSkill,
      );

      if (candidateSkillObj) {
        const reqLevelKey = this.normalizeLevel((req as any)?.level);
        const requiredLevel = LEVEL_SCORE[reqLevelKey] ?? 2;
        const candLevelKey = this.normalizeLevel(candidateSkillObj?.level);
        const candidateLevel = LEVEL_SCORE[candLevelKey] ?? 2;

        if (candidateLevel >= requiredLevel) {
          score += baseWeight;
          skillGaps.push({ skill: req.skill, status: 'match' });
        } else if (candidateLevel === requiredLevel - 1) {
          score += baseWeight * 0.7;
          skillGaps.push({ skill: req.skill, status: 'partial' });
        } else {
          score += baseWeight * 0.3;
          skillGaps.push({ skill: req.skill, status: 'gap' });
        }
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
