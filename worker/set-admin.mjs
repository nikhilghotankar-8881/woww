// worker/set-admin.mjs
import { requireSupabase } from './lib/supabase.mjs';

async function setAdmin() {
  const target = process.argv[2];
  if (!target) {
    console.log('Usage: node set-admin.mjs <USER_UUID_OR_EMAIL>');
    process.exit(1);
  }

  const supabase = requireSupabase();
  console.log(`[Admin] Setting admin privileges for: ${target}`);

  // Check if target is UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);

  if (isUUID) {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: target, is_admin: true }, { onConflict: 'user_id' });

    if (error) {
      console.error('[Admin] Error granting admin:', error.message);
    } else {
      console.log(`[Admin] User ${target} successfully granted admin role.`);
    }
  } else {
    // Look up by email
    const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
    if (userErr) {
      console.error('[Admin] Failed to list users:', userErr.message);
      process.exit(1);
    }

    const matched = users.users.find(u => u.email === target);
    if (!matched) {
      console.error(`[Admin] User with email ${target} not found.`);
      process.exit(1);
    }

    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: matched.id, is_admin: true }, { onConflict: 'user_id' });

    if (error) {
      console.error('[Admin] Error granting admin:', error.message);
    } else {
      console.log(`[Admin] User ${target} (ID: ${matched.id}) successfully granted admin role.`);
    }
  }
}

setAdmin().catch(err => {
  console.error('[Admin Fatal Error]:', err);
  process.exit(1);
});

