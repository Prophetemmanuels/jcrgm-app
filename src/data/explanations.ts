// Verse-by-verse explanations, commentary, cross-references, and word studies.
// Key format: "bookId_chapter_verse"  (e.g. "joh_3_16")

export interface VerseExplanation {
  summary: string;
  details: string;
  theme: string;
  crossReferences: string[]; // formatted as "Book Chapter:Verse"
  keywords?: { word: string; meaning: string }[];
  application?: string;
}

export const EXPLANATIONS: Record<string, VerseExplanation> = {
  // ── GENESIS ───────────────────────────────────────────────
  gen_1_1: {
    summary: "The foundational declaration of Scripture: God is the eternal Creator of all that exists.",
    details: "The Hebrew opens with 'Bereshith' — 'In the beginning.' This is not a beginning of God (who is eternal, without beginning), but the beginning of the created order: the heavens (the sky/universe) and the earth (our planet). The verb 'created' (bara) is used exclusively of divine activity and emphasizes that creation was ex nihilo — out of nothing — by the direct command of God. There is no rival deity, no pre-existing matter, and no evolutionary process described; God alone speaks and it is so.",
    theme: "Creation & God's Sovereignty",
    crossReferences: ["joh_1_1", "col_1_16", "heb_11_3", "rev_4_11"],
    keywords: [
      { word: "God (Elohim)", meaning: "The supreme, all-powerful Creator. The plural form hints at the multi-personal nature of God (Trinity) while the singular verbs affirm one God." },
      { word: "created (bara)", meaning: "To shape, form, or bring into being. Used only of God's unique creative acts." },
      { word: "beginning (reshith)", meaning: "The first, the chief, the start of the temporal order." },
    ],
    application: "Rest in the truth that the same God who spoke the universe into existence is sovereign over your life. He is before all things and holds all things together.",
  },
  gen_1_26: {
    summary: "Humanity is uniquely made in the image and likeness of God.",
    details: "The phrase 'Let us make man' uses the plural of majesty and grace, reflecting the triune Godhead in counsel. To be made 'in the image of God' (imago Dei) means humans alone among creation bear God's likeness — in moral capacity, reason, relationship, creativity, and dominion. This is the foundation of human dignity, the sanctity of life, and equality before God. Dominion is given as stewardship, not exploitation — to rule as God's vice-regents over the earth.",
    theme: "Humanity & the Image of God",
    crossReferences: ["gen_1_27", "psa_8_5", "col_3_10", "jas_3_9"],
    keywords: [
      { word: "image (tselem)", meaning: "A representative likeness; humanity reflects God's character and authority." },
      { word: "dominion", meaning: "Rulership and responsible care, like a king governing on behalf of the true King." },
    ],
    application: "Every person you meet bears God's image. This calls you to defend human dignity, practice justice, and care for creation as a steward.",
  },
  gen_1_27: {
    summary: "God created mankind — male and female — together bearing His image.",
    details: "Both man and woman are equally made in the image of God. Neither is inferior; both are essential and complementary. The text deliberately mentions 'male and female' to show that the image of God is expressed through the union and diversity of the two sexes. This verse is the bedrock of biblical teaching on marriage, gender, and the equal worth of all people.",
    theme: "Humanity & Equality",
    crossReferences: ["gen_1_26", "mat_19_4", "gal_3_28"],
  },
  gen_2_7: {
    summary: "God forms man from dust and breathes life into him.",
    details: "The LORD God (Yahweh Elohim) personally shaped the first man from the dust of the ground (adam from adamah — ground), showing our humble physical origin. Then He 'breathed into his nostrils the breath of life,' and man became a 'living soul' (nephesh chayyah). This distinguishes humanity from animals: we are material bodies infused with the very breath of God, making us living persons — body and spirit together, not a soul trapped in a body.",
    theme: "The Nature of Humanity",
    crossReferences: ["gen_1_27", "job_33_4", "psa_104_30"],
    keywords: [
      { word: "breath of life", meaning: "The life-giving Spirit of God; the same word later describes the wind and the Spirit." },
      { word: "living soul", meaning: "A whole living being — not an immortal detached soul, but a person alive before God." },
    ],
  },
  gen_3_15: {
    summary: "The first gospel promise: the serpent's head will be crushed by the woman's offspring.",
    details: "Often called the 'Protoevangelium' (first gospel), this is God's earliest promise of redemption. The 'seed of the woman' points prophetically to the virgin-born Messiah (Galatians 4:4; Isaiah 7:14). The serpent (Satan) will bruise the Savior's heel (His suffering on the cross), but the Savior will crush the serpent's head (definitive victory over sin and death). Enmity is placed between the kingdom of darkness and the people of God, a conflict that runs through all of Scripture until its resolution at the cross and return of Christ.",
    theme: "Prophecy & Redemption",
    crossReferences: ["isa_7_14", "gal_4_4", "rom_16_20", "rev_12_9", "rev_20_10"],
    application: "In your darkest moments, remember that God's plan to defeat evil was announced in the very chapter sin entered the world. Victory is certain.",
  },
  gen_3_16: {
    summary: "The consequences of the Fall enter human relationships and creation.",
    details: "Because of sin, the harmony of Eden is shattered. Pain in childbearing and strained relational dynamics enter the world. The phrase 'thy desire shall be to thy husband' speaks of a twisting of the God-designed partnership into a struggle for control. These are consequences of the Fall, not God's original intent, and they point to the brokenness that only Christ can restore (Ephesians 5:21-33).",
    theme: "The Fall & Its Consequences",
    crossReferences: ["rom_8_22", "eph_5_22", "1ti_2_14"],
  },

  // ── JOHN ───────────────────────────────────────────────
  joh_1_1: {
    summary: "The eternal Word (Logos) was with God and was God.",
    details: "John's Gospel opens in eternity, paralleling Genesis 1:1. 'The Word' (Logos) is a profound title for the pre-existent Son of God. He was 'with God' (distinct in person) yet 'was God' (one in essence). This demolishes any notion that Jesus was merely a good teacher — He is the eternal, divine Second Person of the Trinity. As the Word, He is God's self-expression; what God is, the Word reveals.",
    theme: "The Deity of Christ",
    crossReferences: ["gen_1_1", "joh_1_14", "col_2_9", "heb_1_3", "rev_19_13"],
    keywords: [
      { word: "Word (Logos)", meaning: "The divine self-expression; the rational, creative utterance of God made personal." },
      { word: "was God", meaning: "The Greek grammar emphasizes the Word's divine nature — not 'a god' but fully God." },
    ],
    application: "Worship Jesus as God. The One who spoke creation into being is the same One who walked among us and died for us.",
  },
  joh_1_12: {
    summary: "All who receive Christ and believe in His name are given the right to become children of God.",
    details: "This is one of the clearest verses on how a person is saved. 'Receive' implies welcoming Him as He truly is. 'Believe' is trusting reliance, not mere intellectual agreement. The result is not earned status but a granted privilege — 'power' (authority, right) to be born of God. Salvation is by grace through faith; we do not become children by blood, human will, or effort, but by the new birth (John 3:3-8).",
    theme: "Salvation by Faith",
    crossReferences: ["joh_3_16", "joh_3_3", "eph_2_8", "1jh_3_1", "rom_10_9"],
    application: "Have you received Him? Belief is the open hand that receives the gift. Today you can become a child of God.",
  },
  joh_1_14: {
    summary: "The Word became flesh and dwelt among us, full of grace and truth.",
    details: "The greatest miracle in history: the infinite, eternal God took on a finite human nature. 'Dwelt' (skenoo) means 'tabernacled' — God pitched His tent among us, echoing the wilderness Tabernacle where His glory dwelt. In Christ, the Shekinah glory is seen face to face. He is 'full of grace and truth' — grace that forgives and truth that exposes, perfectly balanced. The incarnation is essential: only a God-man could both reveal God and redeem sinners.",
    theme: "The Incarnation",
    crossReferences: ["joh_1_1", "phi_2_7", "isa_7_14", "col_2_9", "1ti_3_16"],
    keywords: [
      { word: "flesh", meaning: "Genuine full humanity — not a phantom, but real human nature with its weakness (apart from sin)." },
      { word: "dwelt (tabernacled)", meaning: "Pitched His tent; God's glory now dwelling in the Person of Christ." },
    ],
    application: "Because Jesus became flesh, He understands your weaknesses (Hebrews 4:15). You have a Savior who knows what it is to be human.",
  },
  joh_3_16: {
    summary: "For God so loved the world that He gave His only Son, that whoever believes in Him shall not perish but have eternal life.",
    details: "The most famous verse in the Bible and the gospel in a single sentence. 'So' speaks of the manner and measure of God's love — demonstrated at the cross. 'The world' means lost humanity, not just Israel. 'Gave His only begotten Son' points to the Father's willing sacrifice of the Beloved. 'Whosoever' extends the offer to all without distinction. 'Believeth' is trusting faith. 'Perish' is eternal separation; 'eternal life' is knowing God now and forever (John 17:3). The verse reveals both the love of the Father and the necessity of the Son's death.",
    theme: "God's Love & Salvation",
    crossReferences: ["joh_1_12", "rom_5_8", "1jh_4_9", "eph_2_8", "2co_5_21"],
    keywords: [
      { word: "so loved", meaning: "Loved in this manner and to this degree — love shown in action at the cross." },
      { word: "only begotten (monogenes)", meaning: "Unique, one-of-a-kind Son; speaks of His eternal relationship to the Father." },
      { word: "eternal life", meaning: "Not just unending existence but the quality of life in relationship with God, beginning now." },
    ],
    application: "God's love is not abstract — it sent Jesus to die for you. Receive His gift by faith and you pass from death to life.",
  },
  joh_3_3: {
    summary: "Jesus declares that unless one is born again, he cannot see the kingdom of God.",
    details: "Nicodemus, a religious leader, came at night. Jesus cuts to the heart: external religion and lineage are insufficient. 'Born again' (gennao anothen — 'from above') means a supernatural, Spirit-wrought new birth. Just as physical birth gives physical life, the Spirit gives spiritual life. Without it, no one can perceive or enter God's kingdom. This is not self-improvement but a new creation (2 Corinthians 5:17).",
    theme: "The New Birth",
    crossReferences: ["joh_1_12", "joh_3_16", "2co_5_17", "1pe_1_23", "tit_3_5"],
    application: "Church attendance and good behavior cannot make you a Christian. You need the Spirit to give you new life from above.",
  },
  joh_8_32: {
    summary: "You shall know the truth, and the truth shall make you free.",
    details: "Jesus spoke this to those who believed in Him. Truth is not a philosophy but a Person — Jesus Himself (John 14:6). Knowing Him sets people free from the slavery of sin, the bondage of falsehood, and the fear of death. This freedom is internal and spiritual; it does not guarantee absence of external trouble, but it breaks sin's dominion (Romans 6:14).",
    theme: "Freedom in Christ",
    crossReferences: ["joh_14_6", "rom_6_14", "rom_8_2", "2co_3_17", "gal_5_1"],
  },
  joh_11_25: {
    summary: "Jesus declares, 'I am the resurrection and the life; whoever believes in Me shall live even if he dies.'",
    details: "Spoken at the tomb of Lazarus, this is the fifth of John's 'I Am' statements, identifying Jesus with Yahweh (Exodus 3:14). He is not merely describing resurrection; He is its source and power. Physical death is not the end for the believer — because Christ conquered death, those who trust Him have life that death cannot extinguish. This is the Christian's hope in the face of grief.",
    theme: "Resurrection & Hope",
    crossReferences: ["joh_14_6", "1co_15_20", "1th_4_14", "rev_1_18", "dan_12_2"],
    application: "In seasons of loss, cling to Christ who is the Resurrection. Death is a defeated enemy for all who believe.",
  },
  joh_14_6: {
    summary: "Jesus says, 'I am the way, the truth, and the life; no one comes to the Father except through Me.'",
    details: "Amid the disciples' confusion, Jesus gives the definitive answer to how we reach God. He is not one of many paths but the exclusive Way — the only mediator between God and man (1 Timothy 2:5). As 'the truth' He reveals the Father; as 'the life' He imparts it. The exclusivity is not arrogance but necessity: sin separates us from a holy God, and only the God-man's atoning work reconciles. This is the cornerstone of the gospel.",
    theme: "The Exclusivity of Christ",
    crossReferences: ["joh_1_1", "joh_11_25", "1ti_2_5", "act_4_12", "eph_2_18"],
    keywords: [
      { word: "the Way", meaning: "The only path of access to God; later used as a name for the early Christian faith (Acts 9:2)." },
      { word: "the Life", meaning: "The source of both spiritual and eternal life." },
    ],
    application: "If you are searching for God, stop looking for a path — follow the Person. Jesus alone reconciles you to the Father.",
  },

  // ── ROMANS ───────────────────────────────────────────────
  rom_3_23: {
    summary: "All have sinned and fall short of the glory of God.",
    details: "Paul reaches this grim conclusion after demonstrating that both Gentiles and Jews are under sin (Romans 1-3). 'All' leaves no exception — every person without Christ is a sinner. 'Fall short' is a athletic metaphor (missing the mark, like an archer missing the target). The standard is 'the glory of God' — His perfect holiness. This verse is the diagnosis that makes the gospel necessary: if we are all guilty, we all need a Savior.",
    theme: "The Universality of Sin",
    crossReferences: ["rom_3_10", "rom_5_12", "isa_53_6", "ecc_7_20", "psa_14_3"],
    application: "Admitting 'all have sinned' is the first step to grace. You are not 'basically good' — you need what only Christ provides.",
  },
  rom_6_23: {
    summary: "The wages of sin is death, but the gift of God is eternal life in Christ Jesus.",
    details: "A crisp contrast between two outcomes. 'Wages' are what sin earns — death, both physical and eternal separation from God (the just penalty). But 'the gift of God' is unearned; eternal life cannot be worked for or bought. It comes 'through Christ Jesus our Lord' — through His substitutionary death. The shift from 'wages' (earned) to 'gift' (freely given) is the heart of the gospel: what we deserve vs. what we receive by grace.",
    theme: "Sin's Wages vs. God's Gift",
    crossReferences: ["rom_3_23", "rom_5_8", "eph_2_8", "joh_3_16", "rev_20_14"],
  },
  rom_8_1: {
    summary: "There is therefore now no condemnation for those who are in Christ Jesus.",
    details: "The 'therefore' looks back to Romans 7's struggle with sin and forward to the victory of chapter 8. For the believer united to Christ, the verdict of condemnation has been fully removed. 'No condemnation' means God the Judge declares the sinner righteous (justification). It is not based on our performance but on our position 'in Christ.' This is the believer's permanent standing, not a temporary reprieve.",
    theme: "No Condemnation / Assurance",
    crossReferences: ["rom_5_1", "joh_3_18", "rom_8_33", "eph_1_7", "1jh_3_1"],
    keywords: [
      { word: "no condemnation", meaning: "No adverse verdict; the believer is acquitted before God's bar of justice." },
      { word: "in Christ Jesus", meaning: "The defining position of the believer — united to Christ by faith." },
    ],
    application: "When guilt accuses you, remind yourself: 'There is NO condemnation.' You are secure in Christ, not because of your record but His.",
  },
  rom_8_28: {
    summary: "All things work together for good to those who love God and are called according to His purpose.",
    details: "One of the most cherished promises in Scripture. 'All things' — not all things are good, but all things are woven by God's sovereign hand for the believer's ultimate good. The 'good' is not always comfort or prosperity but conformity to Christ (v.29). The condition is loving God and being 'called' — belonging to Him. This does not mean every event feels good, but that the Master Weaver brings purpose from pain.",
    theme: "God's Sovereignty & Providence",
    crossReferences: ["gen_50_20", "phi_1_6", "eph_1_11", "jas_1_2", "1pe_1_7"],
    application: "In suffering, you may not see the good now — but trust the promise. God is working all things for your growth and His glory.",
  },
  rom_8_38: {
    summary: "Nothing in all creation can separate us from the love of God in Christ Jesus.",
    details: "Paul piles up a comprehensive list — death, life, angels, demons, present, future, powers, height, depth, anything else — to prove the believer's security. The love of God is not fragile; it is anchored in His unchanging character and Christ's finished work. No circumstance, no force, no created thing can sever the bond between the redeemed and their Redeemer.",
    theme: "Security of the Believer",
    crossReferences: ["rom_8_1", "joh_10_28", "phi_1_6", "eph_1_13", "1pe_1_5"],
    application: "Your grip on God may slip, but His grip on you never will. Nothing can separate you from His love.",
  },
  rom_12_1: {
    summary: "Present your bodies as a living sacrifice, holy and acceptable to God — this is true worship.",
    details: "After eleven chapters of doctrine, Paul turns to practice with 'therefore.' Because of God's mercies, the right response is total surrender. In the Old Testament, animals were sacrificed; now believers offer themselves — their whole lives — as 'living sacrifices.' This is 'reasonable' (logikos — logical) service. Worship is not confined to a building; it is a life laid down daily.",
    theme: "Consecration & Worship",
    crossReferences: ["rom_6_13", "1pe_2_5", "phi_3_8", "lk_9_23", "mic_6_8"],
    application: "Worship is more than singing — it is offering your body, time, and choices to God each day. What are you holding back?",
  },

  // ── PHILIPPIANS ─────────────────────────────────────────
  phi_2_5: {
    summary: "Have this mind in you which was also in Christ Jesus.",
    details: "The 'therefore' connects to the call for unity in the church. Paul points to Christ's humility as the model for Christian relationships. To 'have this mind' means to adopt Christ's attitude of self-emptying love (the kenosis of vv. 6-8). Humility is not thinking less of yourself but thinking of yourself less, following the One who laid aside privilege to serve.",
    theme: "Humility & Unity",
    crossReferences: ["phi_2_3", "joh_13_14", "mat_20_28", "rom_12_10", "eph_4_2"],
  },
  phi_4_6: {
    summary: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
    details: "Paul gives the antidote to anxiety: replacement, not suppression. 'Do not be anxious' is a command, not a suggestion; worry is a form of unbelief. The remedy is 'prayer' (communion), 'supplication' (specific requests), and 'thanksgiving' (trusting God's past faithfulness). We are to bring 'everything' to God — no burden is too small. The result follows in v.7: the peace of God guarding our hearts.",
    theme: "Anxiety & Prayer",
    crossReferences: ["mat_6_25", "1pe_5_7", "phi_4_7", "php_4_19", "psa_55_22"],
    keywords: [
      { word: "anxious (merimnao)", meaning: "To be pulled apart, distracted by worry; the opposite of single-hearted trust." },
      { word: "thanksgiving", meaning: "Gratitude that acknowledges God's sovereignty and past goodness." },
    ],
    application: "Next time anxiety rises, turn it into a prayer with thanksgiving. The peace of God will stand guard over your heart.",
  },
  phi_4_7: {
    summary: "The peace of God, which surpasses all understanding, will guard your hearts and minds in Christ Jesus.",
    details: "This is the promised result of casting cares on God (v.6). God's peace is not the absence of trouble but a supernatural calm that 'surpasses all understanding' — it cannot be explained by circumstances. It 'guards' (a military term, like a garrison) the believer's 'heart' (the center of will/affections) and 'mind' (thoughts). The protection is 'in Christ Jesus' — only those united to Him experience it.",
    theme: "God's Peace",
    crossReferences: ["phi_4_6", "joh_14_27", "isa_26_3", "col_3_15", "1pe_5_7"],
  },
  phi_4_13: {
    summary: "I can do all things through Christ who strengthens me.",
    details: "Often quoted out of context as a formula for personal success. In context, Paul is speaking of contentment in every circumstance — plenty or hunger, abundance or need. The 'all things' refers to enduring and obeying in whatever state he faces, not achieving any selfish ambition. The secret is Christ's enabling power (literally 'the One strengthening me'). The strength is for faithful living, not worldly conquest.",
    theme: "Contentment & Strength",
    crossReferences: ["2co_12_9", "isa_40_29", "eph_3_16", "phi_4_11", "heb_13_5"],
    application: "You can endure whatever God allows, not in your own strength but His. Contentment is learned through His empowering grace.",
  },

  // ── PSALMS ───────────────────────────────────────────────
  psa_23_1: {
    summary: "The LORD is my Shepherd; I shall not want.",
    details: "David, a former shepherd, declares the LORD (Yahweh) as his personal Shepherd. In the ancient Near East, a shepherd provided, protected, guided, and defended the flock. 'I shall not want' does not mean endless material wealth but that the Shepherd supplies every true need. God's care is covenantal and personal — 'my' Shepherd. This sets the tone for the whole psalm: the believer lacks nothing essential because God provides.",
    theme: "God as Shepherd",
    crossReferences: ["psa_100_3", "isa_40_11", "joh_10_11", "eze_34_11", "1pe_2_25"],
    keywords: [
      { word: "LORD (Yahweh)", meaning: "The covenant name of God — the faithful, self-existent One who keeps His promises." },
      { word: "Shepherd", meaning: "One who feeds, leads, protects, and knows His sheep by name." },
    ],
    application: "You have a Shepherd who knows your name and supplies your needs. Trust His provision rather than your own striving.",
  },
  psa_23_4: {
    summary: "Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me.",
    details: "The image shifts from green pastures to a dark, dangerous ravine — the reality of suffering in a fallen world. The 'shadow of death' is deep darkness, but only a shadow; it cannot harm the sheep under the Shepherd's rod and staff. The key is presence: 'You are with me.' Fear is banished not by the absence of danger but by the presence of God. The rod defends; the staff guides and rescues.",
    theme: "God's Presence in Suffering",
    crossReferences: ["psa_46_1", "isa_43_2", "mat_28_20", "heb_13_5", "rev_21_4"],
    application: "You may walk through valleys, but you do not walk alone. His rod and staff comfort you in the dark.",
  },
  psa_1_1: {
    summary: "Blessed is the man who does not walk in the counsel of the wicked.",
    details: "The Psalter opens with a contrast between the righteous and the wicked. 'Blessed' (ashre) means happy, fulfilled, favored — not materially but in God's favor. The progression in the Hebrew ('walk... stand... sit') shows increasing intimacy with sin, which the blessed person avoids. Instead, his delight is in God's law, and he meditates on it day and night (v.2). This is the gateway to the whole book of praise.",
    theme: "The Way of the Righteous",
    crossReferences: ["psa_1_2", "jos_1_8", "jer_17_7", "mat_5_3", "jam_1_25"],
  },
  psa_91_1: {
    summary: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty.",
    details: "A psalm of refuge for those in danger. 'Dwells' implies a permanent residence, not a visiting tourist. To live in the 'shelter' of God is to abide under His protective covering. The 'shadow of the Almighty' is a place of cool safety — like a cliff's shade in the desert. The promise is covenantal: those who make God their home find security from the storms of life.",
    theme: "God as Refuge",
    crossReferences: ["psa_46_1", "psa_61_4", "pro_18_10", "psa_27_1", "mat_23_37"],
  },
  psa_119_105: {
    summary: "Your word is a lamp to my feet and a light to my path.",
    details: "In the longest chapter of the Bible (176 verses, all about God's Word), this verse captures its practical purpose. In a dark world, Scripture is not a spotlight showing the whole future but a lamp illuminating the next step. God's Word guides daily decisions, warns of danger, and reveals the way. The psalmist's love for the law flows from its reliability as a guide.",
    theme: "Scripture as Guidance",
    crossReferences: ["psa_119_11", "pro_6_23", "2ti_3_16", "psa_19_7", "psa_43_3"],
    keywords: [
      { word: "lamp", meaning: "A small light for the immediate step ahead, not the full map — enough for obedience today." },
      { word: "word", meaning: "God's revealed instruction; here the Torah, ultimately all Scripture." },
    ],
    application: "When the way is unclear, open the Word. God promises enough light for the next step if you will walk in it.",
  },

  // ── PROVERBS ─────────────────────────────────────────────
  pro_3_5: {
    summary: "Trust in the LORD with all your heart and lean not on your own understanding.",
    details: "The heart of biblical wisdom. 'Trust' (batach) means to lean your full weight on God as you would on a sturdy support. 'With all your heart' excludes divided loyalty. The negative command — 'lean not on your own understanding' — warns against self-reliance and limited human perspective. We see part; God sees all. True wisdom begins with humble dependence on Him, not cleverness.",
    theme: "Trust & Wisdom",
    crossReferences: ["pro_3_6", "psa_37_5", "jer_17_7", "pro_28_26", "isa_55_8"],
    keywords: [
      { word: "trust (batach)", meaning: "To confide in, lean upon; a posture of confident reliance." },
      { word: "understanding", meaning: "Human insight, which is partial and fallen — not to be our final authority." },
    ],
    application: "When a decision confuses you, don't lean on your own logic. Trust the Lord fully and submit the choice to Him.",
  },
  pro_3_6: {
    summary: "In all your ways acknowledge Him, and He will make your paths straight.",
    details: "The pair to v.5. 'Acknowledge' (yada) means to recognize, know, and defer to God in every avenue of life — work, relationships, finances, plans. The promise: He will 'make your paths straight' — not necessarily easy or short, but level, directed, and free of needless detours caused by folly. God honors a life that consults Him.",
    theme: "Acknowledging God",
    crossReferences: ["pro_3_5", "pro_16_3", "psa_37_23", "jam_1_5", "mic_6_8"],
  },

  // ── MATTHEW ─────────────────────────────────────────────
  mat_5_3: {
    summary: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
    details: "The first of the Beatitudes that open the Sermon on the Mount. 'Poor in spirit' describes those who recognize their spiritual bankruptcy before God — they bring nothing, claim nothing, and depend wholly on His mercy. This is the opposite of self-righteousness. Such people inherit 'the kingdom of heaven' — they enter God's reign now and fully in eternity. The Beatitudes describe the character of citizens of God's kingdom.",
    theme: "The Beatitudes / Kingdom Character",
    crossReferences: ["mat_5_10", "luk_18_14", "isa_57_15", "rev_3_17", "jam_2_5"],
    keywords: [
      { word: "poor in spirit", meaning: "Aware of one's utter need of God; the spiritual counterpart of literal poverty." },
      { word: "kingdom of heaven", meaning: "God's reign and realm, present where His will is done and consummated at Christ's return." },
    ],
    application: "The kingdom belongs to those who know they have nothing to offer God. Admit your poverty and receive His riches.",
  },
  mat_5_16: {
    summary: "Let your light shine before others, so they may see your good works and glorify your Father in heaven.",
    details: "Jesus calls His followers 'the light of the world' (v.14). Good works are not the means of salvation but the evidence of it. The goal is not self-promotion but that observers 'glorify your Father in heaven.' Our conduct is a witness; the aim is God's fame, not ours. This reorients motivation: live openly for His glory.",
    theme: "Witness & Good Works",
    crossReferences: ["mat_5_14", "1pe_2_12", "phi_2_15", "eph_2_10", "1co_10_31"],
  },
  mat_6_9: {
    summary: "Pray then like this: 'Our Father in heaven, hallowed be Your name.'",
    details: "Jesus gives the Lord's Prayer as a model, not a rigid formula to recite mindlessly (v.7). It begins with relationship ('Our Father') and reverence ('hallowed be Your name'). 'Our' stresses corporate, family prayer; 'Father' reveals intimate access; 'hallowed' puts God's holiness first. The prayer then balances God's glory (Thy kingdom, Thy will) with human need (daily bread, forgiveness, deliverance).",
    theme: "The Lord's Prayer",
    crossReferences: ["mat_6_6", "luk_11_2", "rom_8_15", "joh_15_7", "1jh_5_14"],
  },
  mat_6_33: {
    summary: "Seek first the kingdom of God and His righteousness, and all these things will be added to you.",
    details: "The climax of Jesus' teaching on anxiety (vv.25-34). 'These things' are food, clothing, and necessities. The priority is clear: pursue God's reign and His righteousness above material security. When God's kingdom is first, necessities follow as a byproduct. This reverses the world's order, which seeks things first and God last. Trust God's provision by seeking Him above all.",
    theme: "Priorities & Provision",
    crossReferences: ["mat_6_25", "phi_4_6", "luk_12_31", "hek_11_6", "psa_37_4"],
    application: "Stop scrambling for things and start seeking the King. When He is first, your needs are covered by His care.",
  },
  mat_7_7: {
    summary: "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you.",
    details: "Three escalating commands — ask (prayer), seek (diligence), knock (persistence) — assure believers that God answers earnest prayer. The verbs are present imperatives, implying continuous action: 'keep asking, seeking, knocking.' The context is seeking God and His kingdom. Jesus' point: the heavenly Father delights to give good gifts to His children (v.11), far more than earthly parents.",
    theme: "Persistent Prayer",
    crossReferences: ["mat_7_8", "joh_16_24", "lk_11_9", "1jh_5_14", "jer_29_13"],
  },

  // ── EPHESIANS ──────────────────────────────────────────
  eph_2_8: {
    summary: "For by grace you have been saved through faith; and this is not your own doing, it is the gift of God.",
    details: "The clearest statement of salvation by grace alone. 'Grace' (charis) is unmerited favor — favor to the undeserving. 'Saved' is past tense and passive: it is done to us, not by us. 'Through faith' is the empty hand that receives; faith itself is 'not of yourselves' but 'the gift of God.' Works are explicitly excluded as the ground of salvation (v.9), so that no one may boast. Salvation is entirely God's gift from start to finish.",
    theme: "Salvation by Grace",
    crossReferences: ["eph_2_9", "rom_3_23", "rom_6_23", "tit_3_5", "gal_2_16"],
    keywords: [
      { word: "grace (charis)", meaning: "Undeserved, unearned favor; God's disposition to bless the guilty." },
      { word: "faith", meaning: "Trusting reliance on Christ; the receiver, not the cause, of salvation." },
      { word: "gift", meaning: "Not earned or bought; freely given by God's initiative." },
    ],
    application: "You cannot earn your way to God. Salvation is a gift — receive it by faith and boast only in His grace.",
  },
  eph_2_10: {
    summary: "We are His workmanship, created in Christ Jesus for good works which God prepared beforehand.",
    details: "Immediately after declaring salvation is not by works (v.8-9), Paul affirms that good works are the purpose, not the cause, of salvation. 'Workmanship' (poiema — our word 'poem') means we are God's masterpiece, His new creation. The good life we now live was 'prepared beforehand' by God. Works flow from salvation as fruit from a tree; they display God's glory but never earn it.",
    theme: "Created for Good Works",
    crossReferences: ["eph_2_8", "tit_2_14", "phi_2_13", "2co_5_17", "jam_2_17"],
  },

  // ── OTHERS ─────────────────────────────────────────────
  isa_40_31: {
    summary: "Those who wait for the LORD shall renew their strength; they shall mount up with wings like eagles.",
    details: "In a chapter extolling God's incomparable power, Isaiah promises strength to the weary who 'wait' (qavah — to hope, to bind together in expectation) on Him. The image of eagles soaring speaks of effortless strength drawn from God, not self. Waiting is active trust, not passive resignation. The promise spans walking, running, and flying — God meets His people at every level of exhaustion.",
    theme: "Strength in Waiting",
    crossReferences: ["psa_27_14", "isa_40_29", "lam_3_25", "rom_8_25", "heb_12_1"],
  },
  jas_1_5: {
    summary: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach.",
    details: "In the context of facing trials (v.2-4), James points to the need for wisdom to endure. God is the source, and He gives 'generously' (simply, with open hand) and 'without reproach' — He never scolds us for asking or reminds us of past folly. The requirement is faith, not doubt (v.6). Wisdom here is practical skill for godly living, especially under pressure.",
    theme: "Wisdom from God",
    crossReferences: ["pro_2_6", "1ki_3_9", "pro_3_5", "jam_3_17", "col_2_3"],
  },
  heb_11_1: {
    summary: "Faith is the assurance of things hoped for, the conviction of things not seen.",
    details: "The 'faith chapter' opens with a definition. Faith is not blind wishful thinking but 'assurance' (hypostasis — substance, foundation) and 'conviction' (elegmos — proof) of unseen realities. It is confidence in God's promises about the future and trust in His invisible hand in the present. The rest of the chapter surveys men and women who lived by such faith, proving it is real and rewarded.",
    theme: "The Nature of Faith",
    crossReferences: ["heb_11_6", "rom_4_18", "2co_5_7", "joh_20_29", "1pe_1_8"],
    keywords: [
      { word: "assurance (hypostasis)", meaning: "Confident substance; the solid ground beneath hope." },
      { word: "conviction (elegmos)", meaning: "A deep persuasion or proof of what the eyes cannot see." },
    ],
  },
  rev_3_20: {
    summary: "Behold, I stand at the door and knock; if anyone hears My voice and opens, I will come in and eat with him.",
    details: "Spoken by the risen Christ to the lukewarm church at Laodicea, yet a universal invitation. The door is the human heart; Christ stands outside and knocks — He does not force entry. 'If anyone' extends grace to all. The response is to 'hear' and 'open' — a personal decision. Fellowship ('eat with him') pictures intimate relationship. This is often used as an evangelistic call, though originally addressed to believers to renew closeness.",
    theme: "Christ's Invitation",
    crossReferences: ["joh_10_9", "rev_19_9", "lk_13_29", "joh_14_23", "rom_10_9"],
    application: "Jesus knocks at the door of your heart. He will not break in — but He waits for you to open. Will you let Him in?",
  },
};

