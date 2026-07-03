import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const manifest = [
  ['evidence-1-damage-a.jpg', 'https://placehold.co/960x640/jpg?text=Pavement+Damage'],
  ['evidence-1-damage-b.jpg', 'https://placehold.co/960x640/jpg?text=Pavement+Close+Inspection'],
  ['evidence-1-repair-a.jpg', 'https://placehold.co/960x640/jpg?text=Pavement+Repair+Verified'],
  ['evidence-2-damage-a.jpg', 'https://placehold.co/960x640/jpg?text=Drainage+Damage'],
  ['evidence-2-damage-b.jpg', 'https://placehold.co/960x640/jpg?text=Drainage+Close+Inspection'],
  ['evidence-2-repair-a.jpg', 'https://placehold.co/960x640/jpg?text=Drainage+Repair+Verified'],
  ['evidence-3-damage-a.jpg', 'https://placehold.co/960x640/jpg?text=Shoulder+Damage'],
  ['evidence-3-damage-b.jpg', 'https://placehold.co/960x640/jpg?text=Shoulder+Close+Inspection'],
  ['evidence-3-repair-a.jpg', 'https://placehold.co/960x640/jpg?text=Shoulder+Repair+Verified'],
  ['evidence-4-damage-a.jpg', 'https://placehold.co/960x640/jpg?text=Guardrail+Damage'],
  ['evidence-4-damage-b.jpg', 'https://placehold.co/960x640/jpg?text=Guardrail+Close+Inspection'],
  ['evidence-4-repair-a.jpg', 'https://placehold.co/960x640/jpg?text=Guardrail+Repair+Verified'],
  ['evidence-5-damage-a.jpg', 'https://placehold.co/960x640/jpg?text=Signage+Damage'],
  ['evidence-5-damage-b.jpg', 'https://placehold.co/960x640/jpg?text=Signage+Close+Inspection'],
  ['evidence-5-repair-a.jpg', 'https://placehold.co/960x640/jpg?text=Signage+Repair+Verified'],
];

const outputDir = path.resolve('assets/evidence');
await mkdir(outputDir, { recursive: true });

for (const [filename, url] of manifest) {
  const target = path.join(outputDir, filename);
  if (existsSync(target)) {
    console.log(`skip ${filename}`);
    continue;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${filename}: ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(target, bytes);
  console.log(`saved ${filename}`);
}