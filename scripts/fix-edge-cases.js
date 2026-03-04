const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ohlyygukvmqbsfmwxbaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obHl5Z3Vrdm1xYnNmbXd4YmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDI5NiwiZXhwIjoyMDg1OTc2Mjk2fQ.b6dQimE0pfuqPMp9K9mYiSwFVV4nu9yrYylJIsHivg4'
);

async function main() {
  await supabase.from('equipment').update({ notes: 'Cadeiras ergonômicas para longas jornadas.\r\n\r\nValor unitário (centavos): 70000' }).eq('id', '413ec0be-fbd6-46e6-be7b-60adb60d7b8b');
  await supabase.from('equipment').update({ notes: 'Climatização de alta potência para o estúdio.\r\n\r\nValor unitário (centavos): 500000' }).eq('id', 'a76e423c-553d-465a-b0cc-72e6026800aa');
  await supabase.from('equipment').update({ notes: 'Luz contínua bicolor de alta potência para gravações profissionais.\r\n\r\nValor unitário (centavos): 280000' }).eq('id', 'd759a32b-a3bd-4295-a146-4125d7e918f3');
  
  // Also globally fix any `çÁes` into `ções` just in case I missed it anywhere
  const { data } = await supabase.from('equipment').select('id, name, notes');
  for (const eq of data) {
      if (eq.notes && eq.notes.includes('çÁes')) {
          await supabase.from('equipment').update({ notes: eq.notes.replace(/çÁes/g, 'ções') }).eq('id', eq.id);
      }
      if (eq.notes && eq.notes.includes('missÁes')) {
          await supabase.from('equipment').update({ notes: eq.notes.replace(/missÁes/g, 'missões') }).eq('id', eq.id);
      }
  }
  
  console.log('Done fixing edge cases!');
}

main();
