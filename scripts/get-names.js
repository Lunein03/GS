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
  
  const weirdNames = data.filter(d => !/^[a-zA-Z0-O9\s\-\.,]*$/.test(d.name));
  
  for (const eq of data) {
    if (eq.name.includes('Trip') || eq.name.includes('Chroma') || eq.name.includes('')) {
        console.log(`ID: ${eq.id} | NAME: ${eq.name}`);
        // Log character codes to see exactly what is broken
        for (let i=0; i<eq.name.length; i++) {
            console.log(`  char ${i}: ${eq.name[i]} (code ${eq.name.charCodeAt(i)})`);
        }
    }
  }
  
  console.log(`Total equipment: ${data.length}`);
}

main();
