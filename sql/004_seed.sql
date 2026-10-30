-- 004_seed.sql
-- Direct SQL seed for Shetkari SuchnaSetu Schemes and Sources

-- Insert Schemes
INSERT INTO public.schemes (id, name, name_mr, name_hi, category, level, nodal_body, rule_set, facts, documents, steps, official_links, summary_mr, summary_hi)
VALUES
(
  'pm-kisan',
  'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
  'प्रधानमंत्री किसान सन्मान निधी',
  'प्रधानमंत्री किसान सम्मान निधि',
  'income-support',
  'central',
  'Ministry of Agriculture & Farmers Welfare, GoI',
  'pm-kisan',
  '{
    "annual_benefit": {
      "value": "₹6,000 per year in three equal instalments of ₹2,000 directly transferred to bank accounts.",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    },
    "ekyc_mandatory": {
      "value": "e-KYC is mandatory for all PM-KISAN registered farmers. OTP-based e-KYC available on PMKISAN Portal or biometric at nearest CSC centres.",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    },
    "landholding_eligibility": {
      "value": "All landholding farmer families with cultivable land in their names are eligible (institutional landholders and defined exclusion criteria apply).",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    },
    "land_cut_off_date": {
      "value": "Land ownership transfer cut-off date is 01-02-2019. Land acquired after this date is subject to physical verification (exceptions for inheritance upon death of landowner).",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    },
    "latest_instalment": {
      "value": "Official portal lists 22nd instalment released 13 Mar 2026; secondary news reported 23rd instalment in Jun 2026.",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "conflict"
    },
    "helpline": {
      "value": "Toll Free Helpline: 155261 / 011-24300606",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    }
  }'::jsonb,
  '[
    "Aadhaar Card linked with active bank account",
    "Landholding records (7/12 extract / 8A extract in Maharashtra)",
    "Bank Account details with active DBT"
  ]'::jsonb,
  '[
    "Visit pmkisan.gov.in or CSC Center",
    "Verify Aadhaar and complete biometric / OTP e-KYC",
    "Ensure land records are linked with your PM-KISAN beneficiary status"
  ]'::jsonb,
  '[
    {"label": "PM-KISAN Official Portal", "url": "https://pmkisan.gov.in/"},
    {"label": "Know Your Status Portal", "url": "https://pmkisan.gov.in/BeneficiaryStatus_New.aspx"}
  ]'::jsonb,
  '{"text": "शेतकरी कुटुंबांसाठी वार्षिक ₹६,००० चे उत्पन्न सहाय्य (३ समान हप्त्यांमध्ये). ई-केवायसी आणि बँक खात्याशी आधार जोडणी अनिवार्य आहे.", "reviewedBy": "Marathi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb,
  '{"text": "पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता (3 किस्तों में)। ई-केवाईसी और बैंक खाते से आधार लिंक होना अनिवार्य है।", "reviewedBy": "Hindi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb
),
(
  'nsmny',
  'Namo Shetkari Mahasanman Nidhi Yojana (NSMNY)',
  'नमो शेतकरी महासन्मान निधी योजना',
  'नमो शेतकरी महासम्मान निधि योजना',
  'income-support',
  'state',
  'Department of Agriculture, Government of Maharashtra',
  'nsmny',
  '{
    "annual_benefit": {
      "value": "Government of Maharashtra provides ₹6,000 per year (3 instalments of ₹2,000). A news wire cited proposal for increase to ₹9,000 (unresolved GR).",
      "sourceUrl": "https://mahadbt.maharashtra.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "conflict"
    },
    "link_to_pmkisan": {
      "value": "Beneficiaries must be actively approved and registered under PM-KISAN in Maharashtra. No separate registration required.",
      "sourceUrl": "https://mahadbt.maharashtra.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    },
    "helpline": {
      "value": "Maharashtra Kisan Helpline: 1800-233-4000",
      "sourceUrl": "https://mahadbt.maharashtra.gov.in/",
      "verifiedOn": null,
      "verifiedBy": null,
      "status": "unverified"
    }
  }'::jsonb,
  '[
    "PM-KISAN active registration number",
    "Aadhaar-seeded bank account in Maharashtra"
  ]'::jsonb,
  '[
    "Ensure eligibility and approval under PM-KISAN",
    "Verify Aadhaar seeding status with Maharashtra agriculture department database"
  ]'::jsonb,
  '[
    {"label": "MahaDBT Agriculture Portal", "url": "https://mahadbt.maharashtra.gov.in/"}
  ]'::jsonb,
  '{"text": "महाराष्ट्र शासनातर्फे पीएम-किसान लाभार्थ्यांना अतिरिक्त ₹६,००० वार्षिक सहाय्य थेट बँक खात्यात.", "reviewedBy": "Marathi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb,
  '{"text": "महाराष्ट्र सरकार द्वारा पीएम-किसान लाभार्थियों को प्रति वर्ष ₹6,000 की अतिरिक्त सहायता।", "reviewedBy": "Hindi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb
),
(
  'pmfby',
  'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
  'प्रधानमंत्री पीक विमा योजना',
  'प्रधानमंत्री फसल बीमा योजना',
  'insurance',
  'central',
  'Ministry of Agriculture & Farmers Welfare, GoI / State Dept of Agriculture',
  'pmfby',
  '{
    "farmer_premium_share": {
      "value": "Standard farmer premium share: Kharif food/oilseeds 2%, Rabi food/oilseeds 1.5%, Commercial / Horticultural crops 5% of sum insured.",
      "sourceUrl": "https://pmfby.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    },
    "maharashtra_one_rupee_model": {
      "value": "The earlier ₹1 token premium scheme in Maharashtra was discontinued in 2025; standard state operational guidelines apply.",
      "sourceUrl": "https://pmfby.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    },
    "rabi_cutoff_date": {
      "value": "Enrolment cut-off date is notified by the state government for each notified crop and district. Indicative cut-off is 15 Dec - 31 Dec.",
      "sourceUrl": "https://pmfby.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "conflict"
    },
    "calamity_intimation": {
      "value": "Crop loss due to localized calamity or post-harvest loss must be reported within 72 hours via Crop Insurance App or helpline 14447.",
      "sourceUrl": "https://pmfby.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "verified"
    }
  }'::jsonb,
  '[
    "Land Record (7/12 & 8A / Land possession certificate)",
    "Sowing Certificate / Declaration from Gram Panchayat or Patwari",
    "Bank Passbook / account details",
    "Tenant agreement / declaration (for non-owner farmers)"
  ]'::jsonb,
  '[
    "Confirm if your crop and village are notified for the current season",
    "Apply via Bank, CSC Center, or PMFBY portal before the season deadline",
    "Save acknowledgment receipt and insurance policy copy"
  ]'::jsonb,
  '[
    {"label": "PMFBY National Portal", "url": "https://pmfby.gov.in/"}
  ]'::jsonb,
  '{"text": "नैसर्गिक आपत्तींमुळे पिकांचे नुकसान झाल्यास व्यापक विमा संरक्षण. रब्बी पिकांसाठी १.५% व खरीप पिकांसाठी २% शेतकरी प्रीमियम हिस्सा.", "reviewedBy": "Marathi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb,
  '{"text": "फसल नुकसान की स्थिति में वित्तीय सुरक्षा। रबी फसलों के लिए 1.5% और खरीफ फसलों के लिए 2% किसान प्रीमियम हिस्सा।", "reviewedBy": "Hindi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb
),
(
  'pdmc-mh',
  'Per Drop More Crop (Micro-Irrigation) — Maharashtra',
  'प्रति थेंब अधिक पीक (सूक्ष्म सिंचन) — महाराष्ट्र',
  'प्रति बूंद अधिक फसल (सूक्ष्म सिंचाई) — महाराष्ट्र',
  'irrigation',
  'central',
  'Ministry of Agriculture / MahaDBT Maharashtra',
  NULL,
  '{
    "parent_scheme": {
      "value": "Operated under PM-RKVY (earlier under PMKSY). Provides subsidy for drip and sprinkler irrigation.",
      "sourceUrl": "https://mahadbt.maharashtra.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "Shetkari SuchnaSetu Review Team",
      "status": "conflict"
    },
    "application_route": {
      "value": "Online application mandatory through Maharashtra MahaDBT Farmer Schemes portal.",
      "sourceUrl": "https://mahadbt.maharashtra.gov.in/",
      "verifiedOn": null,
      "verifiedBy": null,
      "status": "unverified"
    }
  }'::jsonb,
  '[
    "7/12 extract showing water source / well / borewell",
    "Electricity bill / source verification",
    "Quotation from authorized micro-irrigation dealer"
  ]'::jsonb,
  '[
    "Register on MahaDBT Farmer portal",
    "Select Micro-Irrigation (Drip / Sprinkler)",
    "Upload quotations and await lottery / pre-sanction letter"
  ]'::jsonb,
  '[
    {"label": "MahaDBT Micro Irrigation", "url": "https://mahadbt.maharashtra.gov.in/"}
  ]'::jsonb,
  '{"text": "ठिबक व तुषार सिंचन पद्धतीसाठी शासकीय अनुदान. महाडीबीटी पोर्टलद्वारे अर्ज करणे आवश्यक.", "reviewedBy": "Marathi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb,
  '{"text": "ड्रिप और स्प्रिंकलर सिंचाई प्रणाली पर सरकारी सब्सिडी। महाडीबीटी पोर्टल के माध्यम से आवेदन।", "reviewedBy": "Hindi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb
),
(
  'smam-mh',
  'Sub-Mission on Agricultural Mechanization (SMAM) — Maharashtra',
  'कृषी यांत्रिकीकरण उप-अभियान — महाराष्ट्र',
  'कृषि यंत्रीकरण उप-मिशन — महाराष्ट्र',
  'mechanization',
  'central',
  'Ministry of Agriculture / MahaDBT Maharashtra',
  NULL,
  '{
    "objective": {
      "value": "Financial assistance / subsidy for procurement of agricultural equipment and farm machinery (tractors, rotavators, harvesters, etc.).",
      "sourceUrl": "https://mahadbt.maharashtra.gov.in/",
      "verifiedOn": null,
      "verifiedBy": null,
      "status": "unverified"
    },
    "selection_mode": {
      "value": "Computerized online lottery system conducted on MahaDBT portal for transparent allocation.",
      "sourceUrl": "https://mahadbt.maharashtra.gov.in/",
      "verifiedOn": null,
      "verifiedBy": null,
      "status": "unverified"
    }
  }'::jsonb,
  '[
    "Landholding records (7/12 & 8A)",
    "Aadhaar Card and Caste certificate (if applicable for enhanced subsidy)",
    "Quotation from authorized machinery dealer"
  ]'::jsonb,
  '[
    "Submit application on MahaDBT Farmer Schemes",
    "Participate in district computer lottery draw",
    "Purchase machinery upon receiving pre-sanction and upload invoice"
  ]'::jsonb,
  '[
    {"label": "MahaDBT Agriculture Mechanization", "url": "https://mahadbt.maharashtra.gov.in/"}
  ]'::jsonb,
  '{"text": "ट्रॅक्टर, रोटाव्हेटर व इतर कृषी अवजारांच्या खरेदीसाठी अनुदान योजना. महाडीबीटी सोडत पद्धतीने निवड.", "reviewedBy": "Marathi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb,
  '{"text": "ट्रैक्टर, रोटावेटर और अन्य कृषि उपकरणों की खरीद पर सरकारी सहायता। महाडीबीटी लॉटरी द्वारा चयन।", "reviewedBy": "Hindi Verification Lead", "reviewedOn": "2026-10-30"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_mr = EXCLUDED.name_mr,
  name_hi = EXCLUDED.name_hi,
  facts = EXCLUDED.facts,
  rule_set = EXCLUDED.rule_set,
  summary_mr = EXCLUDED.summary_mr,
  summary_hi = EXCLUDED.summary_hi;

