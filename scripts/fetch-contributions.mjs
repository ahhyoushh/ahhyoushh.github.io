import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data', 'contributions.json');
const USERNAME = 'ahhyoushh';
const EXCLUDED_ORGS = new Set(['DikshitRJ', 'TanishkBansode', 'threadlockers']);
const PER_PAGE = 100;
const API = 'https://api.github.com';

const headers = { 'User-Agent': 'ahhyoushh-portfolio' };
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchAllPRs() {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${API}/search/issues?q=author:${USERNAME}+type:pr&per_page=${PER_PAGE}&page=${page}`;
    const data = await fetchJSON(url);
    all.push(...data.items);
    if (data.items.length < PER_PAGE || all.length >= data.total_count) break;
    page++;
  }
  return all;
}

function parseOwner(repoUrl) {
  const parts = repoUrl.replace(API + '/repos/', '').split('/');
  return parts[0];
}

async function main() {
  let prs;
  try {
    prs = await fetchAllPRs();
  } catch (e) {
    console.error('Failed to fetch GitHub PRs:', e.message);
    if (existsSync(OUT)) {
      console.log('Using cached data');
      return;
    }
    writeFileSync(OUT, '[]');
    return;
  }

  const orgMap = {};
  for (const pr of prs) {
    const owner = parseOwner(pr.repository_url);
    if (owner.toLowerCase() === USERNAME.toLowerCase()) continue;
    if (EXCLUDED_ORGS.has(owner)) continue;

    const repoName = pr.repository_url.split('/').slice(-2).join('/');
    const merged = pr.pull_request?.merged_at != null;
    const status = merged ? 'merged' : pr.state === 'closed' ? 'closed' : 'open';
    const date = merged ? pr.pull_request.merged_at : pr.closed_at || pr.created_at;

    if (!orgMap[owner]) {
      orgMap[owner] = { login: owner, avatar: `https://github.com/${owner}.png`, repos: {} };
    }
    if (!orgMap[owner].repos[repoName]) {
      orgMap[owner].repos[repoName] = [];
    }
    orgMap[owner].repos[repoName].push({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      status,
      date: date ? date.split('T')[0] : null,
    });
  }

  const orgs = Object.values(orgMap)
    .map(org => ({
      ...org,
      repos: Object.entries(org.repos)
        .map(([name, pulls]) => ({ name, pulls: pulls.sort((a, b) => b.number - a.number) }))
        .sort((a, b) => b.pulls.length - a.pulls.length),
    }))
    .sort((a, b) => {
      const aCount = a.repos.reduce((s, r) => s + r.pulls.length, 0);
      const bCount = b.repos.reduce((s, r) => s + r.pulls.length, 0);
      return bCount - aCount;
    });

  writeFileSync(OUT, JSON.stringify(orgs, null, 2));
  console.log(`Wrote ${orgs.length} organizations to contributions.json`);
}

main();
