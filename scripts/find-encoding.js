const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ohlyygukvmqbsfmwxbaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obHl5Z3Vrdm1xYnNmbXd4YmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDI5NiwiZXhwIjoyMDg1OTc2Mjk2fQ.b6dQimE0pfuqPMp9K9mYiSwFVV4nu9yrYylJIsHivg4'
);

async function main() {
  const { data, error } = await supabase.from('equipment').select('id, name');
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }
  
  const weirdMatches = new Set();
  
  for (const eq of data) {
    if (!eq.name) continue;
    for (let i = 0; i < eq.name.length; i++) {
      if (eq.name[i] === '├') {
        const char1 = eq.name[i];
        const char2 = i + 1 < eq.name.length ? eq.name[i+1] : '';
        weirdMatches.add(char1 + char2);
      }
    }
  }
  
  console.log('Unique incorrect character sequences:');
  for (const m of weirdMatches) {
    console.log(`"${m}"`);
  }
  
  const replacements = {
    '├®': 'é',
    '├ù': 'x', // or ×
    '├¡': 'í',
    '├º': 'ç',
    '├╡': 'õ',
    '├ú': 'ã',
    '├ó': 'â',
    '├á': 'à',
    '├ê': 'Ê', 
    '├ª': 'æ',
    '├£': 'Ü',
    '├º├ú': 'çã'
  };
  
  // also check if any equipment name matches the sequences to show before/after
  for (const eq of data) {
    let newName = eq.name;
    let changed = false;
    for (const seq of weirdMatches) {
        if (newName.includes(seq)) {
            changed = true;
            // generic replace
            newName = newName.replace(new RegExp(seq, 'g'), replacements[seq] || `[${seq}]`);
        }
    }
    if (changed) {
        console.log(`${eq.name} -> ${newName}`);
    }
  }
}

main();
