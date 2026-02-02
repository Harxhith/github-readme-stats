import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// --- Types ---
// --- Types ---
interface RepositoryNode {
  stargazerCount: number;
  languages: {
    edges: {
      size: number;
      node: {
        name: string;
        color: string;
      };
    }[];
  };
}

interface UserStatsData {
  viewer: {
    login: string;
    name: string;
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalRepositoryContributions: number;
    };
    repositories: {
      totalCount: number;
      nodes: RepositoryNode[];
    };
  };
}

interface LanguageStat {
  name: string;
  size: number;
  color: string;
  percentage: number;
}

// --- Configuration ---
const THEME = {
  bg: '#0a0a0a',
  border: '#222222',
  accentSecondary: '#333333', // Tactical Gray
  accentPrimary: '#f2d41f',   // Batman Yellow
  textMain: '#e0e0e0',
  textMuted: '#666666',
  fontFamily: "'Figtree', 'Inter', 'Segoe UI', Ubuntu, sans-serif",
};

// --- GraphQL Query ---
const QUERY = `
  query UserStats {
    viewer {
      login
      name
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalRepositoryContributions
      }
      repositories(first: 100, ownerAffiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR], isFork: false) {
        totalCount
        nodes {
          stargazerCount
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

// --- Helpers ---
const fetchGitHubStats = async (token: string): Promise<UserStatsData> => {
  const response = await axios.post(
    'https://api.github.com/graphql',
    { query: QUERY },
    {
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data.errors) {
    throw new Error(JSON.stringify(response.data.errors));
  }

  return response.data.data;
};

const calculateLanguages = (repos: RepositoryNode[]): LanguageStat[] => {
  const langMap = new Map<string, { size: number; color: string }>();

  repos.forEach((repo) => {
    repo.languages.edges.forEach((edge) => {
      const { name, color } = edge.node;
      const { size } = edge;
      
      if (['HTML', 'CSS', 'SCSS', 'Shell'].includes(name)) return; // Exclude boilerplate

      if (langMap.has(name)) {
        const current = langMap.get(name)!;
        langMap.set(name, { size: current.size + size, color: current.color || color });
      } else {
        langMap.set(name, { size, color });
      }
    });
  });

  const sorted = Array.from(langMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  const totalSize = sorted.reduce((acc, lang) => acc + lang.size, 0);

  return sorted.map((lang) => ({
    ...lang,
    percentage: parseFloat(((lang.size / totalSize) * 100).toFixed(1)),
  }));
};

// --- SVG Templates ---
const generateSVG = (stats: any, languages: LanguageStat[]) => {
  const width = 800;
  const height = 360;
  
  const cardStyle = `
    fill: ${THEME.bg}; 
    stroke: ${THEME.border}; 
    stroke-width: 1px;
    rx: 4;
  `;

  // Icons (Simple paths for utilitarian look)
  const icons = {
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="' + THEME.accentPrimary + '"/>',
    commit: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="' + THEME.accentSecondary + '"/>',
    repo: '<path d="M4 19h4v-2H4v2zm0-4h4v-2H4v2zm0-4h4V9H4v2zm0-4h4V5H4v2zm6 12h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H10c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2zM10 5h10v14H10V5z" fill="' + THEME.accentSecondary + '"/>',
    contributed: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.39z" fill="' + THEME.accentSecondary + '"/>'
  };

  const createStatRow = (label: string, value: number|string, y: number, iconKey: string) => `
    <g transform="translate(40, ${y})">
       <!-- Icon -->
       <g transform="scale(1.2) translate(-4, -4)">${(icons as any)[iconKey] || ''}</g>
       <text x="45" y="12" font-size="20" font-weight="bold" fill="${THEME.accentPrimary}">${value}</text>
       <text x="45" y="32" font-size="12" fill="${THEME.textMuted}" letter-spacing="1.2" font-weight="500">${label.toUpperCase()}</text>
    </g>
  `;

  const createLangBar = (lang: LanguageStat, y: number) => `
    <g transform="translate(30, ${y})">
       <text x="0" y="0" font-size="14" fill="${THEME.textMain}" font-weight="600">${lang.name}</text>
      <text x="310" y="0" font-size="14" fill="${THEME.textMuted}" text-anchor="end">${lang.percentage}%</text>
      
      <!-- Bar Background -->
      <rect x="0" y="8" width="310" height="8" fill="${THEME.accentSecondary}" rx="3" />
      <!-- Bar Progress -->
      <rect x="0" y="8" width="${(lang.percentage / 100) * 310}" height="8" fill="${lang.color || THEME.accentPrimary}" rx="3" />
    </g>
  `;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
        .title { font: 700 22px '${THEME.fontFamily}'; fill: ${THEME.textMain}; letter-spacing: 0.5px; }
        .sub { font: 400 14px '${THEME.fontFamily}'; fill: ${THEME.textMuted}; }
        text { font-family: '${THEME.fontFamily}'; }
      </style>
      
      <rect width="100%" height="100%" fill="${THEME.bg}" rx="10" />
      
      <!-- Card 1: Core Stats (Left) -->
      <g transform="translate(25, 25)">
        <rect width="365" height="310" style="${cardStyle}" />
        
        <!-- Header -->
        <image href="${'https://github.com/' + stats.viewer.login + '.png'}" x="25" y="25" height="60" width="60" clip-path="circle(30px)" />
        <text x="100" y="52" class="title">${stats.viewer.name}</text>
        <text x="100" y="75" class="sub">@${stats.viewer.login}</text>
        
        <line x1="25" y1="100" x2="340" y2="100" stroke="${THEME.border}" />
        
        <!-- Stats -->
        ${createStatRow('Stars Earned', stats.viewer.repositories.nodes.reduce((a: any, b: any) => a + b.stargazerCount, 0), 135, 'star')}
        ${createStatRow('Total Commits', stats.viewer.contributionsCollection.totalCommitContributions, 180, 'commit')}
        ${createStatRow('Total Repos', stats.viewer.repositories.totalCount, 225, 'repo')}
        ${createStatRow('Contributed To', stats.viewer.contributionsCollection.totalRepositoryContributions, 270, 'contributed')}
        
        <!-- Decoration -->
        <path d="M 340 25 L 365 25 L 365 50" stroke="${THEME.accentPrimary}" fill="none" stroke-width="2" />
      </g>
      
      <!-- Card 2: Languages (Right) -->
      <g transform="translate(410, 25)">
        <rect width="365" height="310" style="${cardStyle}" />
        <text x="25" y="55" class="title">TOP LANGUAGES</text>
        <line x1="25" y1="80" x2="340" y2="80" stroke="${THEME.border}" />
        
        <g transform="translate(0, 115)">
          ${languages.map((l, i) => createLangBar(l, i * 42)).join('')}
        </g>
        
        <!-- Decoration -->
        <rect x="330" y="285" width="12" height="12" fill="${THEME.accentSecondary}" />
        <rect x="348" y="285" width="12" height="12" fill="${THEME.accentPrimary}" />
      </g>
    </svg>
  `;
};

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.GH_TOKEN;

  if (!token) {
    return res.status(500).send('Error: GH_TOKEN is missing');
  }

  try {
    const data = await fetchGitHubStats(token);
    const languages = calculateLanguages(data.viewer.repositories.nodes);
    const svg = generateSVG(data, languages);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=14400, s-maxage=14400'); // 4 hours
    res.status(200).send(svg);
  } catch (error: any) {
    console.error(error);
    res.status(500).send(`Error generating stats: ${error.message}`);
  }
}
