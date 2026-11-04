// worker/lib/fanout.mjs
import { matchProfileToScheme } from './match.mjs';
import { dispatchOutboundAlerts } from './notify.mjs';

/**
 * Fans out an approved change into personalized alerts for eligible farmer profiles.
 * Executes when a human reviewer sets review_status = 'approved'.
 */
export async function fanoutChange(changeId, supabaseClient) {
  if (!changeId || !supabaseClient) {
    throw new Error('changeId and supabaseClient are required for fanout');
  }

  // 1. Fetch change record
  const { data: change, error: changeErr } = await supabaseClient
    .from('changes')
    .select('*')
    .eq('id', changeId)
    .single();

  if (changeErr || !change) {
    throw new Error(`Change ${changeId} not found: ${changeErr?.message}`);
  }

  if (change.review_status !== 'approved') {
    console.log(`[Fanout] Change ${changeId} is not approved (status: ${change.review_status}). Skipping.`);
    return 0;
  }

  if (change.fanned_out_at) {
    console.log(`[Fanout] Change ${changeId} was already fanned out at ${change.fanned_out_at}. Skipping.`);
    return 0;
  }

  // 2. Fetch all profiles
  const { data: profiles, error: profileErr } = await supabaseClient
    .from('profiles')
    .select('*');

  if (profileErr) {
    throw new Error(`Failed to fetch profiles for fanout: ${profileErr.message}`);
  }

  if (!profiles || profiles.length === 0) {
    console.log('[Fanout] No profiles registered yet to receive alerts.');
    await supabaseClient
      .from('changes')
      .update({ fanned_out_at: new Date().toISOString() })
      .eq('id', changeId);
    return 0;
  }

  // 3. For each profile and each relevant scheme, evaluate matching rules
  const schemeIds = change.scheme_ids && change.scheme_ids.length > 0
    ? change.scheme_ids
    : ['pm-kisan'];

  const alertsToInsert = [];

  for (const profile of profiles) {
    for (const schemeId of schemeIds) {
      const matchResult = matchProfileToScheme(profile, schemeId);

      // We alert farmers who MAY_APPLY or NEED_INFO to take action
      if (matchResult.state === 'MAY_APPLY' || matchResult.state === 'NEED_INFO') {
        alertsToInsert.push({
          user_id: profile.id,
          change_id: change.id,
          scheme_id: schemeId,
          match_state: matchResult.state,
          reasons: matchResult.reasons,
          headline: change.summary || `${schemeId.toUpperCase()} Official Notice Update`,
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // 4. Insert alerts in batch
  let insertedCount = 0;
  const outboundQueue = [];

  if (alertsToInsert.length > 0) {
    const { data: inserted, error: insertErr } = await supabaseClient
      .from('alerts')
      .insert(alertsToInsert)
      .select('id, user_id, scheme_id');

    if (insertErr) {
      throw new Error(`Failed to insert fanned out alerts: ${insertErr.message}`);
    }
    insertedCount = inserted?.length || alertsToInsert.length;

    // Map inserted alerts to profiles for WhatsApp/SMS dispatch
    for (const alt of (inserted || [])) {
      const matchedProfile = profiles.find(p => p.id === alt.user_id);
      if (matchedProfile && matchedProfile.phone) {
        outboundQueue.push({
          alertId: alt.id,
          profile: matchedProfile,
          schemeId: alt.scheme_id,
          reasons: alertsToInsert.find(a => a.user_id === alt.user_id && a.scheme_id === alt.scheme_id)?.reasons || []
        });
      }
    }
  }

  // 5. Dispatch multi-channel outbound alerts (WhatsApp & SMS)
  if (outboundQueue.length > 0) {
    console.log(`[Fanout] Dispatching outbound WhatsApp/SMS notifications to ${outboundQueue.length} registered farmers...`);
    await dispatchOutboundAlerts(outboundQueue, change, supabaseClient);
  }

  // 6. Mark change as fanned out
  await supabaseClient
    .from('changes')
    .update({ fanned_out_at: new Date().toISOString() })
    .eq('id', changeId);

  console.log(`[Fanout] Change ${changeId} fanned out successfully: ${insertedCount} in-app alerts and outbound messages queued.`);
  return insertedCount;
}

/**
 * Scans for any approved changes that have not yet been fanned out.
 */
export async function fanoutPendingApproved(supabaseClient) {
  if (!supabaseClient) return 0;

  const { data: pendingChanges, error } = await supabaseClient
    .from('changes')
    .select('id')
    .eq('review_status', 'approved')
    .is('fanned_out_at', null);

  if (error || !pendingChanges) return 0;

  let totalFanned = 0;
  for (const ch of pendingChanges) {
    try {
      totalFanned += await fanoutChange(ch.id, supabaseClient);
    } catch (err) {
      console.error(`[Fanout] Error processing change ${ch.id}:`, err.message);
    }
  }
  return totalFanned;
}

