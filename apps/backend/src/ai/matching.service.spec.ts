import { MatchingService } from './matching.service';
import { GroqService } from './groq.service';

describe('MatchingService', () => {
  it('computes deterministic score from required skills', async () => {
    const groq = {
      isEnabled: false,
    } as unknown as GroqService;
    const service = new MatchingService(groq);

    const result = await service.computeMatch(
      {
        requiredSkills: [
          { skill: 'React', level: 'mid', priority: 'required' },
          { skill: 'Node.js', level: 'mid', priority: 'required' },
          { skill: 'Docker', level: 'junior', priority: 'nice-to-have' },
        ],
      } as any,
      {
        skills: [{ name: 'React' }, { name: 'Node.js' }],
        experience: [],
        education: [],
        certifications: [],
      },
    );

    expect(result.matchScore).toBe(80);
    expect(result.skillGaps).toEqual([
      { skill: 'React', status: 'match' },
      { skill: 'Node.js', status: 'match' },
      { skill: 'Docker', status: 'gap' },
    ]);
  });
});
