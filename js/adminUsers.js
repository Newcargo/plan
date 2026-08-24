import { supabase } from './supabaseClient.js';

// Ruft die admin-users Edge Function auf und liest bei einem Fehler die echte Meldung
// aus dem Response-Body ("error"-Feld), statt der generischen supabase-js-Meldung
// ("Edge Function returned a non-2xx status code").
export async function invokeAdminUsers(body) {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    let message = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errBody = await error.context.json();
        if (errBody && errBody.error) message = errBody.error;
      }
    } catch (_) { /* Fallback bleibt die generische Meldung */ }
    return { data: null, error: message };
  }

  if (data && data.error) return { data, error: data.error };
  return { data, error: null };
}
