import { Injectable } from '@nestjs/common';
import { Job } from 'src/jobs/entities/job.entity';
import { GroqService } from './groq.service';
import { GeneratedQuestion, ParsedCV, SkillGap } from './types';

@Injectable()
export class QuestionGeneratorService {
  constructor(private readonly groq: GroqService) {}

  async generate(
    job: Job,
    parsed: ParsedCV,
    skillGaps: SkillGap[],
  ): Promise<GeneratedQuestion[]> {
    if (!this.groq.isEnabled) {
      return this.fallback(job, skillGaps);
    }

    try {
      const result = await this.groq.jsonCompletion<{
        questions: GeneratedQuestion[];
      }>(
        'Generate technical interview questions. Return JSON with key "questions". Each question must include: question, difficulty (easy|medium|hard), skill, type (open|mcq|exercise).',
        `Job title: ${job.title}
Required skills: ${JSON.stringify(job.requiredSkills)}
Candidate parsed data: ${JSON.stringify(parsed)}
Skill gaps: ${JSON.stringify(skillGaps)}
Generate 6-10 questions.`,
      );
      return Array.isArray(result.questions)
        ? result.questions
        : this.fallback(job, skillGaps);
    } catch {
      return this.fallback(job, skillGaps);
    }
  }

  private fallback(job: Job, skillGaps: SkillGap[]): GeneratedQuestion[] {
    const focusSkills = skillGaps.length
      ? skillGaps.map((g) => g.skill)
      : (job.requiredSkills || []).map((s) => s.skill);
    return focusSkills.slice(0, 6).map((skill, i) => ({
      question: `Explain your experience with ${skill} and describe a technical challenge you solved using it.`,
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      skill,
      type: 'open',
    }));
  }
}
