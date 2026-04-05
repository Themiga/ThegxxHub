// auth.js - Supabase Auth integration
const Auth = (() => {
  let _supabase = null;
  let _session = null;
  let _profile = null;
  let _listeners = [];

  async function init() {
    await api.init();
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('O SDK do Supabase nao foi carregado no navegador.');
    }

    const { createClient } = window.supabase;
    _supabase = createClient(api.getUrl(), api.getAnonKey());

    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
      _session = session;
      api.setToken(session.access_token);
      await _loadProfile();
    }

    _supabase.auth.onAuthStateChange(async (event, session) => {
      _session = session;
      if (session) {
        api.setToken(session.access_token);
        await _loadProfile();
      } else {
        api.clearToken();
        _profile = null;
      }
      _notify(event, session);
    });
  }

  async function _loadProfile() {
    try {
      _profile = await api.getMe();
    } catch (e) {
      _profile = null;
    }
  }

  function _notify(event, session) {
    _listeners.forEach(fn => fn(event, session, _profile));
  }

  async function signUp(email, password, username) {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async function signOut() {
    await _supabase.auth.signOut();
  }

  function getSession() { return _session; }
  function getProfile() { return _profile; }
  function getUser() { return _session?.user ?? null; }
  function isLoggedIn() { return !!_session; }
  function isAdmin() { return _profile?.role === 'admin'; }

  function onChange(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }

  async function uploadImage(file) {
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await _supabase.storage.from('thumbnails').upload(name, file, { upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = _supabase.storage.from('thumbnails').getPublicUrl(name);
    return publicUrl;
  }

  return { init, signUp, signIn, signOut, getSession, getProfile, getUser, isLoggedIn, isAdmin, onChange, uploadImage };
})();
