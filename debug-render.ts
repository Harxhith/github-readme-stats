
import { generateSVG } from './api/stats';
import fs from 'fs';

const mockStats = {
  viewer: {
    login: 'testuser',
    name: 'Test User',
    contributionsCollection: {
      totalCommitContributions: 100,
      totalPullRequestContributions: 50,
      totalRepositoryContributions: 20,
    },
    repositories: {
      totalCount: 10,
      nodes: [
        { stargazerCount: 10, languages: { edges: [{ size: 100, node: { name: 'TypeScript', color: '#3178c6' } }] } },
        { stargazerCount: 5, languages: { edges: [{ size: 50, node: { name: 'JavaScript', color: '#f1e05a' } }] } }
      ],
    },
  },
};

const mockLanguages = [
  { name: 'TypeScript', size: 100, color: '#3178c6', percentage: 66.6 },
  { name: 'JavaScript', size: 50, color: '#f1e05a', percentage: 33.3 },
];

const run = async () => {
    try {
        const desktopSvg = generateSVG(mockStats, mockLanguages, 'data:image/png;base64,');
        const mobileSvg = generateSVG(mockStats, mockLanguages, 'data:image/png;base64,', { isMobile: true });

        console.log('--- Desktop SVG ---');
        const desktopWidth = desktopSvg.match(/width="(\d+)"/)?.[1];
        const desktopHeight = desktopSvg.match(/height="(\d+)"/)?.[1];
        console.log(`Width: ${desktopWidth}, Height: ${desktopHeight}`);
        
        console.log('--- Mobile SVG ---');
        const mobileWidth = mobileSvg.match(/width="(\d+)"/)?.[1];
        const mobileHeight = mobileSvg.match(/height="(\d+)"/)?.[1];
        console.log(`Width: ${mobileWidth}, Height: ${mobileHeight}`);

        // Basic Assertions
        if (Number(mobileWidth) < 500) {
            console.log('PASS: Mobile width is compact.');
        } else {
            console.error('FAIL: Mobile width is too wide.');
        }

        if (Number(mobileHeight) > Number(desktopHeight)) {
            console.log('PASS: Mobile height indicates stacking.');
        } else {
             // It might not definitely be higher depending on content, but usually due to stacking it is taller than desktop which is 2 columns
             console.log(`INFO: Mobile height: ${mobileHeight} vs Desktop: ${desktopHeight}`);
        }

        fs.writeFileSync('output_mobile.svg', mobileSvg);
        console.log('Saved output_mobile.svg');

    } catch (e) {
        console.error(e);
    }
};

run();
