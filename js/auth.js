// ============================================================
// AUTH HELPERS
// ============================================================

function sanitize(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

async function handleSignup(email, password, username) {
  if (!isValidEmail(email)) throw new Error('Invalid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (!isValidUsername(username)) throw new Error('Username must be 3–20 chars, lowercase letters, numbers, or underscores.');

  // Check username availability
  const { data: existing } = await db.from('profiles').select('id').eq('username', username).maybeSingle();
  if (existing) throw new Error('Username already taken. Try another.');

  // Sign up user with username stored in metadata
  const { data, error } = await db.auth.signUp({ 
    email, 
    password,
    options: {
      data: { username }  // store username in user metadata
    }
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Signup failed. Please try again.');

  // Insert profile immediately (works even before email confirmation)
  const { error: profileError } = await db.from('profiles').insert({ 
    id: data.user.id, 
    username 
  });

  if (profileError) {
    // If profile already exists (from trigger), ignore the error
    if (!profileError.message.includes('duplicate') && !profileError.message.includes('unique')) {
      throw new Error(profileError.message);
    }
  }

  return username;
}

async function handleLogin(email, password) {
  if (!isValidEmail(email)) throw new Error('Invalid email address.');
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

async function handleLogout() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

async function requireAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

async function getCurrentProfile(userId) {
  const { data } = await db.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data;
}