// ============================================================
// MESSAGES HELPERS
// ============================================================

async function submitMessage(receiverUsername, senderEmail, message) {
  if (!message || message.trim().length === 0) throw new Error('Message cannot be empty.');
  if (message.length > 500) throw new Error('Message must be 500 characters or less.');

  // Get receiver's profile
  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('id')
    .eq('username', receiverUsername)
    .maybeSingle();

  if (profileError || !profile) throw new Error('User not found.');

  const deviceInfo = getDeviceInfo();

  let ip_address = 'Unknown';
  let location = 'Unknown';
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    ip_address = data.ip || 'Unknown';
    location = [data.city, data.region, data.country_name].filter(Boolean).join(', ') || 'Unknown';
  } catch (e) {
    ip_address = 'Unknown';
    location = 'Unknown';
  }

  const { error } = await db.from('messages').insert({
    receiver_id: profile.id,
    sender_email: senderEmail.toLowerCase().trim(),
    message: sanitize(message.trim()),
    device_type: deviceInfo.device,
    browser: deviceInfo.browser,
    ip_address,
    location,
  });

  if (error) throw new Error(error.message);
}

function getDeviceInfo() {
  const ua = navigator.userAgent;

  let device = 'Desktop';
  if (/iPad/i.test(ua)) device = 'iPad';
  else if (/iPhone/i.test(ua)) device = 'iPhone';
  else if (/Android.*Mobile/i.test(ua)) device = 'Android Phone';
  else if (/Android/i.test(ua)) device = 'Android Tablet';

  let browser = 'Unknown';
  if (/CriOS/i.test(ua)) browser = 'Chrome (iOS)';
  else if (/FxiOS/i.test(ua)) browser = 'Firefox (iOS)';
  else if (/EdgA/i.test(ua)) browser = 'Edge (Android)';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/MSIE|Trident/i.test(ua)) browser = 'Internet Explorer';

  return { device, browser };
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

async function getAllMessages() {
  const { data, error } = await db
    .from('messages')
    .select('id, receiver_id, sender_email, message, created_at, device_type, browser, ip_address, location, profiles(username)')
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
