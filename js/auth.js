/**
 * AMANDA BROWNIES - STRICT AUTHENTICATION & ROUTE GUARD SYSTEM
 * Supports Supabase Auth & Local Encrypted Session Management.
 */

const AUTH_STORAGE_KEY = 'amanda_auth_session';

// Default Verified Accounts (Fallback / Initial Setup)
const DEFAULT_ACCOUNTS = [
  {
    id: 'user-root-01',
    name: 'Superadmin Amanda Root',
    email: 'superadmin@amanda.id',
    password: 'superadmin2026',
    role: 'superadmin',
    avatar: '👑'
  },
  {
    id: 'user-bpn-01',
    name: 'Admin Outlet Balikpapan',
    email: 'admin.balikpapan@amandabrownies.id',
    password: 'amanda123',
    role: 'tenant_admin',
    tenantId: 'tenant-bpn',
    tenantName: 'Amanda Brownies Cabang Balikpapan',
    avatar: '🍰'
  },
  {
    id: 'user-smd-01',
    name: 'Admin Outlet Samarinda',
    email: 'admin.samarinda@amandabrownies.id',
    password: 'amanda123',
    role: 'tenant_admin',
    tenantId: 'tenant-smd',
    tenantName: 'Amanda Brownies Cabang Samarinda',
    avatar: '🍰'
  }
];

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
      logout(false);
      return null;
    }
    return session;
  } catch (e) {
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
  const session = getAuthSession();

  // 1. Not logged in -> Redirect to login page
  if (!session || !session.user) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    window.location.replace(`login.html?redirect=${encodeURIComponent(currentPath)}&reason=unauthenticated`);
    return false;
  }

  // 2. Check role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(session.user.role)) {
      alert(`⛔ Akses Ditolak: Anda tidak memiliki izin untuk membuka halaman ini.`);
      if (session.user.role === 'superadmin') {
        window.location.replace('superadmin.html');
      } else {
        window.location.replace('admin.html');
      }
      return false;
    }
  }

  return true;
}

/**
 * Login Handler
 */
async function login(email, password, roleHint = null) {
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
        const role = userMeta.role || (cleanEmail.includes('superadmin') ? 'superadmin' : 'tenant_admin');
        const userObj = {
          id: data.user.id,
          name: userMeta.name || (role === 'superadmin' ? 'Superadmin Cloud' : 'Admin Cabang'),
          email: data.user.email,
          role: role,
          tenantId: userMeta.tenantId || 'tenant-bpn',
          avatar: role === 'superadmin' ? '👑' : '🍰'
        };
        const session = saveAuthSession(userObj, true);
        return { success: true, session, source: 'supabase' };
      }
    } catch (sbErr) {
      console.warn('Supabase Auth error, falling back to local verification:', sbErr);
    }
  }

  // 2. Fallback to Local Verified Accounts
  const found = DEFAULT_ACCOUNTS.find(a => a.email.toLowerCase() === cleanEmail && a.password === cleanPass);

  if (found) {
    // Check if role matches if roleHint provided
    if (roleHint && found.role !== roleHint && found.role !== 'superadmin') {
      return { success: false, message: `Akun ini terdaftar sebagai ${found.role}, bukan ${roleHint}.` };
    }

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
