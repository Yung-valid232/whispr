// ============================================================
// MESSAGES HELPERS
// ============================================================

async function submitMessage(receiverUsername, senderEmail, message) {
  if (!isValidEmail(senderEmail)) throw new Error('Please enter a valid Gmail address.');
  if (!senderEmail.toLowerCase().endsWith('@gmail.com')) throw new Error('Only Gmail addresses are accepted.');
  if (!message || message.trim().length === 0) throw new Error('Message cannot be empty.');
  if (message.length > 500) throw new Error('Message must be 500 characters or less.');

  // Get receiver's profile
  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('id')
    .eq('username', receiverUsername)
    .maybeSingle();

  if (profileError || !profile) throw new Error('User not found.');

  const { error } = await db.from('messages').insert({
    receiver_id: profile.id,
    sender_email: sanitize(senderEmail.toLowerCase().trim()),
    message: sanitize(message.trim()),
  });

  if (error) throw new Error(error.message);
}

async function getMyMessages(userId) {
  const { data, error } = await db
    .from('messages')
    .select('id, message, created_at')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// Admin only — fetches everything including sender_email
async function getAllMessages() {
  const { data, error } = await db
    .from('messages')
    .select('id, receiver_id, sender_email, message, created_at, profiles(username)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
