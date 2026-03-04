// ============================================================
// SUPABASE CONFIGURATION
// Replace these values if you ever change your Supabase project
// ============================================================
const SUPABASE_URL = 'https://xltqgxnfxewvpqvwxhjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdHFneG5meGV3dnBxdnd4aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODI4OTIsImV4cCI6MjA4ODA1ODg5Mn0.6r8jH4t5NWkJX9ZePqCQJPKogkxoKZIb2ZYemRYDKqA';

// Admin email — only this email can access admin.html
const ADMIN_EMAIL = 'yungvalid9@gmail.com'; // <-- CHANGE THIS

// Load Supabase from CDN (included in each HTML file via <script>)
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
