const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ohlyygukvmqbsfmwxbaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obHl5Z3Vrdm1xYnNmbXd4YmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDI5NiwiZXhwIjoyMDg1OTc2Mjk2fQ.b6dQimE0pfuqPMp9K9mYiSwFVV4nu9yrYylJIsHivg4'
);

const replacements = {
  '├®': 'é',
  '├ù': 'x',
  '├¡': 'í',
  '├º': 'ç',
  '├╡': 'õ',
  '├ú': 'ã',
  '├ó': 'â',
  '├í': 'á',
  '├ê': 'Ê', 
  '├ª': 'æ',
  '├£': 'Ü',
  '├║': 'ú'
};

async function main() {
  const { data, error } = await supabase.from('equipment').select('id, name');
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }
  
  let updatedCount = 0;
  
  for (const eq of data) {
    let newName = eq.name;
    let changed = false;
    
    for (const [badSequence, goodCharacter] of Object.entries(replacements)) {
      if (newName.includes(badSequence)) {
        newName = newName.replace(new RegExp(badSequence.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), goodCharacter);
        changed = true;
      }
    }
    
    if (changed) {
      console.log(`Fixing: ${eq.name} -> ${newName}`);
      const { error: updateError } = await supabase.from('equipment').update({ name: newName }).eq('id', eq.id);
      if (updateError) {
        console.error(`Error updating id ${eq.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Successfully updated ${updatedCount} equipment records.`);
}

main();
