const { createClient } = require('@supabase/supabase-js');

const path = require('path');
// Ensure env vars are loaded
if (!process.env.SUPABASE_URL) {
    require('dotenv').config({ path: path.join(__dirname, '../../../private/.env.server') });
    // Fallback
    require('dotenv').config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
