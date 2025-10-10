// Simple script to run database migration
// Run this with: node run-migration.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Add tone column
    const { error: toneError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE voice_assistants ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'friendly';"
    });
    
    if (toneError) {
      console.error('Error adding tone column:', toneError);
    } else {
      console.log('✅ Added tone column');
    }
    
    // Add language column
    const { error: languageError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE voice_assistants ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';"
    });
    
    if (languageError) {
      console.error('Error adding language column:', languageError);
    } else {
      console.log('✅ Added language column');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
