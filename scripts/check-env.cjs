const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const BACKUP_PATH = path.join(__dirname, '..', 'supabase-credentials.json');

const DEFAULT_SUPABASE = {
  VITE_SUPABASE_URL: 'https://mnkqfrulcpxpwaftokdi.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua3FmcnVsY3B4cHdhZnRva2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5OTAsImV4cCI6MjA5NzY0Njk5MH0.lsbk4vs8F3uvp4gOqs0Ydz7V7zh04MJqWC919KssRQ0'
};

function checkAndFixEnv() {
  let envContent = '';
  try {
    envContent = fs.readFileSync(ENV_PATH, 'utf8');
  } catch (e) {
    envContent = '';
  }

  let backup = DEFAULT_SUPABASE;
  try {
    if (fs.existsSync(BACKUP_PATH)) {
      backup = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
    }
  } catch (e) {
    backup = DEFAULT_SUPABASE;
  }

  const expectedUrl = backup.VITE_SUPABASE_URL || DEFAULT_SUPABASE.VITE_SUPABASE_URL;
  const expectedKey = backup.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE.VITE_SUPABASE_ANON_KEY;

  const expectedLines = [
    `VITE_SUPABASE_URL=${expectedUrl}`,
    `VITE_SUPABASE_ANON_KEY=${expectedKey}`,
  ];

  const lines = envContent.split(/\r?\n/).filter(line =>
    !line.startsWith('VITE_SUPABASE_URL=') &&
    !line.startsWith('VITE_SUPABASE_ANON_KEY=') &&
    line.trim() !== ''
  );

  const normalizedContent = [...lines, ...expectedLines].join('\n');

  if (envContent.trim() !== normalizedContent.trim()) {
    console.log('⚠️  .env ajustado con variables esenciales...');
    fs.writeFileSync(ENV_PATH, `${normalizedContent}\n`, 'utf8');
    console.log('✅ .env sincronizado correctamente');
  } else {
    console.log('✅ .env verificado');
  }
}

checkAndFixEnv();
