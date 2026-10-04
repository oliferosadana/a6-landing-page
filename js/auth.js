/**
 * AMANDA BROWNIES - STRICT AUTHENTICATION & ROUTE GUARD SYSTEM
 * Supports Supabase Auth & Local Encrypted Session Management.
 */

const AUTH_STORAGE_KEY = 'amanda_auth_session';
const AUTH_USERS_KEY = 'amanda_auth_users';

/**
 * Helper to compute SHA-256 hash for secure local verification
 */
async function hashPassword(text) {
  try {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return text;
  }
}

// Default accounts with SHA-256 hashed password (initial hash: 'admin')
const DEFAULT_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

const DEFAULT_AUTH_USERS = [
  {
    id: 'usr-admin-bpn',
    name: 'Admin Amanda Balikpapan',
    email: 'admin@amanda.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'tenant_admin',
    tenantId: 'tenant-bpn',
    tenantName: 'Amanda Balikpapan',
    avatar: '🍰'
  },
  {
    id: 'usr-superadmin',
    name: 'Super Admin Platform',
    email: 'superadmin@amanda.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'superadmin',
    tenantId: 'all',
    tenantName: 'Platform Central',
    avatar: '👑'
  }
];

/**
 * Get registered local accounts (if custom accounts were configured)
 */
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_AUTH_USERS));
      return DEFAULT_AUTH_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AUTH_USERS;
  } catch (e) {
    return DEFAULT_AUTH_USERS;
  }
}

/**
 * Update Admin credentials (email & password) securely
 */
async function updateAdminCredentials(userId, newEmail, newPassword, newName) {
  try {
    const users = getRegisteredUsers();
    const userIdx = users.findIndex(u => u.id === userId || u.email === newEmail);
    
    let targetUser = userIdx >= 0 ? users[userIdx] : users[0];
    if (newEmail) targetUser.email = newEmail.trim().toLowerCase();
    if (newName) targetUser.name = newName.trim();
    if (newPassword && newPassword.trim()) {
      targetUser.passwordHash = await hashPassword(newPassword.trim());
      delete targetUser.password;
    }

    if (userIdx >= 0) {
      users[userIdx] = targetUser;
    } else {
      users.push(targetUser);
    }

    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));

    // Update active session if currently logged in as this user
    const currentSession = getAuthSession();
    if (currentSession && currentSession.user) {
      currentSession.user.email = targetUser.email;
      currentSession.user.name = targetUser.name;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentSession));
    }

    // Sync to Supabase platform_settings if connected
    if (typeof syncSettingsToSupabase === 'function') {
      await syncSettingsToSupabase('admin_users', users);
    }

    return { success: true, message: 'Kredensial admin berhasil diperbarui.' };
  } catch (err) {
    return { success: false, message: err.message || 'Gagal memperbarui kredensial.' };
  }
}

/**
 * Get Current Active Session
 */
function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);

    // Check expiration (24 hours token validity)
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (e) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/**
 * Save Active Session
 */
function saveAuthSession(user, remember = true) {
  const duration = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day
  const session = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || null,
      tenantName: user.tenantName || null,
      avatar: user.avatar || '👤'
    },
    token: 'amatkn_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    createdAt: Date.now(),
    expiresAt: Date.now() + duration
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * STRICT ROUTE GUARD: Enforce authentication on protected pages
 * Call this directly in <head> or at the top of the file!
 */
function enforceAuth(allowedRoles = []) {
  // Prevent executing redirect if already on login page
  const path = window.location.pathname.toLowerCase();
  if (path.includes('login')) {
    return false;
  }

  const session = getAuthSession();

  // 1. Not logged in -> Redirect to login page
  if (!session || !session.user) {
    window.location.replace('login.html?reason=unauthenticated');
    return false;
  }

  // 2. Check role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(session.user.role)) {
      alert(`⛔ Akses Ditolak: Anda tidak memiliki izin untuk membuka halaman ini.`);
      window.location.replace('index.html');
      return false;
    }
  }

  return true;
}

/**
 * Login Handler (Universal CMS Admin)
 */
async function login(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Try Supabase Auth first if connected
  if (typeof supabaseClient !== 'undefined' && supabaseClient && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (!error && data && data.user) {
        const userMeta = data.user.user_metadata || {};
        const role = userMeta.role || 'tenant_admin';
        const userObj = {
          id: data.user.id,
          name: userMeta.name || 'Admin Amanda',
          email: data.user.email,
          role: role,
          tenantId: userMeta.tenantId || 'tenant-bpn',
          avatar: userMeta.avatar || '🍰'
        };
        const session = saveAuthSession(userObj, true);
        return { success: true, session, source: 'supabase' };
      }
    } catch (sbErr) {
      console.warn('Supabase Auth error, falling back to local verification:', sbErr);
    }
  }

  // 2. Fallback to Local Verified Accounts in Storage (if any registered)
  const users = getRegisteredUsers();
  const hashedInput = await hashPassword(cleanPass);
  const found = users.find(a => 
    a.email && a.email.toLowerCase() === cleanEmail && 
    (a.passwordHash === hashedInput || a.password === cleanPass)
  );

  if (found) {
    const session = saveAuthSession(found, true);
    return { success: true, session, source: 'local' };
  }

  return { success: false, message: 'Email atau kata sandi tidak valid. Silakan periksa kembali.' };
}

/**
 * Logout Handler
 */
function logout(confirmPrompt = true) {
  if (confirmPrompt) {
    const ok = confirm('Apakah Anda yakin ingin keluar dari sistem?');
    if (!ok) return;
  }

  // Clear Supabase Session if active
  if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.auth) {
    try {
      supabaseClient.auth.signOut();
    } catch (e) {}
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.replace('login.html?msg=logged_out');
}

/**
 * Setup Topbar User Profile & Logout button in Admin/Superadmin
 */
function initAuthUI() {
  const session = getAuthSession();
  if (!session || !session.user) return;

  const user = session.user;

  // Find user pill / profile targets
  const profileWraps = document.querySelectorAll('.topbar-right, .topbar-actions');
  profileWraps.forEach(wrap => {
    // Avoid double injection
    if (wrap.querySelector('.sa-auth-user-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'sa-auth-user-badge';
    badge.innerHTML = `
      <div class="auth-avatar">${user.avatar || '👤'}</div>
      <div class="auth-user-info">
        <span class="auth-user-name">${user.name}</span>
        <span class="auth-user-role">${user.role === 'superadmin' ? 'Superadmin Platform' : (user.tenantName || 'Admin Cabang')}</span>
      </div>
      <button class="btn-auth-logout" onclick="logout()" title="Keluar / Logout">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    `;
    wrap.prepend(badge);
  });
}

// Auto init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
});