// Word-study glossary for quick reference
export const GLOSSARY: Record<string, { definition: string; hebrew?: string; greek?: string }> = {
  Elohim: { definition: "The Hebrew word for God; plural in form, affirming the Triune nature while used with singular verbs for one God.", hebrew: "אֱלֹהִים" },
  Yahweh: { definition: "The covenant name of God (LORD in caps); 'I AM WHO I AM' — the self-existent, faithful One.", hebrew: "יְהוָה" },
  Logos: { definition: "The Word; God's divine self-expression, revealed fully in the Person of Jesus Christ.", greek: "Λόγος" },
  charis: { definition: "Grace; unmerited favor and kindness shown to the undeserving.", greek: "χάρις" },
  batach: { definition: "To trust, confide, or lean upon; the posture of reliance on God.", hebrew: "בָּטַח" },
  nephesh: { definition: "Soul, living being, or person; the whole self, not an immortal detachable part.", hebrew: "נֶפֶשׁ" },
  monogenes: { definition: "Only-begotten, unique, one-of-a-kind; used of Jesus' relationship to the Father.", greek: "μονογενής" },
  poiema: { definition: "Workmanship, masterpiece; we are God's poem, His crafted creation (our 'poem').", greek: "ποίημα" },
  qavah: { definition: "To wait, hope, or bind together in expectant trust.", hebrew: "קָוָה" },
  ashre: { definition: "Blessed, happy, favored; the opening word of many psalms.", hebrew: "אַשְׁרֵי" },
};

