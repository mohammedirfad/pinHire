const COMMON_SKILLS = [
  'React',
  'Next.js',
  'Node.js',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Spring Boot',
  'PHP',
  'Laravel',
  'Flutter',
  'React Native',
  'Android',
  'iOS',
  'DevOps',
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning',
  'UI UX Designer',
  'Product Manager',
  'QA Engineer',
  'Testing',
  'Digital Marketing',
  'Sales',
  'HR',
  'Finance',
];

const COMMON_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'MERN Stack Developer',
  'Mobile App Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'QA Tester',
  'Business Analyst',
  'Data Analyst',
  'Data Scientist',
  'AI Engineer',
  'Machine Learning Engineer',
  'UI UX Designer',
  'Graphic Designer',
  'Product Manager',
  'Project Manager',
  'Technical Lead',
  'Team Lead',
  'Fresher',
  'Internship',
  'Customer Support',
];

export const BASE_SEARCH_SUGGESTIONS = [...COMMON_ROLES, ...COMMON_SKILLS];

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getEditDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

export function textMatchesQuery(text: string, query: string) {
  const source = normalizeSearchText(text);
  const target = normalizeSearchText(query);
  if (!target) return true;
  if (source.includes(target)) return true;

  const sourceTokens = source.split(' ').filter(Boolean);
  const queryTokens = target.split(' ').filter(Boolean);

  return queryTokens.every((queryToken) =>
    sourceTokens.some((sourceToken) => {
      if (sourceToken.includes(queryToken) || queryToken.includes(sourceToken)) return true;
      if (queryToken.length < 4) return sourceToken.startsWith(queryToken);
      return getEditDistance(queryToken, sourceToken) <= Math.max(1, Math.floor(queryToken.length / 4));
    })
  );
}

export function getLocalKeywordSuggestions(query: string, limit = 8) {
  const target = normalizeSearchText(query);
  if (!target) return BASE_SEARCH_SUGGESTIONS.slice(0, limit);

  return BASE_SEARCH_SUGGESTIONS
    .map((label) => {
      const normalized = normalizeSearchText(label);
      const score = normalized.startsWith(target)
        ? 0
        : normalized.includes(target)
        ? 1
        : getEditDistance(target, normalized);

      return { label, score };
    })
    .filter((item) => item.score <= Math.max(2, Math.floor(target.length / 3)))
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .map((item) => item.label)
    .slice(0, limit);
}
