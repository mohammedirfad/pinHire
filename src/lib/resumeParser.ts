// Resume Parser and Job Matcher engine

export interface ParsedResume {
  skills: string[];
  experienceYears: number;
  detectedRoles: string[];
  locationPreference: string;
  summary: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function parseResumeText(rawText: string): Promise<ParsedResume> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Analyze this candidate resume and return ONLY a raw JSON object (no markdown) with format:
{
  "skills": string[],
  "experienceYears": number,
  "detectedRoles": string[],
  "locationPreference": string,
  "summary": string
}

Resume Content:
"""
${rawText}
"""`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.content?.[0]?.text;
        if (content) {
          return JSON.parse(content.replace(/```json|```/g, '').trim());
        }
      }
    } catch (e) {
      console.warn('Anthropic resume parse failed, using smart offline resume extractor', e);
    }
  }

  // Offline Smart Resume Parser Fallback
  return parseOfflineResume(rawText);
}

function parseOfflineResume(text: string): ParsedResume {
  const commonSkills = [
    // Languages & Frameworks
    'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Golang',
    'Vue', 'Vue.js', 'Angular', 'Svelte', 'Java', 'Spring', 'Spring Boot', 'C++', 'C#', '.NET',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'Swift', 'Kotlin', 'Flutter', 'React Native',
    // Web Technologies & Styling
    'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind', 'TailwindCSS', 'Bootstrap', 'Sass', 'LESS',
    'GraphQL', 'REST API', 'Express', 'FastAPI', 'Django', 'Flask', 'Redux', 'Zustand',
    // Databases & Cache
    'PostgreSQL', 'Postgres', 'SQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Prisma', 'SQLite',
    // DevOps & Cloud & Infrastructure
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Nginx',
    // AI & Machine Learning & Data
    'Machine Learning', 'AI', 'NLP', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-Learn',
    // Design & Management & QA
    'Figma', 'UI/UX', 'Product Management', 'Jira', 'Agile', 'Scrum', 'QA', 'Selenium', 'Cypress'
  ];

  const foundSkillsSet = new Set<string>();
  for (const skill of commonSkills) {
    const escaped = escapeRegex(skill);
    const regex = new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i');
    if (regex.test(text)) {
      // Normalize name
      let cleanSkill = skill;
      if (skill === 'Vue.js') cleanSkill = 'Vue';
      if (skill === 'TailwindCSS') cleanSkill = 'Tailwind';
      if (skill === 'Golang') cleanSkill = 'Go';
      if (skill === 'Postgres') cleanSkill = 'PostgreSQL';
      foundSkillsSet.add(cleanSkill);
    }
  }

  const foundSkills = Array.from(foundSkillsSet);

  // Estimate experience
  let experienceYears = 2;
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience/i);
  if (expMatch) {
    experienceYears = parseInt(expMatch[1], 10);
  }

  // Roles detection
  const detectedRoles: string[] = [];
  if (/full[\s-]?stack/i.test(text)) detectedRoles.push('Full-Stack Engineer');
  if (/frontend|react|ui|web/i.test(text)) detectedRoles.push('Frontend Developer');
  if (/backend|go|node|python|java/i.test(text)) detectedRoles.push('Backend Engineer');
  if (/mobile|ios|android|flutter|react native/i.test(text)) detectedRoles.push('Mobile App Developer');
  if (/devops|cloud|aws|kubernetes/i.test(text)) detectedRoles.push('DevOps / Cloud Engineer');
  if (/data|machine learning|ai|python/i.test(text)) detectedRoles.push('Data / AI Engineer');
  if (/designer|figma|ux/i.test(text)) detectedRoles.push('Product Designer');

  if (detectedRoles.length === 0) {
    detectedRoles.push('Software Engineer');
  }

  // Location preference detection
  let locationPreference = 'Bangalore, India';
  if (/kochi|kerala|infopark/i.test(text)) locationPreference = 'Kochi, India';
  else if (/mumbai/i.test(text)) locationPreference = 'Mumbai, India';
  else if (/delhi|noida|gurgaon/i.test(text)) locationPreference = 'Delhi NCR, India';
  else if (/hyderabad/i.test(text)) locationPreference = 'Hyderabad, India';
  else if (/pune/i.test(text)) locationPreference = 'Pune, India';
  else if (/chennai/i.test(text)) locationPreference = 'Chennai, India';
  else if (/san francisco|sf|california|us|usa/i.test(text)) locationPreference = 'San Francisco, CA';
  else if (/london|uk|united kingdom/i.test(text)) locationPreference = 'London, UK';
  else if (/remote/i.test(text)) locationPreference = 'Remote';

  return {
    skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'React', 'Node.js', 'TypeScript', 'SQL', 'Git'],
    experienceYears,
    detectedRoles,
    locationPreference,
    summary: `Candidate with ${experienceYears}+ years of experience specializing in ${foundSkills.slice(0, 5).join(', ') || 'Software Engineering'}.`,
  };
}
