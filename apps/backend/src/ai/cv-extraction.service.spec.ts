import { CvExtractionService } from './cv-extraction.service';
import { GroqService } from './groq.service';
import { ParserService } from 'src/candidates/parser.service';

describe('CvExtractionService', () => {
  it('uses Groq response when available', async () => {
    const groq = {
      isEnabled: true,
      jsonCompletion: jest.fn().mockResolvedValue({
        skills: [{ name: 'React' }],
        experience: [],
        education: [],
        certifications: [],
      }),
    } as unknown as GroqService;
    const parser = new ParserService();
    const service = new CvExtractionService(groq, parser);

    const result = await service.extract('example cv text');
    expect(result.skills[0].name).toBe('React');
    expect(groq.jsonCompletion).toHaveBeenCalled();
  });

  it('falls back to regex parser on Groq failure', async () => {
    const groq = {
      isEnabled: true,
      jsonCompletion: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as GroqService;
    const parser = new ParserService();
    const service = new CvExtractionService(groq, parser);

    const result = await service.extract('React TypeScript Node.js');
    expect(result.skills.length).toBeGreaterThan(0);
  });
});
