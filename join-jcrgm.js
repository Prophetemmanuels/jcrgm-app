/* ==========================================================================
   JCRGM — NEWCOMER & MEMBERSHIP APPLICATION ENGINE
   --------------------------------------------------------------------------
   • Complete newcomer / join-the-ministry questionnaire (renders itself)
   • Draft autosave, step validation
   • Download the completed questionnaire as a real PDF (no libraries)
   • Send to WhatsApp 0979 554 970 (file share where supported, else text)
   • Approval gate: only an approved applicant may proceed to Membership
   • Leadership review panel (approve / decline + approval code)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- config */
  var CFG = {
    church: 'Jesus Christ Redeems Global Ministries',
    short: 'JCRGM',
    phoneLocal: '0979554970',
    phoneIntl: '260979554970',
    email: 'pedahzurministries@gmail.com',
    keys: {
      draft: 'jcrgm_join_draft_v1',
      apps: 'jcrgm_join_apps_v1',        // applications submitted on THIS device
      approved: 'jcrgm_join_approved_v1' // {ref, name, phone, when}
    },
    minWhy: 80,
    minDetail: 40
  };

  var A = {};                 // answers
  var submitted = null;       // current application record
  var step = 0;

  /* ------------------------------------------------------------- utils */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function today() { var d = new Date(); return d.toISOString().slice(0, 10); }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

  /* =======================================================================
     THE QUESTIONNAIRE
     type: text|tel|email|date|number|textarea|select|radio|checkgroup|check|note
     ===================================================================== */
  var SECTIONS = [
    /* ------------------------------------------------------------ A */
    {
      id: 'personal', ico: '👤', step: 0,
      title: 'Personal Details',
      sub: 'Write exactly as it appears on your NRC or passport.',
      fields: [
        { k: 'fullName', label: 'Full name (as on NRC / passport)', type: 'text', req: 1, wide: 1, ph: 'e.g. Chanda Mulenga Peter' },
        { k: 'preferredName', label: 'Name you prefer to be called', type: 'text', ph: 'e.g. Peter' },
        { k: 'gender', label: 'Gender', type: 'select', req: 1, opts: ['Male', 'Female'] },
        { k: 'dob', label: 'Date of birth', type: 'date', req: 1 },
        { k: 'marital', label: 'Marital status', type: 'select', req: 1, opts: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'] },
        { k: 'nationality', label: 'Nationality', type: 'text', ph: 'e.g. Zambian', val: 'Zambian' },
        { k: 'nrc', label: 'NRC / Passport number', type: 'text', ph: 'e.g. 123456/11/1' },
        { k: 'phone', label: 'Mobile number (WhatsApp)', type: 'tel', req: 1, ph: '09xx xxx xxx' },
        { k: 'phone2', label: 'Alternative number', type: 'tel', ph: 'Optional' },
        { k: 'email', label: 'Email address', type: 'email', ph: 'Optional' },
        { k: 'area', label: 'Area / compound you live in', type: 'text', req: 1, ph: 'e.g. Chilenje, Lusaka' },
        { k: 'address', label: 'Residential / postal address', type: 'textarea', rows: 2 },
        { k: 'yearsArea', label: 'How long have you lived in that area?', type: 'select', opts: ['Less than 1 year', '1 – 3 years', '4 – 10 years', 'Over 10 years', 'All my life'] },
        { k: 'occupation', label: 'Occupation / what you do for a living', type: 'text', ph: 'e.g. Teacher, Trader, Driver, Student' },
        { k: 'employer', label: 'Employer / business name', type: 'text', ph: 'Optional' },
        { k: 'education', label: 'Highest level of education', type: 'select', opts: ['None', 'Primary', 'Secondary / Grade 12', 'Certificate', 'Diploma', 'Degree', 'Postgraduate'] },
        { k: 'languages', label: 'Languages you speak', type: 'text', ph: 'e.g. Bemba, Nyanja, English' }
      ]
    },

    /* ------------------------------------------------------------ B */
    {
      id: 'family', ico: '🏠', step: 0,
      title: 'Family & Household',
      sub: 'So the church knows how to care for your home, not just you.',
      fields: [
        { k: 'spouseName', label: 'Spouse’s full name', type: 'text', showIf: function (a) { return a.marital === 'Married'; } },
        { k: 'spouseFaith', label: 'Spouse’s stand with Christ', type: 'select', showIf: function (a) { return a.marital === 'Married'; }, opts: ['Born again', 'Christian but not yet born again', 'Not a Christian', 'Belongs to another faith', 'We are separated'] },
        { k: 'spouseAttends', label: 'Does your spouse attend church with you?', type: 'select', showIf: function (a) { return a.marital === 'Married'; }, opts: ['Yes, here with me', 'Yes, at another church', 'No', 'Sometimes'] },
        { k: 'children', label: 'Number of children', type: 'number', min: 0, max: 30 },
        { k: 'childrenAges', label: 'Their ages', type: 'text', ph: 'e.g. 3, 7, 12' },
        { k: 'household', label: 'How many people live in your household?', type: 'number', min: 1, max: 60 },
        { k: 'headHouse', label: 'Are you the head of your household?', type: 'select', opts: ['Yes', 'No', 'Shared responsibility'] },
        { k: 'familyOpposition', label: 'Does anyone in your family oppose your faith or your joining this church?', type: 'select', opts: ['No opposition', 'Some resistance', 'Strong opposition', 'I live alone'] },
        { k: 'emergencyName', label: 'Emergency contact — full name', type: 'text', req: 1 },
        { k: 'emergencyRelation', label: 'Relationship to you', type: 'text', ph: 'e.g. Sister, Uncle, Friend' },
        { k: 'emergencyPhone', label: 'Emergency contact number', type: 'tel', req: 1 }
      ]
    },

    /* ------------------------------------------------------------ C */
    {
      id: 'salvation', ico: '✝️', step: 1,
      title: 'Salvation & Spiritual Life',
      sub: 'Be completely honest — this is a hospital, not a courtroom.',
      fields: [
        { k: 'acceptedChrist', label: 'Have you personally accepted Jesus Christ as your Lord and Saviour?', type: 'radio', req: 1, opts: ['Yes, I am born again', 'No, not yet', 'Not sure'] },
        { k: 'conversionWhen', label: 'When and where did that happen?', type: 'text', ph: 'e.g. 2019, at a crusade in Kanyama', showIf: function (a) { return a.acceptedChrist === 'Yes, I am born again'; } },
        { k: 'conversionStory', label: 'Briefly, how did you meet the Lord?', type: 'textarea', rows: 3, showIf: function (a) { return a.acceptedChrist === 'Yes, I am born again'; } },
        { k: 'baptism', label: 'Have you been baptised in water?', type: 'radio', req: 1, opts: ['Yes', 'No', 'Not sure'] },
        { k: 'baptismDate', label: 'When were you baptised?', type: 'text', showIf: function (a) { return a.baptism === 'Yes'; } },
        { k: 'baptismWhere', label: 'Where, and by whom?', type: 'text', showIf: function (a) { return a.baptism === 'Yes'; } },
        { k: 'holySpirit', label: 'Have you received the baptism of the Holy Spirit (with the evidence of speaking in tongues)?', type: 'radio', req: 1, opts: ['Yes', 'No', 'Not sure'] },
        { k: 'bibleBelief', label: 'Do you believe the Bible is the infallible Word of God, without error, our final authority?', type: 'radio', req: 1, opts: ['Yes, fully', 'Some parts only', 'Not sure'] },
        { k: 'prayerLife', label: 'How is your personal prayer life?', type: 'select', req: 1, opts: ['Daily, with a set time', 'Several times a week', 'Only when in trouble', 'Rarely', 'I am just learning'] },
        { k: 'bibleReading', label: 'How often do you read the Bible?', type: 'select', opts: ['Daily', 'A few times a week', 'Weekly', 'Rarely', 'I struggle to read'] },
        { k: 'fasting', label: 'How often do you fast?', type: 'select', opts: ['Weekly', 'Monthly', 'Occasionally', 'Rarely', 'Never yet'] },
        { k: 'giving', label: 'Your giving (tithes & offerings)', type: 'select', opts: ['I tithe faithfully', 'Sometimes', 'Not yet, but willing to learn', 'I have never been taught'] },
        { k: 'gifts', label: 'Spiritual gifts you believe God has given you', type: 'checkgroup', wide: 1, opts: ['Teaching', 'Prophecy', 'Healing', 'Intercession', 'Worship / music', 'Evangelism', 'Mercy / helps', 'Administration', 'Giving', 'Deliverance', 'Tongues & interpretation', 'Not sure yet'] },
        { k: 'walkNow', label: 'How would you describe your walk with God right now?', type: 'select', req: 1, opts: ['Growing strong', 'Up and down', 'Struggling but fighting', 'Just starting'] },
        { k: 'occult', label: 'Have you ever been involved in witchcraft, secret societies, cults, idolatry, charms, or consulting diviners?', type: 'radio', req: 1, opts: ['No, never', 'Yes — in the past', 'Yes — currently'] },
        { k: 'occultDetail', label: 'If yes, please explain — what, where, and whether you have renounced it', type: 'textarea', rows: 3, req: 1, showIf: function (a) { return a.occult === 'Yes — in the past' || a.occult === 'Yes — currently'; } },
        { k: 'addictions', label: 'Any habits or addictions you need victory over? (tick all that apply)', type: 'checkgroup', wide: 1, opts: ['None', 'Alcohol', 'Smoking', 'Drugs', 'Gambling / betting', 'Pornography', 'Sexual immorality', 'Anger / violence', 'Gossip', 'Lying / dishonesty', 'Stealing', 'Other'] },
        { k: 'addictionDetail', label: 'Would you like prayer and help in any of these areas? Tell us freely', type: 'textarea', rows: 2 },
        { k: 'disciplineBefore', label: 'Have you ever been under church discipline, suspended, or left a church with an unresolved case?', type: 'textarea', rows: 2, ph: 'If none, write “None”' }
      ]
    },

    /* ------------------------------------------------------------ D */
    {
      id: 'previous', ico: '⛪', step: 2,
      title: 'Your Previous Church / Ministry',
      sub: 'We honour where you are coming from. Full disclosure protects you and honours God.',
      fields: [
        { k: 'prevChurch', label: 'Name of the church / ministry you were with', type: 'text', req: 1, wide: 1, ph: 'Write “None” if you have never belonged to one' },
        { k: 'prevDenom', label: 'Denomination or covering, if any', type: 'text', ph: 'e.g. Pentecostal, Anglican, none' },
        { k: 'prevWhere', label: 'Where is it located?', type: 'text' },
        { k: 'prevYears', label: 'How long were you there?', type: 'select', opts: ['Under 1 year', '1 – 3 years', '4 – 10 years', 'Over 10 years', 'I only attended a few times'] },
        { k: 'prevRoles', label: 'What were you there? (tick all that apply)', type: 'checkgroup', wide: 1, opts: ['Attendee only', 'Baptised member', 'Worker / volunteer', 'Department head', 'Choir / worship team', 'Youth leader', 'Assistant pastor', 'Pastor / overseer', 'Founder', 'None'] },
        { k: 'prevBaptised', label: 'Were you baptised or married there?', type: 'radio', opts: ['Baptised there', 'Married there', 'Both', 'Neither'] },
        { k: 'reasonLeaving', label: 'Main reason you are no longer there', type: 'select', req: 1, wide: 1, opts: ['Relocated to this area', 'Looking for deeper spiritual growth', 'Doctrinal difference', 'Leadership conflict', 'I was offended / wronged', 'Marriage or family reason', 'Distance / transport', 'The church closed or scattered', 'I have never belonged to a church', 'Other'] },
        { k: 'reasonDetail', label: 'Explain in your own words — do not summarise, tell us the whole truth', type: 'textarea', rows: 4, req: 1, wide: 1 },
        { k: 'prevAuthority', label: 'Was there a pastor or spiritual parent you answered to there?', type: 'radio', opts: ['Yes', 'No'] },
        { k: 'prevAuthorityName', label: 'Their name and phone', type: 'text', showIf: function (a) { return a.prevAuthority === 'Yes'; } },
        { k: 'prevAuthorityAware', label: 'Do they know you are joining JCRGM?', type: 'select', showIf: function (a) { return a.prevAuthority === 'Yes'; }, opts: ['Yes, and they blessed me', 'Yes, but they did not bless it', 'No, they do not know', 'We are no longer in contact'] },
        { k: 'outstanding', label: 'Is there ANY outstanding matter there? (debt, discipline, marriage case, worker’s covenant, unresolved quarrel, etc.)', type: 'textarea', rows: 3, req: 1, wide: 1, ph: 'Write “None” if there is nothing outstanding' },
        { k: 'dualMembership', label: 'Will you continue to hold membership or office in that church while joining here?', type: 'radio', req: 1, opts: ['No — I am transferring fully', 'Yes, but only as a quiet attendance', 'Yes, I still serve there'] },
        { k: 'wouldReturn', label: 'If things changed there, would you go back?', type: 'select', opts: ['No', 'Maybe', 'Yes', 'Not sure'] }
      ]
    },

    /* ------------------------------------------------------------ E */
    {
      id: 'why', ico: '🕊️', step: 3,
      title: 'Why You Wish to Join JCRGM',
      sub: 'Take your time here. Your answer tells us your heart, not your grammar.',
      fields: [
        { k: 'howHeard', label: 'How did you come to know about this ministry?', type: 'checkgroup', wide: 1, req: 1, opts: ['Invited by a member', 'JCRGM TV / YouTube', 'Facebook', 'WhatsApp status or group', 'Radio', 'Crusade / outreach', 'A relative or neighbour', 'I walked in on my own', 'Other'] },
        { k: 'invitedBy', label: 'Who invited / brought you? (name & phone)', type: 'text', ph: 'Optional but helpful' },
        { k: 'attendedBefore', label: 'Have you attended our service before?', type: 'select', req: 1, opts: ['This will be my first time', 'A few times', 'Many times', 'Online only so far'] },
        { k: 'whyJoin', label: 'Why do you wish to join Jesus Christ Redeems Global Ministries?', type: 'textarea', rows: 6, req: 1, wide: 1, min: CFG.minWhy, help: 'What are you leaving, what are you searching for, and what has God said to you about this ministry? (at least ' + CFG.minWhy + ' characters)' },
        { k: 'expectations', label: 'What do you expect to find here?', type: 'textarea', rows: 3, wide: 1 },
        { k: 'whatBring', label: 'What can you contribute to the house of God? (gifts, skills, resources, time)', type: 'textarea', rows: 3, wide: 1 },
        { k: 'ministryAreas', label: 'Where would you like to serve, if the Lord allows?', type: 'checkgroup', wide: 1, opts: ['Choir / worship', 'Ushering', 'Protocol', 'Children’s church', 'Youth ministry', 'Media, sound & streaming', 'Intercession', 'Evangelism / outreach', 'Transport & logistics', 'Welfare & hospitality', 'Teaching', 'Administration', 'Cleaning / maintenance', 'Prayer band', 'Not sure yet'] },
        { k: 'cellWilling', label: 'Will you join a home cell / midweek fellowship?', type: 'select', req: 1, opts: ['Yes', 'Yes, if within my area', 'I would prefer not', 'Not sure'] },
        { k: 'faithStatement', label: 'I have read and I accept the JCRGM Statement of Faith, Constitution, doctrine and order of service.', type: 'check', req: 1, wide: 1 },
        { k: 'leadershipCover', label: 'I accept the spiritual authority, covering and leadership of the Pastor and the leadership of JCRGM.', type: 'check', req: 1, wide: 1 },
        { k: 'interviewReady', label: 'I am willing to attend a pastoral interview before membership is confirmed.', type: 'radio', req: 1, wide: 1, opts: ['Yes', 'Yes, but I need time', 'No'] }
      ]
    },

    /* ------------------------------------------------------------ F */
    {
      id: 'loyalty', ico: '🔑', step: 4,
      title: 'Total Submission & Loyalty',
      sub: 'This is the heart of membership. Read every word before you tick.',
      notes: [
        { type: 'p', html: '<b>Membership in JCRGM is not a names-on-paper register — it is a covenant.</b> Jesus Christ is the Head of the Church, and He governs His people through shepherds He Himself appoints. To join a house is to submit to the shepherd of that house, as unto the Lord.' },
        { type: 'verse', text: '“Obey your leaders and submit to them, for they are keeping watch over your souls, as those who will have to give an account.”', ref: 'Hebrews 13:17' },
        { type: 'verse', text: '“We ask you, brothers, to respect those who labour among you and are over you in the Lord and admonish you, and to esteem them very highly in love because of their work.”', ref: '1 Thessalonians 5:12–13' },
        { type: 'verse', text: '“Whoever listens to you listens to me; whoever rejects you rejects me; and whoever rejects me rejects the One who sent me.”', ref: 'Luke 10:16' },
        { type: 'p', html: '<b>Rebellion is not a small thing to God.</b> Scripture calls it “as the sin of divination” (1 Samuel 15:23). Miriam and Aaron questioned Moses’ authority and leprosy came upon Miriam (Numbers 12). Korah gathered a following against Moses and the ground opened (Numbers 16). Absalom won hearts with sweet words and destroyed both himself and the nation (2 Samuel 15–18). Every one of them looked spiritual while being rebellious.' },
        { type: 'p', html: '<b>Loyalty is proven in what you refuse to do:</b> you refuse to gossip, you refuse to take offence and slip away quietly, you refuse to run to another house carrying your grievance, you refuse to lift your hand against the Lord’s anointed. When you honour your spiritual parents, the blessing of God follows you — and even the mistakes they make become a shield over you, not a curse.' },
        { type: 'verse', text: '“Have confidence in your leaders and submit to their authority, because they keep watch over you as those who must give an account. Do this so that their work will be a joy, not a burden, for that would be of no benefit to you.”', ref: 'Hebrews 13:17 (NIV)' },
        { type: 'p', html: 'Read each declaration below slowly. Tick it only if you truly mean it before God — this is a vow, not a formality.' }
      ],
      fields: [
        { k: 'd1', type: 'check', req: 1, wide: 1, label: '<b>1. Christ has all of me.</b> Jesus Christ is Lord over every part of my life — my body, money, time, family, ambition and future. I surrender all and hold nothing back. <i>(Luke 14:33; Romans 12:1)' },
        { k: 'd2', type: 'check', req: 1, wide: 1, label: '<b>2. I submit to my spiritual parents.</b> I will submit myself to God and to the Pastor and leaders He has set over me in JCRGM — receiving their teaching, correction, reproof and discipline as from the Lord Himself. <i>(Hebrews 13:17; Ephesians 4:11–12)' },
        { k: 'd3', type: 'check', req: 1, wide: 1, label: '<b>3. I renounce rebellion and gossip.</b> I will not murmur, backbite, slander or sow discord. If I have a matter, I will speak directly and respectfully with my leader — never about them. <i>(Proverbs 6:16–19; James 4:11)' },
        { k: 'd4', type: 'check', req: 1, wide: 1, label: '<b>4. I will not leave through offence.</b> If I am hurt, I will follow Matthew 18:15–17 and bring the matter to my spiritual parents before I go anywhere else. I will not vanish quietly or take my grievance to outsiders. <i>(Matthew 18:15–17)' },
        { k: 'd5', type: 'check', req: 1, wide: 1, label: '<b>5. I will be loyal to this house.</b> I will not hold office, lead, or worship in another church in a way that divides my commitment, without the knowledge and blessing of my spiritual parents. <i>(Joshua 24:15; 1 Corinthians 1:10)' },
        { k: 'd6', type: 'check', req: 1, wide: 1, label: '<b>6. I am joining as a son/daughter, not a spectator.</b> I will not use JCRGM as a stepping stone, a place of convenience, or a stage for my own name. <i>(Philippians 2:3–4)' },
        { k: 'd7', type: 'check', req: 1, wide: 1, label: '<b>7. I will be honest with money.</b> I will tithe and give offerings as the Lord enables me through this house, and I will never steal, mismanage or take what does not belong to me. <i>(Malachi 3:8–10; 2 Corinthians 8:21)' },
        { k: 'd8', type: 'check', req: 1, wide: 1, label: '<b>8. I will protect the name of the ministry.</b> I will guard the reputation of my leaders and this church, and I will never be a source of scandal, division or shame inside or outside. <i>(Proverbs 11:13; 1 Peter 2:17)' },
        { k: 'd9', type: 'check', req: 1, wide: 1, label: '<b>9. Position comes from God, not from me.</b> I accept that ministry, appointment and promotion come from God through my spiritual parents. I will not campaign, manipulate, compare or fight for position. <i>(Psalm 75:6–7; Hebrews 5:4)' },
        { k: 'd10', type: 'check', req: 1, wide: 1, label: '<b>10. I will be faithful and present.</b> I will be faithful in attendance, service, giving and prayer — in season and out of season — and I will not forsake the assembling of the saints. <i>(Hebrews 10:25; Luke 16:10)' },
        { k: 'd11', type: 'check', req: 1, wide: 1, label: '<b>11. I accept correction as love.</b> I understand that wilful rebellion, immorality, dishonesty or division may bring correction and, if I remain unrepentant, withdrawal of membership — and I accept this as the love of a father, not punishment. <i>(Matthew 18:17; 1 Corinthians 5:12–13; Revelation 3:19)' },
        { k: 'd12', type: 'check', req: 1, wide: 1, label: '<b>12. I lay down my past.</b> I submit every old tie, covenant, charm, secret society, cult or previous ministry attachment to the Lord and to my spiritual parents for counsel, prayer and where necessary deliverance.' },
        { k: 'hinderance', label: 'Is there anything in your life that you know will make total submission hard — and that you need help with? (Be honest; this stays confidential)', type: 'textarea', rows: 3, wide: 1 },
        { k: 'spiritualParent', label: 'Who do you look to as your spiritual parent / mentor right now?', type: 'text', wide: 1, ph: 'Name & phone, or “none yet”' }
      ]
    },

    /* ------------------------------------------------------------ G */
    {
      id: 'commitment', ico: '🤝', step: 4,
      title: 'Your Commitment to the House',
      sub: 'Faithfulness is practical.',
      fields: [
        { k: 'newClass', label: 'I will attend the New Members / Foundation Class', type: 'check', req: 1, wide: 1 },
        { k: 'baptismReady', label: 'Water baptism', type: 'select', req: 1, opts: ['I am already baptised', 'Yes, I am ready to be baptised', 'Not yet — I want to understand more first'] },
        { k: 'services', label: 'Which services can you attend?', type: 'checkgroup', wide: 1, opts: ['Sunday service', 'Midweek service', 'Friday prayer', 'Home cell', 'All of them'] },
        { k: 'distance', label: 'How far do you live from the church?', type: 'select', opts: ['Walking distance', 'Under 10 km', '10 – 25 km', 'Over 25 km', 'I need transport help'] },
        { k: 'serveWhen', label: 'When can you begin serving?', type: 'select', opts: ['Immediately', 'After a few months of settling', 'Only occasionally', 'I am not ready to serve yet'] },
        { k: 'health', label: 'Any health condition, disability or situation the church should know about for your care?', type: 'textarea', rows: 2, wide: 1 },
        { k: 'needs', label: 'Any pressing need we can pray with you about? (spiritual, family, financial, etc.)', type: 'textarea', rows: 2, wide: 1 },
        { k: 'previousService', label: 'Any ministry experience or training you have received elsewhere?', type: 'textarea', rows: 2, wide: 1 },
        { k: 'anythingElse', label: 'Anything else you would like the leadership to know?', type: 'textarea', rows: 3, wide: 1 }
      ]
    },

    /* ------------------------------------------------------------ H */
    {
      id: 'declaration', ico: '📜', step: 5,
      title: 'Declaration & Signature',
      sub: 'Everything here is treated in confidence by the pastoral team.',
      fields: [
        { k: 'declareTruth', type: 'check', req: 1, wide: 1, label: 'I declare that every answer I have given is true and complete to the best of my knowledge, and I understand that any false statement may lead to my application being declined or membership withdrawn.' },
        { k: 'consentData', type: 'check', req: 1, wide: 1, label: 'I give JCRGM permission to keep my details in the church register and to use them only for pastoral care, membership and ministry purposes.' },
        { k: 'consentContact', type: 'check', req: 1, wide: 1, label: 'I am willing to be contacted by phone, WhatsApp or SMS by the pastoral team regarding this application.' },
        { k: 'signature', label: 'Type your full name as your signature', type: 'text', req: 1, wide: 1 },
        { k: 'signDate', label: 'Date', type: 'date', req: 1, val: today() },
        { k: 'witnessName', label: 'Who stood with you / invited you? (witness name)', type: 'text', wide: 1, ph: 'Optional' },
        { k: 'witnessPhone', label: 'Witness phone number', type: 'tel', ph: 'Optional' }
      ]
    }
  ];

  var STEPS = [
    { name: 'About You', ids: ['personal', 'family'] },
    { name: 'Spiritual Life', ids: ['salvation'] },
    { name: 'Previous Ministry', ids: ['previous'] },
    { name: 'Why JCRGM', ids: ['why'] },
    { name: 'Submission & Loyalty', ids: ['loyalty', 'commitment'] },
    { name: 'Declaration', ids: ['declaration'] }
  ];

  /* ------------------------------------------------------------ lookup */
  var FIELD = {};
  SECTIONS.forEach(function (s) { s.fields.forEach(function (f) { f.section = s.id; FIELD[f.k] = f; }); });

  /* ------------------------------------------------------------ render */
  function labelFor(f) { return f.label || ''; }

  function fieldHTML(f) {
    if (f.showIf && !f.showIf(A)) return '';
    var v = A[f.k];
    var id = 'f_' + f.k;
    var wrapCls = 'field' + (f.wide || f.type === 'textarea' || f.type === 'checkgroup' || f.type === 'check' ? ' wide' : '') + (f.type === 'check' ? ' decl' : '');
    var h = '<div class="' + wrapCls + '" data-f="' + f.k + '">';

    if (f.type === 'check') {
      h += '<label class="tickline"><input type="checkbox" id="' + id + '" data-k="' + f.k + '"' + (v ? ' checked' : '') + '><span class="tick"></span>';
      h += '<span class="decl-txt">' + (f.label || '') + '</span></label>';
      h += '</div>';
      return h;
    }

    h += '<label class="lbl" for="' + id + '">' + labelFor(f) + (f.req ? ' <span class="req">*</span>' : '') + '</label>';
    if (f.help) h += '<div class="help">' + f.help + '</div>';

    if (f.type === 'textarea') {
      h += '<textarea id="' + id + '" data-k="' + f.k + '" rows="' + (f.rows || 3) + '" placeholder="' + esc(f.ph || '') + '">' + esc(v || '') + '</textarea>';
    } else if (f.type === 'select') {
      h += '<select id="' + id + '" data-k="' + f.k + '"><option value="">— Select —</option>';
      f.opts.forEach(function (o) { h += '<option' + (v === o ? ' selected' : '') + '>' + esc(o) + '</option>'; });
      h += '</select>';
    } else if (f.type === 'radio') {
      h += '<div class="pills">';
      f.opts.forEach(function (o) {
        h += '<label class="pill"><input type="radio" name="' + f.k + '" data-k="' + f.k + '" value="' + esc(o) + '"' + (v === o ? ' checked' : '') + '><span>' + esc(o) + '</span></label>';
      });
      h += '</div>';
    } else if (f.type === 'checkgroup') {
      var arr = Array.isArray(v) ? v : [];
      h += '<div class="chips">';
      f.opts.forEach(function (o) {
        var cid = id + '_' + o.replace(/[^a-z0-9]/gi, '');
        h += '<label class="chip" for="' + cid + '"><input type="checkbox" id="' + cid + '" data-k="' + f.k + '" data-multi="1" value="' + esc(o) + '"' + (arr.indexOf(o) > -1 ? ' checked' : '') + '><span>' + esc(o) + '</span></label>';
      });
      h += '</div>';
    } else {
      var t = f.type === 'number' ? 'number' : f.type;
      h += '<input type="' + t + '" id="' + id + '" data-k="' + f.k + '" value="' + esc(v || '') + '"';
      if (f.ph) h += ' placeholder="' + esc(f.ph) + '"';
      if (f.type === 'number') { if (f.min != null) h += ' min="' + f.min + '"'; if (f.max != null) h += ' max="' + f.max + '"'; }
      h += '>';
    }
    h += '<div class="err" hidden></div>';
    return h + '</div>';
  }

  function noteHTML(n) {
    if (n.type === 'verse') return '<figure class="verse"><blockquote>' + n.text + '</blockquote><figcaption>— ' + n.ref + '</figcaption></figure>';
    return '<p class="teach">' + n.html + '</p>';
  }

  function renderStep() {
    var host = $('#formBody');
    var meta = STEPS[step];
    var html = '';
    meta.ids.forEach(function (sid) {
      var s = SECTIONS.filter(function (x) { return x.id === sid; })[0];
      if (!s) return;
      html += '<section class="card sec" id="sec-' + s.id + '">';
      html += '<header class="sec-head"><span class="sec-ico">' + s.ico + '</span><div><h2>' + s.title + '</h2>' +
              (s.sub ? '<p>' + s.sub + '</p>' : '') + '</div></header>';
      if (s.notes) s.notes.forEach(function (n) { html += noteHTML(n); });
      html += '<div class="grid">';
      s.fields.forEach(function (f) { html += fieldHTML(f); });
      html += '</div></section>';
    });
    host.innerHTML = html;
    bindFields();
    $('#stepName').textContent = meta.name;
    $('#stepNow').textContent = (step + 1);
    var pct = Math.round(((step + 1) / STEPS.length) * 100);
    $('#barFill').style.width = pct + '%';
    $('#backBtn').style.visibility = step === 0 ? 'hidden' : 'visible';
    $('#nextBtn').textContent = step === STEPS.length - 1 ? '✅ Submit application' : 'Continue →';
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function bindFields() {
    $$('#formBody [data-k]').forEach(function (el) {
      var k = el.getAttribute('data-k');
      var ev = (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio') ? 'change' : 'input';
      el.addEventListener(ev, function () {
        if (el.type === 'checkbox' && el.getAttribute('data-multi') === '1') {
          var arr = Array.isArray(A[k]) ? A[k].slice() : [];
          var i = arr.indexOf(el.value);
          if (el.checked && i < 0) arr.push(el.value);
          if (!el.checked && i > -1) arr.splice(i, 1);
          A[k] = arr;
        } else if (el.type === 'checkbox') {
          A[k] = el.checked;
        } else if (el.type === 'radio') {
          if (el.checked) A[k] = el.value;
        } else {
          A[k] = el.value;
        }
        clearErr(el.getAttribute('data-k'));
        saveDraft();
        // conditional fields: re-render this step quietly when a switch changes
        if (needsRefresh(k)) {
          var y = window.scrollY, focusK = k;
          renderStepQuiet();
          window.scrollTo(0, y);
          var again = $('#f_' + focusK);
          if (again && again.focus && again.type !== 'checkbox' && again.type !== 'radio') { try { again.focus({ preventScroll: true }); } catch (e) {} }
        }
      });
    });
  }

  function needsRefresh(k) {
    var f = FIELD[k];
    if (!f) return false;
    var v = A[k];
    return SECTIONS.some(function (s) {
      return s.fields.some(function (x) { return x.showIf && dependsOn(x, k); });
    }) && (f.type === 'radio' || f.type === 'select' || f.type === 'checkbox');
  }
  function dependsOn(f, k) {
    try { return String(f.showIf).indexOf('a.' + k) > -1 || String(f.showIf).indexOf("a['" + k + "']") > -1; } catch (e) { return false; }
  }

  function renderStepQuiet() {
    var y = window.scrollY;
    var meta = STEPS[step];
    var html = '';
    meta.ids.forEach(function (sid) {
      var s = SECTIONS.filter(function (x) { return x.id === sid; })[0];
      html += '<section class="card sec" id="sec-' + s.id + '">';
      html += '<header class="sec-head"><span class="sec-ico">' + s.ico + '</span><div><h2>' + s.title + '</h2>' + (s.sub ? '<p>' + s.sub + '</p>' : '') + '</div></header>';
      if (s.notes) s.notes.forEach(function (n) { html += noteHTML(n); });
      html += '<div class="grid">';
      s.fields.forEach(function (f) { html += fieldHTML(f); });
      html += '</div></section>';
    });
    $('#formBody').innerHTML = html;
    bindFields();
    window.scrollTo(0, y);
  }

  /* ---------------------------------------------------------- validation */
  function clearErr(k) {
    var box = document.querySelector('[data-f="' + k + '"]');
    if (!box) return;
    box.classList.remove('bad');
    var e = box.querySelector('.err'); if (e) { e.hidden = true; e.textContent = ''; }
  }
  function setErr(k, msg) {
    var box = document.querySelector('[data-f="' + k + '"]');
    if (!box) return;
    box.classList.add('bad');
    var e = box.querySelector('.err'); if (e) { e.hidden = false; e.textContent = msg; }
  }
  function isEmpty(v) {
    if (v == null) return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'boolean') return v === false;
    return String(v).trim() === '';
  }
  function validateStep(quiet) {
    var meta = STEPS[step], bad = [];
    meta.ids.forEach(function (sid) {
      var s = SECTIONS.filter(function (x) { return x.id === sid; })[0];
      s.fields.forEach(function (f) {
        if (f.showIf && !f.showIf(A)) return;
        var v = A[f.k];
        if (f.req && isEmpty(v)) { bad.push({ k: f.k, m: f.type === 'check' ? 'Please tick this to continue.' : 'This answer is required.' }); return; }
        if (f.min && v && String(v).trim().length < f.min) { bad.push({ k: f.k, m: 'Please write a little more (at least ' + f.min + ' characters) — this is important to us.' }); return; }
        if (f.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)) { bad.push({ k: f.k, m: 'Please check this email address.' }); return; }
        if (f.type === 'tel' && v && String(v).replace(/[^0-9]/g, '').length < 9) { bad.push({ k: f.k, m: 'Please give a full phone number.' }); }
      });
    });
    if (!quiet) {
      $$('#formBody .field.bad').forEach(function (b) { b.classList.remove('bad'); });
      bad.forEach(function (b) { setErr(b.k, b.m); });
      if (bad.length) {
        var first = document.querySelector('[data-f="' + bad[0].k + '"]');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast('Please complete ' + bad.length + ' item' + (bad.length > 1 ? 's' : '') + ' highlighted above.');
      }
    }
    return bad.length === 0;
  }

  /* -------------------------------------------------------------- toast */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3800);
  }

  /* -------------------------------------------------------------- draft */
  function saveDraft() {
    write(CFG.keys.draft, { a: A, step: step, at: Date.now() });
  }
  function loadDraft() {
    var d = read(CFG.keys.draft);
    if (!d || !d.a) return false;
    A = d.a; step = Math.min(d.step || 0, STEPS.length - 1);
    return true;
  }

  /* --------------------------------------------------------- application */
  function newRef() {
    var d = new Date();
    var n = (read(CFG.keys.apps) || []).length + 1;
    return 'JCRGM-JOIN-' + d.getFullYear() + '-' + pad(n, 4);
  }

  function submit() {
    if (!validateStep(false)) return;
    // check every step's required fields, not just this one
    for (var i = 0; i < STEPS.length; i++) {
      var save = step; step = i;
      var ok = validateStep(true); step = save;
      if (!ok) { step = i; renderStep(); validateStep(false); return; }
    }
    var rec = {
      ref: newRef(),
      name: A.fullName || '',
      phone: A.phone || '',
      email: A.email || '',
      prevChurch: A.prevChurch || '',
      whyJoin: A.whyJoin || '',
      when: Date.now(),
      status: 'pending',
      answers: A
    };
    var apps = read(CFG.keys.apps) || [];
    apps.unshift(rec);
    write(CFG.keys.apps, apps);
    submitted = rec;
    showSuccess(rec);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  }

  function showSuccess(rec) {
    $('#formWrap').hidden = true;
    $('#successWrap').hidden = false;
    $('#refOut').textContent = rec.ref;
    $('#refOut2').textContent = rec.ref;
    refreshApprovalUI();
  }

  /* ---------------------------------------------------------------- text */
  function summaryLines(a) {
    return [
      ['Reference', submitted ? submitted.ref : '(not submitted)'],
      ['Full name', a.fullName],
      ['Phone', a.phone],
      ['Area', a.area],
      ['Marital status', a.marital],
      ['Born again', a.acceptedChrist],
      ['Baptised in water', a.baptism],
      ['Previous church / ministry', a.prevChurch],
      ['Years there', a.prevYears],
      ['Role there', (a.prevRoles || []).join(', ')],
      ['Reason for leaving', a.reasonLeaving],
      ['Why joining JCRGM', a.whyJoin],
      ['Ministries of interest', (a.ministryAreas || []).join(', ')],
      ['Signature', a.signature],
      ['Date', a.signDate]
    ];
  }

  function whatsappText(rec) {
    var a = rec.answers;
    var L = [];
    L.push('*JCRGM — NEWCOMER / MEMBERSHIP APPLICATION*');
    L.push('Ref: ' + rec.ref);
    L.push('Date: ' + new Date(rec.when).toLocaleString());
    L.push('');
    L.push('*Name:* ' + (a.fullName || '—'));
    L.push('*Phone:* ' + (a.phone || '—'));
    L.push('*Area:* ' + (a.area || '—'));
    L.push('*Gender / DOB:* ' + (a.gender || '—') + ' · ' + (a.dob || '—'));
    L.push('*Marital status:* ' + (a.marital || '—'));
    L.push('');
    L.push('*SALVATION*');
    L.push('Born again: ' + (a.acceptedChrist || '—'));
    L.push('Water baptism: ' + (a.baptism || '—'));
    L.push('Holy Spirit: ' + (a.holySpirit || '—'));
    L.push('Walk now: ' + (a.walkNow || '—'));
    L.push('');
    L.push('*PREVIOUS MINISTRY*');
    L.push('Church: ' + (a.prevChurch || '—'));
    L.push('Years: ' + (a.prevYears || '—'));
    L.push('Role: ' + ((a.prevRoles || []).join(', ') || '—'));
    L.push('Reason for leaving: ' + (a.reasonLeaving || '—'));
    L.push('');
    L.push('*WHY JCRGM*');
    L.push(String(a.whyJoin || '—').slice(0, 700));
    L.push('');
    L.push('*SUBMISSION & LOYALTY:* All 12 declarations accepted = ' +
      (['d1','d2','d3','d4','d5','d6','d7','d8','d9','d10','d11','d12'].every(function (k) { return a[k]; }) ? 'YES' : 'NO — please review'));
    L.push('');
    L.push('Signature: ' + (a.signature || '—') + '  (' + (a.signDate || '') + ')');
    L.push('');
    L.push('📎 The complete questionnaire is attached as a PDF.');
    L.push('Sent from the JCRGM app.');
    return L.join('\n');
  }
  function copyText(t, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { cb(true); }, function () { cb(legacyCopy(t)); });
    } else cb(legacyCopy(t));
  }
  function legacyCopy(t) {
    try {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
      var ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
    } catch (e) { return false; }
  }

  /* =======================================================================
     PDF WRITER — dependency-free A4 generator (Helvetica)
     ===================================================================== */
  var PDFKit = (function () {
    var PW = 595.28, PH = 841.89, M = 44;
    var CW = PW - M * 2;

    var W_REG = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
    var W_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];

    function charW(ch, bold) {
      var c = ch.charCodeAt(0);
      if (c < 32 || c > 126) c = 63;                    // ?
      return (bold ? W_BOLD : W_REG)[c - 32] / 1000;
    }
    function strW(s, size, bold) {
      var w = 0;
      for (var i = 0; i < s.length; i++) w += charW(s[i], bold);
      return w * size;
    }
    function ascii(s) {
      return String(s == null ? '' : s)
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E]/g, '"')
        .replace(/[\u2013\u2014\u2015]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/[\u00A0\u2007\u202F]/g, ' ')
        .replace(/\u2022/g, '-')
        .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '')
        .replace(/\t/g, '    ');
    }
    function pdfStr(s) {
      return '(' + ascii(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
        .replace(/\r?\n/g, ' ') + ')';
    }
    function wrap(text, size, bold, maxW) {
      var words = ascii(text).split(/\s+/), lines = [], line = '';
      for (var i = 0; i < words.length; i++) {
        var t = line ? line + ' ' + words[i] : words[i];
        if (strW(t, size, bold) > maxW && line) { lines.push(line); line = words[i]; }
        else line = t;
      }
      if (line) lines.push(line);
      return lines.length ? lines : [''];
    }

    function Doc() {
      this.pages = [];
      this.cur = null;
      this.y = 0;
      this.newPage();
    }
    Doc.prototype.newPage = function () {
      this.cur = [];
      this.pages.push(this.cur);
      this.y = PH - M;
      return this;
    };
    Doc.prototype.need = function (h) {
      if (this.y - h < M + 26) this.newPage();
      return this;
    };
    Doc.prototype.op = function (s) { this.cur.push(s); return this; };
    Doc.prototype.text = function (str, opt) {
      opt = opt || {};
      var size = opt.size || 10, bold = !!opt.bold;
      var x = opt.x != null ? opt.x : M;
      var lh = opt.lh || size * 1.45;
      var maxW = opt.w || (PW - M - x);
      var lines = wrap(str, size, bold, maxW);
      if (opt.keep) this.need(lines.length * lh);
      var col = opt.color || '0.06 0.11 0.27';
      for (var i = 0; i < lines.length; i++) {
        this.need(lh);
        this.op(col + ' rg BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf 1 0 0 1 ' +
          x.toFixed(2) + ' ' + (this.y - size * 0.78).toFixed(2) + ' Tm ' + pdfStr(lines[i]) + ' Tj ET');
        this.y -= lh;
      }
      return this;
    };
    Doc.prototype.gap = function (h) { this.y -= h; return this; };
    Doc.prototype.rule = function (color, w) {
      this.need(8);
      this.op((color || '0.72 0.57 0.17') + ' RG ' + (w || 1) + ' w ' +
        M + ' ' + this.y.toFixed(2) + ' m ' + (PW - M) + ' ' + this.y.toFixed(2) + ' l S');
      this.y -= 8;
      return this;
    };
    Doc.prototype.box = function (h, fill, stroke) {
      this.need(h);
      this.op((fill || '0.96 0.97 1') + ' rg ' + M + ' ' + (this.y - h).toFixed(2) + ' ' + CW + ' ' + h.toFixed(2) + ' re f');
      if (stroke) this.op(stroke + ' RG 0.8 w ' + M + ' ' + (this.y - h).toFixed(2) + ' ' + CW + ' ' + h.toFixed(2) + ' re S');
      return this;
    };

    /* Proper PDF assembly: objects listed in order, xref with real offsets */
    function assemble(objects, meta) {
      var out = '%PDF-1.4\n%âãÏÓ\n';
      var offsets = [];
      for (var i = 0; i < objects.length; i++) {
        offsets.push(ascii(out).length);
        out += (i + 1) + ' 0 obj\n' + objects[i] + '\nendobj\n';
      }
      var xrefPos = ascii(out).length;
      out += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
      for (var j = 0; j < offsets.length; j++) {
        out += ('0000000000' + offsets[j]).slice(-10) + ' 00000 n \n';
      }
      out += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R ' +
        '/Info << /Title ' + pdfStr('JCRGM Newcomer Application ' + (meta.ref || '')) +
        ' /Author ' + pdfStr(meta.church || 'JCRGM') + ' /Subject ' + pdfStr('Newcomer / Membership Application') +
        ' /Creator ' + pdfStr('JCRGM Church App') + ' >> >>\nstartxref\n' + xrefPos + '\n%%EOF';
      return out;
    }

    return { Doc: Doc, PW: PW, PH: PH, M: M, CW: CW, ascii: ascii, pdfStr: pdfStr, wrap: wrap, strW: strW, assemble: assemble };
  })();

  /* ------------------------------------------------ compose the document */
  function composeDoc(doc, meta, totalPages) {
    var PW = PDFKit.PW, M = PDFKit.M, CW = PDFKit.CW;
    var NAVY = '0.06 0.11 0.27', GOLD = '0.72 0.57 0.17', MUTED = '0.35 0.41 0.50';

    /* ---- cover head ---- */
    doc.op('0.06 0.11 0.27 rg ' + M + ' ' + (doc.y - 84).toFixed(2) + ' ' + CW + ' 84 re f');
    doc.y -= 18;
    doc.text('JESUS CHRIST REDEEMS GLOBAL MINISTRIES', { size: 12, bold: true, color: '1 0.84 0', x: M + 14 });
    doc.text('NEWCOMER & MEMBERSHIP APPLICATION', { size: 16, bold: true, color: '1 1 1', x: M + 14 });
    doc.text('Confidential — for pastoral use only', { size: 8.5, color: '0.85 0.88 0.95', x: M + 14 });
    doc.y -= 18;
    doc.gap(6);

    /* ---- meta table ---- */
    var metaRows = [
      ['Reference', meta.ref || '—'],
      ['Date submitted', meta.date || '—'],
      ['Status', 'PENDING PASTORAL REVIEW'],
      ['Applicant', A.fullName || '—'],
      ['Phone', A.phone || '—']
    ];
    metaRows.forEach(function (r) {
      doc.need(14);
      doc.text(r[0].toUpperCase(), { size: 8, bold: true, color: MUTED, x: M });
      doc.y += 10.6;
      doc.text(r[1], { size: 10.5, bold: r[0] === 'Status', x: M + 96, color: r[0] === 'Status' ? GOLD : NAVY });
      doc.y += 1;
      doc.gap(1);
    });
    doc.rule(GOLD, 1.2);
    doc.gap(4);

    function put(str, x, y, size, bold, color) {
      doc.op((color || NAVY) + ' rg BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf 1 0 0 1 ' +
        x.toFixed(2) + ' ' + y.toFixed(2) + ' Tm ' + PDFKit.pdfStr(str) + ' Tj ET');
    }
    function heading(txt, num) {
      doc.need(60);
      doc.gap(6);
      doc.op('0.06 0.11 0.27 rg ' + M + ' ' + (doc.y - 16).toFixed(2) + ' ' + CW + ' 16 re f');
      put((num ? num + '. ' : '') + txt, M + 8, doc.y - 11.5, 10, true, '1 1 1');
      doc.y -= 24;
    }
    function kv(label, val) {
      var v = String(val == null ? '' : val).trim();
      if (!v) v = '—';
      var LH = 12.6;
      var labLines = PDFKit.wrap(label, 8.8, false, 188);
      var valLines = PDFKit.wrap(v, 9.8, false, CW - 202);
      var stacked = v.length > 210;
      var nRows = stacked ? (labLines.length + valLines.length + 1) : Math.max(labLines.length, valLines.length);
      var h = (nRows - 1) * LH + 6.6 + 4.2;      // ascender + gaps
      doc.need(h + 6);
      var top = doc.y;
      labLines.forEach(function (l, i) { put(l, M, top - 6.6 - i * LH, 8.8, false, MUTED); });
      if (stacked) {
        var y2 = top - 6.6 - labLines.length * LH;
        valLines.forEach(function (l, i) { put(l, M + 4, y2 - i * LH, 9.8, false, NAVY); });
      } else {
        valLines.forEach(function (l, i) { put(l, M + 196, top - 6.8 - i * LH, 9.8, false, NAVY); });
      }
      doc.y = top - h;
    }
    function checkboxLine(on, label, size) {
      var sz = size || 9.5, LH = 12.6;
      var lines = PDFKit.wrap(label, sz, false, CW - 17);
      var h = (lines.length - 1) * LH + 16.5;
      doc.need(h + 6);
      var top = doc.y;
      var bx = M, by = top - 1;
      doc.op('1 1 1 rg ' + bx + ' ' + (by - 9).toFixed(2) + ' 9 9 re f');
      doc.op('0.60 0.66 0.75 RG 0.8 w ' + bx + ' ' + (by - 9).toFixed(2) + ' 9 9 re S');
      if (on) {
        doc.op('0.06 0.42 0.24 rg ' + bx + ' ' + (by - 9).toFixed(2) + ' 9 9 re f');
        doc.op('1 1 1 RG 1.1 w ' + (bx + 1.8) + ' ' + (by - 5.2).toFixed(2) + ' m ' +
          (bx + 3.6) + ' ' + (by - 7.4).toFixed(2) + ' l ' + (bx + 7.2) + ' ' + (by - 1.8).toFixed(2) + ' l S');
      }
      lines.forEach(function (l, i) { put(l, M + 15, top - 7 - i * LH, sz, false, NAVY); });
      doc.y = top - h;
    }
    function sectionTitle(s) { heading(s.title.replace(/^\d+\.\s*/, ''), s.num); }

    /* ---- sections ---- */
    var n = 0;
    SECTIONS.forEach(function (s) {
      n++;
      heading(s.title, n);
      s.fields.forEach(function (f) {
        if (f.type === 'check') { checkboxLine(!!A[f.k], stripTags(f.label)); return; }
        var v = A[f.k];
        if (Array.isArray(v)) v = v.join(', ');
        if (v === true) v = 'Yes';
        if (v === false || v === '') v = '';
        if (f.showIf && !f.showIf(A)) v = '— (not applicable)';
        kv(stripTags(f.label).replace(/\s*\(tick all that apply\)/i, ''), v);
      });
    });

    /* ---- office use only ---- */
    doc.need(150);
    doc.gap(8);
    heading('For Office Use Only', '');
    var boxH = 120;
    doc.box(boxH, '0.97 0.98 1', '0.75 0.80 0.88');
    doc.gap(6);
    var rows = [
      'Received by: ______________________________     Date: ______________',
      'Pastoral interview held on: ____________________  With: ______________________',
      '',
      'DECISION:      [   ] APPROVED          [   ] DECLINED          [   ] DEFERRED',
      '',
      'Approved by (name & signature): ____________________________________________',
      'Approval code given to applicant: ___________________________________________',
      'Membership number issued: __________________________________________________',
      '',
      'Notes: ____________________________________________________________________',
      '__________________________________________________________________________'
    ];
    rows.forEach(function (r) { doc.text(r, { size: 9.5, x: M + 10, w: CW - 20 }); });
    doc.gap(10);

    /* ---- signature block ---- */
    doc.need(90);
    doc.gap(10);
    doc.text('DECLARATION BY APPLICANT', { size: 9, bold: true, color: MUTED });
    doc.text('I declare that the answers given in this questionnaire are true and complete, that I have read and accepted the twelve declarations of total submission and loyalty to the Lord Jesus Christ through my spiritual parents, and that I submit myself to the leadership of Jesus Christ Redeems Global Ministries.', { size: 9 });
    doc.gap(14);
    doc.op('0.2 0.2 0.2 RG 0.9 w ' + M + ' ' + doc.y.toFixed(2) + ' m ' + (M + 220) + ' ' + doc.y.toFixed(2) + ' l S');
    doc.op('0.2 0.2 0.2 RG 0.9 w ' + (M + 270) + ' ' + doc.y.toFixed(2) + ' m ' + (PW - M) + ' ' + doc.y.toFixed(2) + ' l S');
    doc.gap(12);
    doc.y += 4;
    doc.text('Signature: ' + (A.signature || '__________________'), { size: 10, bold: true, w: 240 });
    doc.y += 3;
    doc.text('Date: ' + (A.signDate || '____________'), { size: 10, x: M + 270 });
    doc.gap(14);
    doc.text('Witness (if any): ' + (A.witnessName || '__________________________') +
      (A.witnessPhone ? '   ·   ' + A.witnessPhone : ''), { size: 9, color: MUTED });
    doc.gap(6);
    doc.text('Sent to WhatsApp ' + CFG.phoneLocal + '  ·  ' + CFG.email + '  ·  Confidential church record',
      { size: 8, color: MUTED });

    /* ---- what happens next ---- */
    doc.gap(16);
    heading('What Happens Next', '');
    var steps = [
      ['1', 'Hand in this application', 'Send the PDF to WhatsApp ' + CFG.phoneLocal + ' (or hand the printed copy to the membership desk).'],
      ['2', 'Pastoral interview', 'A pastor or the membership desk will call you to arrange a short interview. Bring your NRC.'],
      ['3', 'Approval', 'After prayer and review the leadership will send you an APPROVAL CODE by WhatsApp or SMS.'],
      ['4', 'Membership registration', 'Open the app → Join JCRGM → “I have been approved”, enter your reference + code, then complete membership and receive your digital ID card.']
    ];
    steps.forEach(function (st) {
      doc.need(34);
      var top = doc.y;
      doc.op('0.06 0.11 0.27 rg ' + M + ' ' + (top - 13).toFixed(2) + ' 14 14 re f');
      put(st[0], M + 4.8, top - 9.6, 9.5, true, '1 0.84 0');
      put(st[1], M + 21, top - 9.6, 10.5, true, NAVY);
      doc.y = top - 13;
      doc.text(st[2], { size: 9.4, x: M + 21, w: CW - 21 });
      doc.gap(7);
    });
    doc.gap(6);
    doc.text('Keep your reference number safe: ' + (meta.ref || '') , { size: 9.5, bold: true, color: GOLD });
    return doc;
  }
  function stripTags(s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(); }

  /* ------------------------------------------------------------- build PDF */
  function buildPdf(rec) {
    // keep answer source = the record's answers (so PDF can be rebuilt later)
    var savedA = A;
    A = rec.answers || A;
    var meta = {
      ref: rec.ref,
      date: new Date(rec.when).toLocaleString(),
      church: CFG.church
    };
    try {
      var doc = new PDFKit.Doc();
      composeDoc(doc, meta);
      var pages = doc.pages;
      // assemble
      var objects = [];
      objects.push('<< /Type /Catalog /Pages 2 0 R >>');
      var kids = [];
      var next = 5;
      var pageBodies = [];
      pages.forEach(function (ops) {
        var content = ops.join('\n');
        pageBodies.push(content);
      });
      var total = pageBodies.length;
      var contentNums = [], pageNums = [];
      var num = 5;
      pageBodies.forEach(function () { contentNums.push(num++); pageNums.push(num++); });
      objects[1] = '<< /Type /Pages /Count ' + total + ' /Kids [' + pageNums.map(function (p) { return p + ' 0 R'; }).join(' ') + '] >>';
      objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
      objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
      pageBodies.forEach(function (body, i) {
        // add footer text (page x of y)
        var foot = '0.45 0.50 0.60 rg BT /F1 8 Tf 1 0 0 1 ' + PDFKit.M + ' 26 Tm ' +
          PDFKit.pdfStr('JCRGM Newcomer & Membership Application  |  ' + meta.ref) + ' Tj ET\n' +
          '0.45 0.50 0.60 rg BT /F1 8 Tf 1 0 0 1 ' + (PDFKit.PW - PDFKit.M - 62) + ' 26 Tm ' +
          PDFKit.pdfStr('Page ' + (i + 1) + ' of ' + total) + ' Tj ET';
        var stream = body + '\n' + foot;
        objects[contentNums[i] - 1] = '<< /Length ' + PDFKit.ascii(stream).length + ' >>\nstream\n' + stream + '\nendstream';
        objects[pageNums[i] - 1] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PDFKit.PW + ' ' + PDFKit.PH + '] ' +
          '/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + contentNums[i] + ' 0 R >>';
      });
      return PDFKit.assemble(objects, meta);
    } finally {
      A = savedA;
    }
  }

  function pdfBlob(rec) {
    var s = buildPdf(rec);
    // build bytes as Latin-1
    var bytes = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: 'application/pdf' });
  }

  function fileName(rec) {
    var nm = (rec.name || 'Application').replace(/[^a-z0-9]+/gi, '_');
    return 'JCRGM_Newcomer_' + nm + '_' + rec.ref + '.pdf';
  }

  function downloadPdf(rec) {
    try {
      var blob = pdfBlob(rec);
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = fileName(rec);
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
      toast('📄 PDF downloaded — attach it in WhatsApp to 0979 554 970.');
    } catch (e) {
      toast('⚠️ PDF could not be created here — use “Print / Save as PDF”.');
    }
  }

  function sharePdfToWhatsApp(rec) {
    var blob, file = null;
    try {
      blob = pdfBlob(rec);
      file = new File([blob], fileName(rec), { type: 'application/pdf' });
    } catch (e) {}

    var txt = whatsappText(rec);
    var waUrl = 'https://wa.me/' + CFG.phoneIntl + '?text=' + encodeURIComponent(txt);

    // Best path: share the real PDF file to WhatsApp through the system share sheet
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'JCRGM Newcomer Application ' + rec.ref,
        text: txt.slice(0, 900)
      }).then(function () {
        toast('✅ Sent — if WhatsApp did not open, use the download + attach button.');
      }).catch(function () { window.open(waUrl, '_blank'); });
      return;
    }
    copyText(txt, function () {});
    window.open(waUrl, '_blank');
    toast('📲 WhatsApp opened with your summary — attach the downloaded PDF and press send.');
  }

  function openWhatsAppText(rec) {
    var url = 'https://wa.me/' + CFG.phoneIntl + '?text=' + encodeURIComponent(whatsappText(rec));
    var w = window.open(url, '_blank');
    if (!w) { location.href = url; }
    copyText(whatsappText(rec), function () {});
  }

  /* ------------------------------------------------------- approval logic */
  function approvalCode(ref) {
    var s = (ref || '').toUpperCase() + '|JCRGM-APPROVED|2026|PROVERBS-11-14';
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    var out = (h >>> 0).toString(36).toUpperCase();
    return 'AP-' + out.slice(0, 4) + '-' + (h >>> 8).toString(36).toUpperCase().slice(0, 3);
  }

  function approvedRecord() { return read(CFG.keys.approved); }

  function refreshApprovalUI() {
    var ap = approvedRecord();
    var ok = !!(ap && ap.ref && (!submitted || ap.ref === submitted.ref));
    var locked = $('#proceedLocked'), open = $('#proceedOpen');
    if (locked) locked.hidden = !!ok;
    if (open) open.hidden = !ok;
    var label = ok ? '✅ Approved — you may now register for membership'
              : submitted ? '⏳ Pending pastoral review'
              : '📝 Not yet submitted';
    var cls = 'chip' + (ok ? ' ok' : submitted ? ' wait' : '');
    ['#statusChip', '#statusChip2'].forEach(function (sel) {
      var chip = $(sel);
      if (chip) { chip.className = cls; chip.innerHTML = label; }
    });
    if (ok && open) {
      var q = '?newcomer=1&ref=' + encodeURIComponent(ap.ref) +
              '&name=' + encodeURIComponent(A.fullName || ap.name || '') +
              '&phone=' + encodeURIComponent(A.phone || ap.phone || '');
      var link = $('#proceedBtn');
      if (link) link.setAttribute('href', 'membership.html' + q);
    }
  }

  function checkCode() {
    var ref = ($('#chkRef').value || '').trim().toUpperCase();
    var code = ($('#chkCode').value || '').trim().toUpperCase();
    var out = $('#chkOut');
    out.hidden = false;
    if (!ref || !code) { out.className = 'checkout bad'; out.textContent = 'Enter both the reference number and the approval code.'; return; }
    if (code !== approvalCode(ref)) {
      out.className = 'checkout bad';
      out.textContent = 'That code does not match. Please confirm the code with the pastoral office.';
      var lo = $('#proceedLocked'), op = $('#proceedOpen');
      if (lo) lo.hidden = false;
      if (op) op.hidden = true;
      return;
    }
    var rec = (read(CFG.keys.apps) || []).filter(function (r) { return r.ref === ref; })[0];
    if (rec) { submitted = rec; }
    write(CFG.keys.approved, { ref: ref, when: Date.now(), name: rec ? rec.name : '', phone: rec ? rec.phone : '' });
    write('jcrgm_newcomer_approved', {
      ref: ref, approvedAt: Date.now(),
      name: rec ? rec.name : '', phone: rec ? rec.phone : '',
      email: rec ? rec.email : '', area: rec ? (rec.answers || {}).area : '',
      marital: rec ? (rec.answers || {}).marital : '',
      dob: rec ? (rec.answers || {}).dob : '',
      prevChurch: rec ? rec.prevChurch : ''
    });
    out.className = 'checkout ok';
    out.textContent = '✅ Approved. You may now continue to membership registration.';
    if (rec) showSuccess(rec);
    refreshApprovalUI();
    toast('✅ Approved — proceed to membership registration.');
  }

  /* ------------------------------------------------ leadership review panel */
  function renderApps() {
    var apps = read(CFG.keys.apps) || [];
    var box = $('#appsList');
    if (!box) return;
    if (!apps.length) {
      box.innerHTML = '<p class="muted">No applications have been submitted on this device yet. Applications sent to WhatsApp ' +
        CFG.phoneLocal + ' from other phones appear in that chat — approve them there and send the applicant their approval code.</p>';
      return;
    }
    box.innerHTML = apps.map(function (r) {
      return '<article class="approw" data-ref="' + esc(r.ref) + '">' +
        '<div class="approw-top"><b>' + esc(r.name || '—') + '</b><span class="appref">' + esc(r.ref) + '</span></div>' +
        '<div class="appmeta">' + esc(r.phone || '') + ' · ' + new Date(r.when).toLocaleDateString() +
        ' · from ' + esc(r.prevChurch || '—') + '</div>' +
        '<div class="appwhy">' + esc(String(r.whyJoin || '').slice(0, 180)) + (String(r.whyJoin || '').length > 180 ? '…' : '') + '</div>' +
        '<div class="appacts">' +
        '<button type="button" class="mini pdf" data-act="pdf" data-ref="' + esc(r.ref) + '">📄 PDF</button>' +
        '<button type="button" class="mini ok" data-act="approve" data-ref="' + esc(r.ref) + '">✅ Approve</button>' +
        '<button type="button" class="mini no" data-act="decline" data-ref="' + esc(r.ref) + '">✖ Decline</button>' +
        '</div>' +
        '<div class="appcode" hidden></div>' +
        '</article>';
    }).join('');

    $$('#appsList [data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ref = b.getAttribute('data-ref');
        var rec = (read(CFG.keys.apps) || []).filter(function (r) { return r.ref === ref; })[0];
        var row = b.closest('.approw');
        var codeBox = row.querySelector('.appcode');
        if (b.getAttribute('data-act') === 'pdf') { if (rec) downloadPdf(rec); return; }
        if (b.getAttribute('data-act') === 'approve') {
          var code = approvalCode(ref);
          codeBox.hidden = false;
          codeBox.innerHTML = '<b>Approved.</b> Send this code to ' + esc(rec ? rec.phone : '') +
            ':<br><span class="code">' + code + '</span><br><span class="muted">They enter it under “I have been approved” to unlock membership registration.</span>';
          write(CFG.keys.approved, { ref: ref, when: Date.now(), name: rec ? rec.name : '', phone: rec ? rec.phone : '' });
          refreshApprovalUI();
          var t = whatsappText(rec) + '\n\n✅ *YOUR APPLICATION IS APPROVED.*\nApproval code: ' + code +
            '\nOpen the app → “I have been approved” → enter this code to register for membership.';
          window.open('https://wa.me/' + String((rec && rec.phone) || '').replace(/[^0-9]/g, '').replace(/^0/, '260') +
            '?text=' + encodeURIComponent(t), '_blank');
          return;
        }
        codeBox.hidden = false;
        codeBox.innerHTML = '<b>Declined.</b> Record the reason with the pastoral team and inform the applicant personally.';
        var apps2 = read(CFG.keys.apps) || [];
        apps2.forEach(function (x) { if (x.ref === ref) x.status = 'declined'; });
        write(CFG.keys.apps, apps2);
      });
    });
  }

  /* ------------------------------------------------------------ print mode */
  function printForm() {
    var w = window.open('', '_blank');
    if (!w) { toast('Allow pop-ups to print / save as PDF.'); return; }
    var rows = SECTIONS.map(function (s, i) {
      var body = s.fields.map(function (f) {
        var v = A[f.k];
        if (Array.isArray(v)) v = v.join(', ');
        if (typeof v === 'boolean') v = v ? 'Yes' : 'No';
        if (f.showIf && !f.showIf(A)) v = '—';
        return '<tr><th>' + esc(stripTags(f.label)) + '</th><td>' + esc(v || '—') + '</td></tr>';
      }).join('');
      return '<h2>' + (i + 1) + '. ' + esc(s.title) + '</h2><table>' + body + '</table>';
    }).join('');
    w.document.write('<!DOCTYPE html><html><head><title>JCRGM Application ' + esc(submitted ? submitted.ref : '') +
      '</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#101d44;padding:24px;font-size:12px}' +
      'h1{font-size:17px;margin:0 0 2px}h2{font-size:12.5px;background:#101d44;color:#fff;padding:5px 8px;margin:16px 0 0}' +
      'table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:left;vertical-align:top}' +
      'th{width:38%;background:#f1f5fb;font-weight:600}@media print{body{padding:0}h2{-webkit-print-color-adjust:exact}}</style></head><body>' +
      '<h1>Jesus Christ Redeems Global Ministries</h1><div>Newcomer &amp; Membership Application · ' +
      esc(submitted ? submitted.ref : '') + ' · ' + new Date().toLocaleString() + '</div>' + rows +
      '<p style="margin-top:18px">Signature: ' + esc(A.signature || '') + '  ·  Date: ' + esc(A.signDate || '') + '</p>' +
      '</body></html>');
    w.document.close();
    setTimeout(function () { try { w.print(); } catch (e) {} }, 400);
  }

  /* ------------------------------------------------------------------ init */
  function init() {
    var had = loadDraft();
    if (had) {
      var resume = $('#resumeBar');
      if (resume) {
        resume.hidden = false;
        $('#resumeText').textContent = 'You have an unfinished application saved on this device.';
        $('#resumeYes').addEventListener('click', function () { resume.hidden = true; });
        $('#resumeNo').addEventListener('click', function () {
          A = {}; step = 0; write(CFG.keys.draft, null); resume.hidden = true; renderStep();
        });
      }
    }

    renderStep();

    $('#nextBtn').addEventListener('click', function () {
      if (!validateStep(false)) return;
      if (step < STEPS.length - 1) { step++; renderStep(); saveDraft(); }
      else submit();
    });
    $('#backBtn').addEventListener('click', function () {
      if (step > 0) { step--; renderStep(); saveDraft(); }
    });

    // success actions
    $('#dlPdf').addEventListener('click', function () { if (submitted) downloadPdf(submitted); });
    $('#waSend').addEventListener('click', function () { if (submitted) sharePdfToWhatsApp(submitted); });
    $('#waText').addEventListener('click', function () { if (submitted) openWhatsAppText(submitted); });
    $('#copySum').addEventListener('click', function () {
      if (!submitted) return;
      copyText(whatsappText(submitted), function (ok) {
        toast(ok ? '📋 Summary copied — paste it into WhatsApp.' : 'Copy failed — please select and copy manually.');
      });
    });
    $('#printForm').addEventListener('click', printForm);
    $('#startNew').addEventListener('click', function () {
      if (confirm('Start a brand new application? The current form on screen will be cleared (your submitted record stays).')) {
        A = {}; step = 0; submitted = null;
        write(CFG.keys.draft, null);
        $('#successWrap').hidden = true; $('#formWrap').hidden = false;
        renderStep(); refreshApprovalUI();
      }
    });

    $('#chkBtn').addEventListener('click', checkCode);
    $('#chkRef').addEventListener('keydown', function (e) { if (e.key === 'Enter') checkCode(); });
    $('#chkCode').addEventListener('keydown', function (e) { if (e.key === 'Enter') checkCode(); });

    var lockedBox = $('#proceedLocked');
    if (lockedBox && !$('#askCode')) {
      var ask = document.createElement('a');
      ask.id = 'askCode';
      ask.href = 'https://wa.me/' + CFG.phoneIntl + '?text=' + encodeURIComponent('Shalom. I have submitted my JCRGM newcomer application. Please send me my approval code. My reference is: ' + (($('#chkRef') && $('#chkRef').value) || '(my reference number)'));
      ask.target = '_blank';
      ask.rel = 'noopener';
      ask.style.cssText = 'display:inline-block;margin-top:9px;font-weight:800;color:#1f3c88;text-decoration:none';
      ask.textContent = '💬 Request my approval code on WhatsApp';
      lockedBox.appendChild(document.createElement('br'));
      lockedBox.appendChild(ask);
    }

    var leadToggle = $('#leadToggle');
    if (leadToggle) {
      leadToggle.addEventListener('click', function () {
        var p = $('#leadPanel');
        var open = p.hidden;
        p.hidden = !open;
        leadToggle.setAttribute('aria-expanded', String(open));
        if (open) renderApps();
      });
    }

    // autosave on unload
    window.addEventListener('beforeunload', function () { var fw = $('#formWrap'); if (!fw || !fw.hidden) saveDraft(); });

    // if there is an approved record, show the unlock straight away
    var ap = approvedRecord();
    if (ap && ap.ref) {
      $('#chkRef').value = ap.ref;
      $('#chkCode').value = approvalCode(ap.ref);
    }
    // deep link ?ref=...
    var m = (location.search || '').match(/[?&]ref=([A-Za-z0-9\-]+)/);
    if (m) $('#chkRef').value = m[1].toUpperCase();

    refreshApprovalUI();

    // graceful handoff: if the membership page is not on this server, explain instead of 404
    var proceedBtn = $('#proceedBtn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', function (ev) {
        var href = proceedBtn.getAttribute('href') || '';
        fetch('membership.html', { method: 'HEAD' }).then(function (r) {
          if (!r.ok) throw new Error('missing');
        }).catch(function () {
          ev.preventDefault();
          toast('Membership page not found on this server. Open the Membership tab from the app menu and give the desk your reference number.');
        });
      });
    }

    // prefill name/phone from the membership register if available
    try {
      var reg = read('jcrgm_members') || read('jcrgm_members_v1');
      if (reg && reg.length && !A.fullName) { /* leave to the user */ }
    } catch (e) {}
  }

  /* small public hook (used by the leadership desk & for testing) */
  window.JCRGMJoin = {
    buildPdf: function () { return buildPdf(submitted); },
    pdfBlob: function () { return pdfBlob(submitted); },
    approvalCode: approvalCode,
    state: function () { return { answers: A, submitted: submitted, step: step }; },
    goStep: function (n) { step = Math.max(0, Math.min(STEPS.length - 1, n)); renderStep(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
