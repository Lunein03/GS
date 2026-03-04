const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ohlyygukvmqbsfmwxbaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obHl5Z3Vrdm1xYnNmbXd4YmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDI5NiwiZXhwIjoyMDg1OTc2Mjk2fQ.b6dQimE0pfuqPMp9K9mYiSwFVV4nu9yrYylJIsHivg4'
);

async function main() {
  const { data, error } = await supabase.from('equipment').select('id, name, category, location, notes, brand, model');
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }
  
  let left = 0;
  for (const eq of data) {
    const vals = [eq.name, eq.category, eq.location, eq.notes, eq.brand, eq.model].filter(Boolean);
    const hasBroken = vals.some(v => v.includes('├'));
    if (hasBroken) {
        console.log(`Still broken: ID ${eq.id}`);
        console.log(vals.filter(v => v.includes('├')));
        left++;
    }
  }
  
  if (left === 0) {
      console.log('All text encoding fixed!');
  }
}

main();
