const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ohlyygukvmqbsfmwxbaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obHl5Z3Vrdm1xYnNmbXd4YmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDI5NiwiZXhwIjoyMDg1OTc2Mjk2fQ.b6dQimE0pfuqPMp9K9mYiSwFVV4nu9yrYylJIsHivg4'
);

const replacements = {
  '├│': 'ó',
  '├Á': 'õ', 
  '├ô': 'Ó',
  '├Ô': 'Ô',
  '├ç': 'Ç',
  '├Ç': 'À',
  '├É': 'É',
  '├Í': 'Í',
  '├Ú': 'Ú',
  '├Õ': 'Õ',
  '├Ã': 'Ã',
  '├Á': 'Á',
  '├Â': 'Â'
};

function fixText(text) {
  if (!text) return text;
  let newText = text;
  let changed = false;
  
  for (const [badSequence, goodCharacter] of Object.entries(replacements)) {
    if (newText.includes(badSequence)) {
      newText = newText.replace(new RegExp(badSequence.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), goodCharacter);
      changed = true;
    }
  }
  return changed ? newText : text;
}

async function main() {
  const { data, error } = await supabase.from('equipment').select('id, name, category, location, notes, brand, model');
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }
  
  let updatedCount = 0;
  
  for (const eq of data) {
    const fixedName = fixText(eq.name);
    const fixedCategory = fixText(eq.category);
    const fixedLocation = fixText(eq.location);
    const fixedNotes = fixText(eq.notes);
    const fixedBrand = fixText(eq.brand);
    const fixedModel = fixText(eq.model);
    
    if (
      fixedName !== eq.name ||
      fixedCategory !== eq.category ||
      fixedLocation !== eq.location ||
      fixedNotes !== eq.notes ||
      fixedBrand !== eq.brand ||
      fixedModel !== eq.model
    ) {
      console.log(`Fixing ID: ${eq.id}`);
      if (fixedName !== eq.name) console.log(`  Name: ${eq.name} -> ${fixedName}`);
      if (fixedCategory !== eq.category) console.log(`  Cat:  ${eq.category} -> ${fixedCategory}`);
      if (fixedLocation !== eq.location) console.log(`  Loc:  ${eq.location} -> ${fixedLocation}`);
      if (fixedNotes !== eq.notes) console.log(`  Note: ${eq.notes} -> ${fixedNotes}`);
      
      const { error: updateError } = await supabase.from('equipment').update({
        name: fixedName,
        category: fixedCategory,
        location: fixedLocation,
        notes: fixedNotes,
        brand: fixedBrand,
        model: fixedModel
      }).eq('id', eq.id);
      
      if (updateError) {
        console.error(`Error updating id ${eq.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Successfully updated ${updatedCount} equipment records with extra columns.`);
}

main();
