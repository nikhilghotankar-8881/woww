// worker/seed.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireSupabase } from './lib/supabase.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('[Seed] Seeding database from data/*.seed.json...');
  const supabase = requireSupabase();

  const schemesPath = path.resolve(__dirname, '../data/schemes.seed.json');
  const sourcesPath = path.resolve(__dirname, '../data/sources.seed.json');

  if (!fs.existsSync(schemesPath) || !fs.existsSync(sourcesPath)) {
    throw new Error('Seed JSON files missing in data/ directory.');
  }

  const schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

  // 1. Seed Schemes
  console.log(`[Seed] Inserting ${schemes.length} schemes...`);
  const { error: schemeErr } = await supabase
    .from('schemes')
    .upsert(schemes, { onConflict: 'id' });

  if (schemeErr) {
    console.error('[Seed] Scheme insert error:', schemeErr.message);
  } else {
    console.log('[Seed] Schemes inserted successfully.');
  }

  // 2. Seed Sources
  console.log(`[Seed] Inserting ${sources.length} sources...`);
  const { error: sourceErr } = await supabase
    .from('sources')
    .upsert(sources, { onConflict: 'id' });

  if (sourceErr) {
    console.error('[Seed] Source insert error:', sourceErr.message);
  } else {
    console.log('[Seed] Sources inserted successfully.');
  }

  console.log('[Seed] Done.');
}

seed().catch(err => {
  console.error('[Seed Fatal Error]:', err);
  process.exit(1);
});

