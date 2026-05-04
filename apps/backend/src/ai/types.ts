export interface ParsedCV {
  skills: { name: string; level?: string }[];
  experience: {
    company?: string;
    role?: string;
    duration?: string;
    technologies?: string[];
  }[];
  education: { school?: string; degree?: string; field?: string }[];
  certifications: { name?: string; issuer?: string; date?: string }[];
}

export interface SkillGap {
  skill: string;
  status: 'match' | 'gap' | 'partial';
}

export interface GeneratedQuestion {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skill: string;
  type: 'open' | 'mcq' | 'exercise';
}