-- Insert Sources
INSERT INTO public.sources (id, name, url, type, selector, ignore_patterns, scheme_ids, scheme_aliases, interval_min, mode, status, robots_ok, tos_note)
VALUES
(
  'pmkisan-home',
  'PM-KISAN National Portal Banner & Notices',
  'https://pmkisan.gov.in/',
  'page',
  '.notification-box, .banner-text, #ContentPlaceHolder1_div_notice, body',
  ARRAY['period\\s*wise\\s*number\\s*of\\s*farmers', 'visitor\\s*count', 'last\\s*updated\\s*on', 'total\\s*transferred'],
  ARRAY['pm-kisan'],
  '{"pm-kisan": ["pm-?kisan", "kisan samman", "सम्मान निधि", "सन्मान निधी", "हप्ता", "instalment"]}'::jsonb,
  60,
  'auto',
  'ok',
  TRUE,
  'Public banner notice area monitored politely; session parameters stripped.'
),
(
  'pib-agri',
  'PIB Ministry of Agriculture Press Releases',
  'https://pib.gov.in/',
  'listing',
  '.release-list, ul.content-list, item',
  ARRAY[]::TEXT[],
  ARRAY['pm-kisan', 'pmfby'],
  '{"pm-kisan": ["pm-?kisan", "kisan samman", "instalment released"], "pmfby": ["crop insurance", "fasal bima", "pmfby", "rabi cut-off", "kharif"]}'::jsonb,
  60,
  'auto',
  'ok',
  TRUE,
  'PIB official releases with native publication timestamps for delay measurement.'
),
(
  'pmfby-portal',
  'PMFBY National Crop Insurance Portal',
  'https://pmfby.gov.in/',
  'page',
  '.notification-marquee, .news-alerts, body',
  ARRAY['last\\s*updated', 'current\\s*time'],
  ARRAY['pmfby'],
  '{"pmfby": ["fasal bima", "pmfby", "cut-off", "last date", "deadline", "premium"]}'::jsonb,
  60,
  'auto',
  'ok',
  TRUE,
  'National crop insurance portal public announcements.'
),
(
  'mh-agri-gr',
  'Maharashtra Department of Agriculture Government Resolutions (GR)',
  'https://krishi.maharashtra.gov.in/',
  'listing',
  '.circulars, .gr-list, table',
  ARRAY[]::TEXT[],
  ARRAY['nsmny', 'pmfby', 'pdmc-mh', 'smam-mh'],
  '{"nsmny": ["नमो शेतकरी", "महासन्मान"], "pmfby": ["पीक विमा", "अधिसूचना"], "pdmc-mh": ["सूक्ष्म सिंचन", "ठिबक सिंचन"], "smam-mh": ["कृषी यांत्रिकीकरण", "अवजारे"]}'::jsonb,
  120,
  'manual',
  'manual',
  TRUE,
  'State circulars; scanned Marathi PDFs require human reviewer validation.'
),
(
  'nsmny-portal',
  'Namo Shetkari Portal',
  'https://nsmny.mahait.org/',
  'page',
  'body',
  ARRAY[]::TEXT[],
  ARRAY['nsmny'],
  '{"nsmny": ["हप्ता", "nsmny", "namo shetkari"]}'::jsonb,
  120,
  'manual',
  'manual',
  TRUE,
  'Domain verification ongoing; marked manual until permanent endpoint is locked.'
),
(
  'mahadbt-public',
  'MahaDBT Farmer Schemes Public Portal',
  'https://mahadbt.maharashtra.gov.in/',
  'page',
  'body',
  ARRAY[]::TEXT[],
  ARRAY['pdmc-mh', 'smam-mh'],
  '{}'::jsonb,
  240,
  'manual',
  'manual',
  TRUE,
  'Direct application route. Monitored in link-only mode without automated scraping.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  status = EXCLUDED.status,
  selector = EXCLUDED.selector,
  ignore_patterns = EXCLUDED.ignore_patterns;

