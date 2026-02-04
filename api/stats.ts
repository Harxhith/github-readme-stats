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
  bg: '#050505',          // Deep Black
  cardBg: '#0a0a0a',      // Slightly lighter card bg
  border: '#333333',
  accentPrimary: '#00f2ff',   // Neon Cyan
  accentSecondary: '#bd00ff', // Neon Purple
  neonBorder: '#1ec500ff',      // Neon Green
  textMain: '#ffffff',
  textMuted: '#888888',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
          languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
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

const fetchBase64Image = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const contentType = response.headers['content-type'];
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error('Failed to fetch image', e);
    return ''; // Fallback or empty
  }
};


const calculateLanguages = (repos: RepositoryNode[]): LanguageStat[] => {
  const langMap = new Map<string, { size: number; color: string }>();

  repos.forEach((repo) => {
    repo.languages.edges.forEach((edge) => {
      const { name, color } = edge.node;
      const { size } = edge;
      
      // Exclude unwanted languages
      if (['Cython', 'Shell', 'PowerShell', 'PLpgSQL'].includes(name)) return;

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
    .sort((a, b) => b.size - a.size);
    // Removed slice to show all languages

  const totalSize = sorted.reduce((acc, lang) => acc + lang.size, 0);

  // Extended vibrant palette for distinct language colors
  const fallbackColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DDA0DD', '#FFD700', '#FF69B4', '#00CED1', '#ADFF2F',
    '#FF4500', '#2E8B57', '#8A2BE2', '#DC143C', '#00FA9A', '#1E90FF', '#FF00FF', '#FFFF00', '#00FFFF', '#FF1493',
    '#7FFF00', '#9932CC', '#FF8C00', '#00BFFF', '#BA55D3', '#FF0000', '#32CD32', '#9400D3', '#00FF7F', '#40E0D0'
  ];

  return sorted.map((lang, index) => ({
    ...lang,
    color: lang.color || fallbackColors[index % fallbackColors.length],
    percentage: parseFloat(((lang.size / totalSize) * 100).toFixed(1)),
  }));
};

// --- SVG Templates ---
const generateSVG = (stats: any, languages: LanguageStat[], avatarBase64: string) => {
  const width = 850;
  
  // Dynamic Height Calculation
  // Dynamic Height Calculation
  const PROFILE_CARD_HEIGHT = 100;
  const OVERVIEW_CARD_HEIGHT = 180;
  const GAP = 20;
  const PADDING = 30; // Outer padding
  
  const leftColumnHeight = PROFILE_CARD_HEIGHT + GAP + OVERVIEW_CARD_HEIGHT;
  
  const LEGEND_ROW_HEIGHT = 25; // Compacted from 30
  const LEGEND_START_Y = 90; // Moved up slightly more
  const CARD_PADDING_BOTTOM = 20;
  
  const legendRows = Math.ceil(languages.length / 2);
  const requiredRightCardHeight = LEGEND_START_Y + (legendRows * LEGEND_ROW_HEIGHT) + CARD_PADDING_BOTTOM;
  
  // Ensure both columns match in visual balance if right is smaller, but allow expansion if larger
  const rightCardHeight = Math.max(leftColumnHeight, requiredRightCardHeight);
  
  const height = Math.max(leftColumnHeight, rightCardHeight) + (PADDING * 2);
  // Width logic: 850 total. PADDING left 30.
  // Profile/Overview: 380 each. Right Card: 380 each.
  // Gap between cols: 430 - (30+380) = 20. Correct.
  
  // Icons made with gradients
  const icons = {
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#grad1)"/>',
    commit: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="url(#grad2)"/>',
    repo: '<path d="M4 19h4v-2H4v2zm0-4h4v-2H4v2zm0-4h4V9H4v2zm0-4h4V5H4v2zm6 12h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H10c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2zM10 5h10v14H10V5z" fill="url(#grad2)"/>',
    contributed: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.39z" fill="url(#grad2)"/>'
  };

  const createStatItem = (label: string, value: number|string, x: number, y: number, iconKey: string) => `
    <g transform="translate(${x}, ${y})">
       <g transform="scale(1.5) translate(0, 0)">${(icons as any)[iconKey] || ''}</g>
       <text x="45" y="16" font-weight="700" font-size="20" fill="${THEME.textMain}" style="filter: url(#glow)">${value}</text>
       <text x="45" y="36" font-size="11" fill="${THEME.textMuted}" letter-spacing="0.5" font-weight="500">${label.toUpperCase()}</text>
    </g>
  `;

  // --- Language Section Helpers ---
  const createSegmentedBar = (languages: LanguageStat[], width: number, y: number) => {
    let currentX = 0;
    return `
      <g transform="translate(0, ${y})">
        <!-- Background -->
        <rect x="0" y="0" width="${width}" height="12" fill="#222" rx="4" />
        <!-- Segments -->
        ${languages.map(lang => {
          const segWidth = (lang.percentage / 100) * width;
          const rect = `<rect x="${currentX}" y="0" width="${segWidth}" height="12" fill="${lang.color || THEME.accentPrimary}" first="${currentX === 0}" />`;
          currentX += segWidth;
          return rect;
        }).join('')}
        <!-- Mask for rounded corners -->
        <use href="#bar-mask" />
      </g>
    `;
  };

  const createLegend = (languages: LanguageStat[], x: number, y: number) => {
    return languages.map((lang, i) => {
      const col = i % 2; // 0 or 1
      const row = Math.floor(i / 2);
      const xPos = x + (col * 170); 
      const yPos = y + (row * 30);

      return `
        <g transform="translate(${xPos}, ${yPos})">
          <circle cx="6" cy="6" r="6" fill="${lang.color || THEME.accentPrimary}" />
          <text x="20" y="10" font-size="14" fill="${THEME.textMain}" font-weight="500">${lang.name} <tspan fill="${THEME.textMuted}" font-weight="400">${lang.percentage}%</tspan></text>
        </g>
      `;
    }).join('');
  };

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${THEME.accentPrimary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${THEME.accentSecondary};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
           <stop offset="0%" style="stop-color:${THEME.accentSecondary};stop-opacity:1" />
           <stop offset="100%" style="stop-color:${THEME.accentPrimary};stop-opacity:1" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <clipPath id="bar-inner">
             <rect width="365" height="12" rx="4" />
         </clipPath>
      </defs>

      <style>
        .title { font-weight: 700; font-size: 20px; fill: ${THEME.textMain}; letter-spacing: -0.5px; }
        .handle { font-weight: 400; font-size: 14px; fill: ${THEME.accentPrimary}; }
        .section-title { font-weight: 600; font-size: 16px; fill: ${THEME.textMain}; letter-spacing: 0.5px; text-transform: uppercase; }
        text { font-family: ${THEME.fontFamily}; }
      </style>
      
      <!-- Main Background -->
      <!-- Main Background -->
      <rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="${THEME.bg}" rx="16" stroke="${(THEME as any).neonBorder}" stroke-width="3" />
      
      <!-- Bento Grid Layout -->
      
      <!-- 1. Profile Card (Top Left) -->
      <g transform="translate(30, ${PADDING})">
        <rect width="380" height="100" rx="8" fill="${THEME.cardBg}" stroke="#333" stroke-width="1" />
        
        <image href="${avatarBase64}" x="20" y="20" height="60" width="60" clip-path="circle(30px)" />
        <text x="100" y="46" class="title">${stats.viewer.name}</text>
        <text x="100" y="71" class="handle">@${stats.viewer.login}</text>
      </g>
      
      <!-- 2. Core Stats Grid (Bottom Left) -->
      <g transform="translate(30, ${PADDING + 100 + GAP})">
        <rect width="380" height="180" rx="8" fill="${THEME.cardBg}" stroke="#333" stroke-width="1" />
        <text x="20" y="35" class="section-title" fill="${THEME.textMuted}">Overview</text>

        
        <!-- 2x2 Grid -->
        ${createStatItem('Stars', stats.viewer.repositories.nodes.reduce((a: any, b: any) => a + b.stargazerCount, 0), 20, 70, 'star')}
        ${createStatItem('Commits', stats.viewer.contributionsCollection.totalCommitContributions, 190, 70, 'commit')}
        ${createStatItem('Repos', stats.viewer.repositories.totalCount, 20, 130, 'repo')}
        ${createStatItem('Contributed', stats.viewer.contributionsCollection.totalRepositoryContributions, 190, 130, 'contributed')}
      </g>
      
      <!-- 3. Languages Card (Right) -->
      <g transform="translate(430, ${PADDING})">
         <rect width="390" height="${rightCardHeight}" rx="8" fill="${THEME.cardBg}" stroke="#333" stroke-width="1" />
         
         <text x="20" y="35" class="section-title">Top Languages</text>

         
         <!-- Bar -->
         <g transform="translate(12, 60)" clip-path="url(#bar-inner)">
            ${createSegmentedBar(languages, 365, 0)}
         </g>
         
         <!-- Legend -->
         <g transform="translate(20, 100)">
            ${createLegend(languages, 0, 0)}
         </g>
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
    
    // Fetch Avatar
    const avatarUrl = 'https://github.com/' + data.viewer.login + '.png';
    const avatarBase64 = await fetchBase64Image(avatarUrl);

    const svg = generateSVG(data, languages, avatarBase64);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=14400, s-maxage=14400'); // 4 hours
    res.status(200).send(svg);
  } catch (error: any) {
    console.error(error);
    res.status(500).send(`Error generating stats: ${error.message}`);
  }
}