// Cross-reference resolver: "joh_3_16" -> "John 3:16"
export function resolveRef(ref: string): string {
  const [bookId, ch, v] = ref.split('_');
  const names: Record<string, string> = {
    gen: 'Genesis', joh: 'John', rom: 'Romans', phi: 'Philippians', psa: 'Psalms',
    pro: 'Proverbs', mat: 'Matthew', eph: 'Ephesians', isa: 'Isaiah', jas: 'James',
    heb: 'Hebrews', rev: 'Revelation', col: 'Colossians', gal: 'Galatians', '1co': '1 Corinthians',
    luk: 'Luke', '1pe': '1 Peter', '1ti': '1 Timothy', '2co': '2 Corinthians', tit: 'Titus',
    jer: 'Jeremiah', eze: 'Ezekiel', dan: 'Daniel', lam: 'Lamentations', act: 'Acts',
    mar: 'Mark', '1jh': '1 John', mic: 'Micah', job: 'Job', '1ki': '1 Kings', '1th': '1 Thessalonians',
    php: 'Philippians', '2ti': '2 Timothy', jam: 'James', '1sa': '1 Samuel',
    exo: 'Exodus', lev: 'Leviticus', num: 'Numbers', deu: 'Deuteronomy', jos: 'Joshua',
    ecc: 'Ecclesiastes', '2ki': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles',
  };
  return `${names[bookId] ?? bookId} ${ch}:${v}`;
}
