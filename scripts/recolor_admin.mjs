import fs from 'fs';
import path from 'path';

const files = [
  'app/layouts/admin.vue',
  'app/pages/admin/index.vue',
  'app/pages/admin/event.vue',
  'app/pages/admin/settings.vue',
  'app/pages/admin/sessions.vue',
  'app/pages/admin/templates.vue',
  'app/pages/admin/logs.vue',
];

files.forEach(f => {
  const p = path.join(process.cwd(), f);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  // 1. Remove all dark: variants
  content = content.replace(/dark:[a-z0-9\-\/]+\s?/g, '');

  // 2. Map some leftover colors
  content = content.replace(/bg-yellow-[0-9]+/g, 'bg-amber-500/10');
  content = content.replace(/text-yellow-[0-9]+/g, 'text-amber-400');
  content = content.replace(/border-yellow-[0-9]+/g, 'border-amber-500/20');

  content = content.replace(/bg-green-[0-9]+/g, 'bg-emerald-500/10');
  content = content.replace(/text-green-[0-9]+/g, 'text-emerald-400');
  content = content.replace(/border-green-[0-9]+/g, 'border-emerald-500/20');

  content = content.replace(/bg-red-[0-9]+/g, 'bg-rose-500/10');
  content = content.replace(/text-red-[0-9]+/g, 'text-rose-400');
  content = content.replace(/border-red-[0-9]+/g, 'border-rose-500/20');

  content = content.replace(/border-blue-[0-9]+/g, 'border-amber-500/20');
  content = content.replace(/text-blue-[0-9]+/g, 'text-amber-400');
  content = content.replace(/bg-blue-[0-9]+/g, 'bg-amber-500/10');

  content = content.replace(/bg-gray-[0-9]+/g, 'bg-zinc-800');
  content = content.replace(/border-gray-[0-9]+/g, 'border-zinc-700');

  // Fix empty class attributes
  content = content.replace(/class="\s*"/g, '');
  content = content.replace(/\s+/g, ' '); // collapse spaces
  content = content.replace(/ >/g, '>');

  fs.writeFileSync(p, content, 'utf8');
  console.log(`Processed (Stage 2): ${f}`);
});
