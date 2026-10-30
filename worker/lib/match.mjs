// worker/lib/match.mjs

/**
 * Pure rule evaluation function matching a farmer profile against a scheme.
 * Returns { state: 'MAY_APPLY' | 'NOT_MATCHING' | 'NEED_INFO', reasons: string[] }
 * Note: Per project principles, we NEVER return or display the word "eligible".
 */
export function matchProfileToScheme(profile = {}, schemeId = '', allSchemes = []) {
  if (!schemeId) {
    return { state: 'NEED_INFO', reasons: ['No scheme specified'] };
  }

  // 1. PM-KISAN MATCHING RULES
  if (schemeId === 'pm-kisan') {
    if (profile.land_status === 'landless') {
      return {
        state: 'NOT_MATCHING',
        reasons: ['PM-KISAN is restricted to landholding farmer families with cultivable land.']
      };
    }

    if (profile.exclusion_applies === true) {
      return {
        state: 'NOT_MATCHING',
        reasons: ['Profile indicates one or more institutional/statutory exclusion criteria apply.']
      };
    }

    if (profile.land_status === 'tenant') {
      return {
        state: 'NOT_MATCHING',
        reasons: ['Land ownership records in the beneficiary family name are mandatory.']
      };
    }

    if (profile.land_on_or_before_2019 === false) {
      return {
        state: 'NEED_INFO',
        reasons: ['Land ownership registered after 01-02-2019 requires physical verification (unless acquired via inheritance).']
      };
    }

    if (profile.ekyc_done === 'unsure') {
      return {
        state: 'NEED_INFO',
        reasons: ['e-KYC status is unconfirmed; check status on pmkisan.gov.in portal.']
      };
    }

    if (profile.ekyc_done === 'no') {
      return {
        state: 'MAY_APPLY',
        reasons: ['e-KYC is mandatory to receive instalments; complete biometric or OTP verification.']
      };
    }

    return {
      state: 'MAY_APPLY',
      reasons: ['Landholding and registration criteria satisfied.']
    };
  }

  // 2. NSMNY (Namo Shetkari Mahasanman Nidhi) MATCHING RULES
  if (schemeId === 'nsmny') {
    if (profile.land_status === 'landless') {
      return {
        state: 'NOT_MATCHING',
        reasons: ['NSMNY is provided to landholding farmers in Maharashtra.']
      };
    }

    // Evaluate PM-KISAN dependency
    const pmKisanMatch = matchProfileToScheme(profile, 'pm-kisan', allSchemes);
    if (pmKisanMatch.state === 'NOT_MATCHING') {
      return {
        state: 'NEED_INFO',
        reasons: ['NSMNY benefit is linked to approved registration in PM-KISAN database.']
      };
    }

    return {
      state: 'MAY_APPLY',
      reasons: ['Maharashtra farmers with active PM-KISAN eligibility are covered.']
    };
  }

  // 3. PMFBY (Pradhan Mantri Fasal Bima Yojana) MATCHING RULES
  if (schemeId === 'pmfby') {
    const reasons = [];

    if (!profile.crops || profile.crops.length === 0) {
      return {
        state: 'NEED_INFO',
        reasons: ['Specify your notified crops in profile to verify seasonal insurance coverage.']
      };
    }

    if (!profile.season) {
      return {
        state: 'NEED_INFO',
        reasons: ['Specify your farming season (Kharif/Rabi) to verify cut-off dates.']
      };
    }

    if (profile.land_status === 'tenant' || profile.land_status === 'landless') {
      reasons.push('Tenant/sharecropper farmers may enrol with Gram Panchayat sowing certificate and tenancy declaration.');
    } else {
      reasons.push('Crop and village must be notified in current state notification.');
    }

    if (profile.loanee) {
      reasons.push('Loanee farmers are automatically enrolled through credit bank (opt-out option available).');
    }

    return {
      state: 'MAY_APPLY',
      reasons
    };
  }

  // 4. Default for info-only schemes (pdmc-mh, smam-mh, etc.)
  return {
    state: 'NEED_INFO',
    reasons: ['Information-only scheme. Check specific eligibility and application guidelines on MahaDBT portal.']
  };
}

