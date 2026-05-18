import fs from 'fs';
import path from 'path';

const SKILLS_DIR = path.join(process.cwd(), 'marketing-skills');

if (!fs.existsSync(SKILLS_DIR)) {
  fs.mkdirSync(SKILLS_DIR, { recursive: true });
}

export function loadSkill(skillName: string): string | null {
  try {
    const skillPath = path.join(SKILLS_DIR, `${skillName}.md`);
    if (!fs.existsSync(skillPath)) return null;
    return fs.readFileSync(skillPath, 'utf8');
  } catch {
    return null;
  }
}

export function listSkills(): string[] {
  try {
    return fs.readdirSync(SKILLS_DIR)
      .filter(f => f.endsWith('.md') && f !== 'README.md')
      .map(f => f.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}
