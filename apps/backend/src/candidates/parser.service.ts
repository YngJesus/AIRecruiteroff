import { Injectable } from '@nestjs/common';

@Injectable()
export class ParserService {
  parseCV(rawText: string): {
    skills: { name: string; level?: string }[];
    experience: { company?: string; role?: string; duration?: string }[];
    education: { school?: string; degree?: string; field?: string }[];
    certifications: { name?: string; issuer?: string; date?: string }[];
  } {
    const text = rawText.toLowerCase();

    // Extract skills (simple regex matching against common tech skills)
    const skillKeywords = [
      'react',
      'angular',
      'vue',
      'nodejs',
      'node.js',
      'python',
      'java',
      'typescript',
      'javascript',
      'sql',
      'postgresql',
      'mongodb',
      'docker',
      'kubernetes',
      'aws',
      'git',
      'graphql',
      'rest api',
      'c#',
      'go',
      'rust',
      'php',
      'laravel',
    ];
    const skills = skillKeywords
      .filter((skill) => text.includes(skill))
      .map((skill) => ({
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
      }));

    // Extract experience (look for years pattern)
    const experience = [];
    const yearPattern = /(\d{4})\s*-\s*(\d{4}|present)/gi;
    const matches = rawText.match(yearPattern) || [];
    matches.forEach((match) => {
      experience.push({ duration: match });
    });

    // Extract education (look for degree keywords)
    const degreeKeywords = [
      'bachelor',
      'master',
      'phd',
      'diploma',
      'certificate',
    ];
    const education = [];
    degreeKeywords.forEach((degree) => {
      if (text.includes(degree)) {
        education.push({ degree: degree.toUpperCase() });
      }
    });

    // Extract certifications (look for cert keywords)
    const certKeywords = ['aws', 'azure', 'gcp', 'certified', 'scrum master'];
    const certifications = [];
    certKeywords.forEach((cert) => {
      if (text.includes(cert)) {
        certifications.push({ name: cert.toUpperCase() });
      }
    });

    return { skills, experience, education, certifications };
  }
}
