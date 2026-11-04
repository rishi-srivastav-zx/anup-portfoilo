/**
 * Intent Patterns for Cinematographer Portfolio AI Assistant
 * Step 3: English, Hindi, and Hinglish Pattern Matrix
 */

import { INTENTS, INTENT_CATEGORIES } from "./intent.constants.js";

export const INTENT_PATTERNS = Object.freeze({
    // ==========================================
    // A. Personal Information
    // ==========================================
    [INTENTS.GREETING]: {
        category: INTENT_CATEGORIES.PERSONAL,
        exactPhrases: [
            "hi",
            "hello",
            "hey",
            "namaste",
            "namaskar",
            "good morning",
            "good afternoon",
            "good evening",
            "kya haal hai",
            "kaise ho",
            "wassup",
            "yo",
            "hey there",
            "hello anup",
            "hi anup",
        ],
        regexPatterns: [
            /^(hi|hello|hey|namaste|namaskar|yo|wassup)( there| anup)?$/i,
            /^good (morning|afternoon|evening)( anup)?$/i,
            /^(kaise ho|kya haal hai|sab theek|kese ho)$/i,
        ],
        primaryKeywords: ["hi", "hello", "hey", "namaste", "namaskar", "greetings"],
        secondaryKeywords: ["morning", "evening", "afternoon", "there", "haal"],
        negativeKeywords: ["hire", "portfolio", "camera", "price", "charge", "cost", "work"],
    },

    [INTENTS.ABOUT_PERSON]: {
        category: INTENT_CATEGORIES.PERSONAL,
        exactPhrases: [
            "who is anup",
            "who are you",
            "tell me about yourself",
            "anup ke baare mein batao",
            "tell me about anup",
            "about anup rawat",
            "kon hai anup",
            "introduce yourself",
            "your background",
            "who is anup rawat",
        ],
        regexPatterns: [
            /\b(who (is|are) (anup|you)|about (anup|yourself)|anup ke baare|tell me about (anup|yourself)|introduce yourself)\b/i,
            /\b(kon hai anup|anup kon hai|anup rawat kaun hai)\b/i,
            /\b(bio|biography|profile|background) (of anup|anup)?\b/i,
        ],
        primaryKeywords: ["who", "anup", "about", "bio", "biography", "background", "yourself", "profile"],
        secondaryKeywords: ["tell", "baare", "kon", "rawat"],
        negativeKeywords: [
            "hire",
            "camera",
            "gear",
            "price",
            "wedding",
            "commercial",
            "charge",
            "work",
            "project",
            "projects",
            "films",
            "portfolio",
            "metro",
            "shoot",
        ],
    },

    [INTENTS.EXPERIENCE_INQUIRY]: {
        category: INTENT_CATEGORIES.PERSONAL,
        exactPhrases: [
            "how many years of experience",
            "kitna experience hai",
            "years of experience",
            "how long have you been shooting",
            "kitne saal se shoot kar rahe ho",
            "work experience",
            "experience in cinematography",
        ],
        regexPatterns: [
            /\b(years of experience|how many years|how long.*(shooting|working)|kitna experience|kitne saal)\b/i,
            /\b(career timeline|experience kitna|industry experience)\b/i,
        ],
        primaryKeywords: ["experience", "years", "saal", "tajurba", "timeline"],
        secondaryKeywords: ["shooting", "industry", "working", "long", "kitna"],
        negativeKeywords: ["pricing", "price", "hire"],
    },

    [INTENTS.LOCATION_INQUIRY]: {
        category: INTENT_CATEGORIES.PERSONAL,
        exactPhrases: [
            "where are you based",
            "where do you live",
            "kahan rehte ho",
            "current location",
            "which city are you located in",
            "based in delhi",
            "operating base",
            "kahan se ho",
        ],
        regexPatterns: [
            /\b(where (are you|do you) (based|live|located)|kahan (rehte|based|se) ho|which city|operating base)\b/i,
            /\b(location kya hai|where.*shoot from|delhi based)\b/i,
        ],
        primaryKeywords: ["where", "based", "live", "located", "kahan", "location", "city"],
        secondaryKeywords: ["place", "area", "reside"],
        negativeKeywords: ["camera", "portfolio", "hire"],
    },

    [INTENTS.LANGUAGE_INQUIRY]: {
        category: INTENT_CATEGORIES.PERSONAL,
        exactPhrases: [
            "which languages do you speak",
            "what languages do you speak",
            "hindi bolte ho",
            "can you speak english",
            "languages spoken",
            "konsi bhasha bolte ho",
        ],
        regexPatterns: [
            /\b((which|what) languages?.*(speak|know)|hindi bolte ho|english bolte ho|languages spoken|konsi bhasha)\b/i,
            /\b(can you speak (hindi|english)|bhasha kya hai)\b/i,
        ],
        primaryKeywords: ["language", "languages", "speak", "bhasha", "english", "hindi"],
        secondaryKeywords: ["fluent", "communication", "talk"],
        negativeKeywords: [],
    },

    // ==========================================
    // B. Portfolio
    // ==========================================
    [INTENTS.VIEW_PORTFOLIO]: {
        category: INTENT_CATEGORIES.PORTFOLIO,
        exactPhrases: [
            "show me your work",
            "show your work",
            "view portfolio",
            "see your work",
            "portfolio dikhao",
            "apna kaam dikhao",
            "past work",
            "showreel",
            "cinematography showreel",
            "show projects",
        ],
        regexPatterns: [
            /\b(show (me )?(your )?(work|portfolio|showreel|projects)|(view|see) (your )?(work|portfolio)|(kaam|work|portfolio) dikhao)\b/i,
            /\b(tell me about (your )?(work|portfolio|projects|cinematography))\b/i,
            /\b(past projects|previous work|show reel|cinematography reel|cinematography work)\b/i,
        ],
        primaryKeywords: ["portfolio", "work", "showreel", "reel", "projects", "kaam", "show", "dikhao"],
        secondaryKeywords: ["view", "see", "samples", "clips", "cinematography"],
        negativeKeywords: ["best", "featured", "top", "award", "bts", "gear", "equipment", "camera", "lens"],
    },

    [INTENTS.FEATURED_WORK]: {
        category: INTENT_CATEGORIES.PORTFOLIO,
        exactPhrases: [
            "apna best work dikhao",
            "show me your best work",
            "best work",
            "featured projects",
            "featured work",
            "top films",
            "highlight reel",
            "best cinematography",
            "famous project",
            "top project",
        ],
        regexPatterns: [
            /\b(best (work|project|film|video|cinematography)|featured (work|project|film)|top (work|films|projects))\b/i,
            /\b(apna best work|highlight (reel|project))\b/i,
            /\b(delhi metro|delhi metro transit( line)?)\b/i,
        ],
        primaryKeywords: ["best", "featured", "top", "highlight", "famous", "greatest", "flagship", "metro"],
        secondaryKeywords: ["work", "project", "films", "reel", "dikhao", "delhi"],
        negativeKeywords: ["pricing", "cost"],
    },

    [INTENTS.PROJECT_DETAILS]: {
        category: INTENT_CATEGORIES.PORTFOLIO,
        exactPhrases: [
            "tell me about this project",
            "project details",
            "case study",
            "is project ke baare mein batao",
            "shoot details",
            "delhi metro project details",
        ],
        regexPatterns: [
            /\b(project details|case study|about (this|the) project|is project ke baare|details of (this|the) (shoot|film))\b/i,
            /\b(project breakdown|tell me more about (the|this) (film|project))\b/i,
        ],
        primaryKeywords: ["details", "case", "study", "breakdown", "story"],
        secondaryKeywords: ["project", "shoot", "film", "baare"],
        negativeKeywords: ["hire", "pricing"],
    },

    [INTENTS.FILMOGRAPHY_INQUIRY]: {
        category: INTENT_CATEGORIES.PORTFOLIO,
        exactPhrases: [
            "filmography",
            "what movies did you shoot",
            "films worked on",
            "konsi movies ki hain",
            "list of films",
            "movies list",
            "feature films",
        ],
        regexPatterns: [
            /\b(filmography|movies (worked on|shot)|konsi (movie|film) ki hai|list of (movies|films)|feature films)\b/i,
        ],
        primaryKeywords: ["filmography", "movies", "films", "cinema", "feature"],
        secondaryKeywords: ["shot", "worked", "list", "konsi"],
        negativeKeywords: ["camera", "gear"],
    },

    [INTENTS.AWARDS_INQUIRY]: {
        category: INTENT_CATEGORIES.PORTFOLIO,
        exactPhrases: [
            "any awards won",
            "awards and recognition",
            "kya koi award mila hai",
            "accolades",
            "awards list",
            "achievements",
        ],
        regexPatterns: [
            /\b(awards?|accolades?|recognitions?|nominations?|koi award mila|achievements?)\b/i,
            /\b(won any awards|filmfare|festival awards)\b/i,
        ],
        primaryKeywords: ["award", "awards", "accolade", "trophy", "recognition", "won", "achievement"],
        secondaryKeywords: ["festival", "honor", "prizes"],
        negativeKeywords: ["pricing", "camera"],
    },

    [INTENTS.BEHIND_THE_SCENES]: {
        category: INTENT_CATEGORIES.PORTFOLIO,
        exactPhrases: [
            "behind the scenes",
            "bts footage",
            "bts photos",
            "making of",
            "behind the frame",
            "show me bts",
            "shoot ke bts dikhao",
        ],
        regexPatterns: [
            /\b(behind the (scenes|frame)|bts( footage| photos| video)?|making of|shoot ke bts)\b/i,
        ],
        primaryKeywords: ["bts", "behind", "scenes", "frame", "making"],
        secondaryKeywords: ["footage", "photos", "on-set", "production"],
        negativeKeywords: ["hire", "price"],
    },

    // ==========================================
    // C. Services
    // ==========================================
    [INTENTS.SERVICES_INQUIRY]: {
        category: INTENT_CATEGORIES.SERVICES,
        exactPhrases: [
            "what services do you offer",
            "what services do you provide",
            "kya kya kaam karte ho",
            "services provided",
            "what can you shoot",
            "types of shoots",
            "all services",
        ],
        regexPatterns: [
            /\b(what services|services (do you )?(offer|provide)|kya kya (service|kaam)|services list|what can you shoot)\b/i,
            /\b(types of (shoots|videos|films)|scope of work)\b/i,
        ],
        primaryKeywords: ["services", "service", "offer", "provide", "shoots", "scope"],
        secondaryKeywords: ["types", "kaam", "what", "options"],
        negativeKeywords: ["wedding", "commercial", "documentary", "camera", "price"],
    },

    [INTENTS.WEDDING_INQUIRY]: {
        category: INTENT_CATEGORIES.SERVICES,
        exactPhrases: [
            "wedding shoot karte ho kya",
            "wedding shoot",
            "wedding cinematography",
            "shaadi shoot",
            "pre-wedding shoot",
            "do you shoot weddings",
            "wedding video",
            "marriage cinematography",
        ],
        regexPatterns: [
            /\b(wedding|shaadi|pre-wedding|marriage|byah) (shoot|cinematography|video|film|cinematographer)?\b/i,
            /\b(wedding shoot karte ho|do you (do|cover) weddings)\b/i,
        ],
        primaryKeywords: ["wedding", "shaadi", "pre-wedding", "marriage", "bridal"],
        secondaryKeywords: ["shoot", "cinematography", "video", "coverage"],
        negativeKeywords: ["commercial", "documentary", "hire"],
    },

    [INTENTS.COMMERCIAL_INQUIRY]: {
        category: INTENT_CATEGORIES.SERVICES,
        exactPhrases: [
            "commercial shoot",
            "tv commercial",
            "ad shoot",
            "advertisement film",
            "tvc",
            "commercials banate ho",
            "commercial ad",
        ],
        regexPatterns: [
            /\b(commercial|ad film|advertisement|tvc) (shoot|video|production|film)?\b/i,
            /\b(commercials? banate ho|shoot commercials?)\b/i,
        ],
        primaryKeywords: ["commercial", "ad", "advertisement", "tvc", "promo"],
        secondaryKeywords: ["shoot", "film", "video", "production"],
        negativeKeywords: ["wedding", "documentary", "hire"],
    },

    [INTENTS.DOCUMENTARY_INQUIRY]: {
        category: INTENT_CATEGORIES.SERVICES,
        exactPhrases: [
            "documentary shoot",
            "documentary filmmaker",
            "docu film",
            "documentaries banate ho",
            "non-fiction film",
            "documentary video",
        ],
        regexPatterns: [
            /\b(documentary|docu(mentary)?) (shoot|film|video|filmmaker|production)?\b/i,
            /\b(documentaries? (banate|karte) ho|non-fiction)\b/i,
        ],
        primaryKeywords: ["documentary", "docu", "non-fiction", "docuseries"],
        secondaryKeywords: ["shoot", "film", "video", "filmmaker"],
        negativeKeywords: ["wedding", "commercial", "hire"],
    },

    [INTENTS.MUSIC_VIDEO_INQUIRY]: {
        category: INTENT_CATEGORIES.SERVICES,
        exactPhrases: [
            "music video shoot",
            "song shoot",
            "music video cinematography",
            "gaane ka video",
            "music video production",
            "shoot music video",
        ],
        regexPatterns: [
            /\b(music video|song shoot|music film|gaana shoot|music video cinematography)\b/i,
        ],
        primaryKeywords: ["music video", "song", "track", "music"],
        secondaryKeywords: ["shoot", "video", "gaana", "cinematography"],
        negativeKeywords: ["wedding", "corporate", "hire"],
    },

    [INTENTS.BRAND_FILM_INQUIRY]: {
        category: INTENT_CATEGORIES.SERVICES,
        exactPhrases: [
            "brand film",
            "corporate video",
            "brand story",
            "company video",
            "brand film shoot",
            "corporate shoot",
        ],
        regexPatterns: [
            /\b(brand (film|story|video)|corporate (video|film|shoot)|company (profile|video))\b/i,
        ],
        primaryKeywords: ["brand film", "corporate", "company", "brand story"],
        secondaryKeywords: ["shoot", "film", "video", "profile"],
        negativeKeywords: ["wedding", "music", "hire"],
    },

    // ==========================================
    // D. Technical Information
    // ==========================================
    [INTENTS.EQUIPMENT_INQUIRY]: {
        category: INTENT_CATEGORIES.TECHNICAL,
        exactPhrases: [
            "what equipment do you use",
            "what gear do you use",
            "gear list",
            "equipment list",
            "konsa equipment use karte ho",
            "production kit",
            "production gear",
            "what equipment do you have",
        ],
        regexPatterns: [
            /\b(what (equipment|gear)|(equipment|gear) list|konsa equipment|production kit|kit list)\b/i,
            /\b(what gear do you (use|have)|production equipment)\b/i,
        ],
        primaryKeywords: ["equipment", "gear", "kit", "hardware", "production kit"],
        secondaryKeywords: ["use", "have", "list", "konsa"],
        negativeKeywords: [],
    },

    [INTENTS.CAMERA_INQUIRY]: {
        category: INTENT_CATEGORIES.TECHNICAL,
        exactPhrases: [
            "camera konsa use karte ho",
            "which camera do you shoot with",
            "what camera do you use",
            "sony fx3",
            "sony fx6",
            "camera gear",
            "which camera",
            "camera use",
        ],
        regexPatterns: [
            /\b(which camera|what camera|camera (konsa|kounsa)|sony fx[36]|arri|red komodo|camera model)\b/i,
            /\b(camera.*(use|shoot with)|konsa camera)\b/i,
        ],
        primaryKeywords: ["camera", "fx3", "fx6", "sensor", "mirrorless", "arri", "red"],
        secondaryKeywords: ["shoot", "use", "model", "body"],
        negativeKeywords: ["lens", "lenses"],
    },

    [INTENTS.LENS_INQUIRY]: {
        category: INTENT_CATEGORIES.TECHNICAL,
        exactPhrases: [
            "what lenses do you use",
            "which lenses",
            "lens konsa use karte ho",
            "prime lenses",
            "anamorphic lenses",
            "what lenses do you recommend for low light shots",
            "lens kit",
        ],
        regexPatterns: [
            /\b((what|which) lens(es)?|lenses.*use|lenses do you recommend|prime lens|anamorphic|focal length)\b/i,
            /\b(lens konsa|glass kit|g master)\b/i,
        ],
        primaryKeywords: ["lens", "lenses", "anamorphic", "focal", "prime", "glass", "aperture"],
        secondaryKeywords: ["low light", "recommend", "use", "focal length"],
        negativeKeywords: ["body"],
    },

    [INTENTS.PRODUCTION_PROCESS]: {
        category: INTENT_CATEGORIES.TECHNICAL,
        exactPhrases: [
            "what is your production process",
            "workflow",
            "how do you shoot",
            "pre-production to post",
            "kaise kaam karte ho",
            "production workflow",
            "shooting process",
        ],
        regexPatterns: [
            /\b(production process|workflow|how do you (work|shoot)|kaise kaam karte ho|pre-production to post)\b/i,
            /\b(shooting pipeline|production stages)\b/i,
        ],
        primaryKeywords: ["workflow", "process", "pipeline", "methodology", "stages"],
        secondaryKeywords: ["shoot", "work", "pre-production", "post", "kaise"],
        negativeKeywords: ["price", "hire"],
    },

    [INTENTS.CREATIVE_STYLE]: {
        category: INTENT_CATEGORIES.TECHNICAL,
        exactPhrases: [
            "what is your visual style",
            "cinematography style",
            "aesthetic",
            "cinematic look",
            "lighting style",
            "creative style",
            "color tone",
        ],
        regexPatterns: [
            /\b(visual style|cinematography style|aesthetic|cinematic look|lighting style|creative style)\b/i,
            /\b(color palette|visual tone|look and feel)\b/i,
        ],
        primaryKeywords: ["style", "aesthetic", "visual", "look", "lighting", "creative", "mood"],
        secondaryKeywords: ["tone", "palette", "cinematic"],
        negativeKeywords: ["equipment", "price"],
    },

    // ==========================================
    // E. Business and Hiring
    // ==========================================
    [INTENTS.HIRE_INQUIRY]: {
        category: INTENT_CATEGORIES.BUSINESS,
        exactPhrases: [
            "i want to hire you",
            "mujhe hire karna hai",
            "hire anup",
            "want to hire you for a commercial shoot",
            "can i hire you",
            "hire for shoot",
            "hire you",
            "want to hire",
            "looking to hire",
        ],
        regexPatterns: [
            /\b((want to|wanna|looking to|i need to) hire|mujhe hire|hire (you|anup)|hire for (a )?(commercial|wedding|shoot))\b/i,
            /\b(can i hire you|hire karna (hai|chahta))\b/i,
        ],
        primaryKeywords: ["hire", "recruitment", "appoint", "book you"],
        secondaryKeywords: ["want", "mujhe", "karna", "shoot", "commercial", "wedding"],
        negativeKeywords: ["pricing", "cost", "charge"],
    },

    [INTENTS.AVAILABILITY_INQUIRY]: {
        category: INTENT_CATEGORIES.BUSINESS,
        exactPhrases: [
            "are you available",
            "free ho kya",
            "availability check",
            "available next month",
            "shooting schedule",
            "available dates",
            "free for shoot",
        ],
        regexPatterns: [
            /\b(are you available|availability|free ho( kya)?|available (in|next|on)|schedule (open|free)|dates available)\b/i,
            /\b(available for (a )?shoot|calendar free)\b/i,
        ],
        primaryKeywords: ["available", "availability", "free", "dates", "schedule", "calendar"],
        secondaryKeywords: ["next month", "week", "shooting", "dates"],
        negativeKeywords: ["hire", "price"],
    },

    [INTENTS.PRICING_INQUIRY]: {
        category: INTENT_CATEGORIES.BUSINESS,
        exactPhrases: [
            "kitna charge karte ho",
            "how much do you charge",
            "pricing",
            "rates",
            "cost",
            "fees",
            "kitne paise",
            "day rate",
            "budget required",
            "what is your price",
            "how much",
        ],
        regexPatterns: [
            /\b(kitna charge|how much (do you charge|is it)?|pricing|rates?|day rate|cost|fees|kitne paise|charge karte ho)\b/i,
            /\b(what are your (rates|charges|prices)|approx(imate)? budget)\b/i,
        ],
        primaryKeywords: ["charge", "pricing", "price", "rate", "cost", "fee", "rates", "budget", "paise", "charges"],
        secondaryKeywords: ["how much", "kitna", "day rate", "quotation"],
        negativeKeywords: [],
    },

    [INTENTS.COLLABORATION_INQUIRY]: {
        category: INTENT_CATEGORIES.BUSINESS,
        exactPhrases: [
            "collab karna hai",
            "collaboration",
            "let's collaborate",
            "work together on a project",
            "partner with you",
            "creative collaboration",
        ],
        regexPatterns: [
            /\b(collaborat(e|ion)|collab|work together|partner(ship)?|joint project)\b/i,
            /\b(collab karna|saath me kaam)\b/i,
        ],
        primaryKeywords: ["collaborate", "collaboration", "collab", "partner", "together"],
        secondaryKeywords: ["work", "project", "creative", "partnership"],
        negativeKeywords: ["hire", "price"],
    },

    [INTENTS.BOOKING_INQUIRY]: {
        category: INTENT_CATEGORIES.BUSINESS,
        exactPhrases: [
            "how to book",
            "booking process",
            "slot book karna hai",
            "book a shoot",
            "advance payment",
            "reserve a date",
            "book slot",
        ],
        regexPatterns: [
            /\b(how to book|booking process|book a shoot|slot book|reserve.*date|advance payment|lock dates)\b/i,
        ],
        primaryKeywords: ["book", "booking", "reserve", "reservation", "slot", "advance"],
        secondaryKeywords: ["process", "date", "lock", "deposit"],
        negativeKeywords: [],
    },

    // ==========================================
    // F. Contact
    // ==========================================
    [INTENTS.CONTACT_INQUIRY]: {
        category: INTENT_CATEGORIES.CONTACT,
        exactPhrases: [
            "contact kaise kar sakta hoon",
            "how to contact you",
            "reach out",
            "get in touch",
            "kahan contact karein",
            "contact details",
            "how do i contact you",
            "how to reach you",
        ],
        regexPatterns: [
            /\b(how to (contact|reach)|contact kaise|get in touch|reach out|contact details|kahan contact)\b/i,
            /\b(communication details|contact information)\b/i,
        ],
        primaryKeywords: ["contact", "reach", "touch", "details"],
        secondaryKeywords: ["how", "kaise", "information", "connect"],
        negativeKeywords: [],
    },

    [INTENTS.EMAIL_INQUIRY]: {
        category: INTENT_CATEGORIES.CONTACT,
        exactPhrases: [
            "what is your email",
            "email address",
            "apna email do",
            "mail id",
            "email kaise karein",
            "official email",
        ],
        regexPatterns: [
            /\b(what is your email|email address|apna email|mail id|send.*email|email id)\b/i,
        ],
        primaryKeywords: ["email", "mail", "inbox", "gmail"],
        secondaryKeywords: ["address", "id", "send", "apna"],
        negativeKeywords: ["phone", "call"],
    },

    [INTENTS.PHONE_INQUIRY]: {
        category: INTENT_CATEGORIES.CONTACT,
        exactPhrases: [
            "what is your phone number",
            "phone number",
            "mobile number",
            "whatsapp number",
            "call you",
            "phone number do",
            "contact number",
        ],
        regexPatterns: [
            /\b(phone number|mobile number|whatsapp( number)?|call you|contact number|call kaise)\b/i,
        ],
        primaryKeywords: ["phone", "number", "mobile", "whatsapp", "call"],
        secondaryKeywords: ["dial", "ring", "reach"],
        negativeKeywords: ["email", "mail"],
    },

    [INTENTS.SOCIAL_MEDIA_INQUIRY]: {
        category: INTENT_CATEGORIES.CONTACT,
        exactPhrases: [
            "instagram handle",
            "social media links",
            "vimeo link",
            "youtube channel",
            "insta id",
            "where to follow you",
            "instagram profile",
        ],
        regexPatterns: [
            /\b(instagram|insta( handle| id)?|social media|vimeo|youtube|follow you|linkedin)\b/i,
        ],
        primaryKeywords: ["instagram", "insta", "social", "vimeo", "youtube", "handle", "linkedin"],
        secondaryKeywords: ["media", "follow", "links", "channel"],
        negativeKeywords: ["phone", "call"],
    },

    // ==========================================
    // G. Navigation
    // ==========================================
    [INTENTS.NAVIGATE_HOME]: {
        category: INTENT_CATEGORIES.NAVIGATION,
        exactPhrases: [
            "go to home",
            "take me to home page",
            "home page dikhao",
            "open homepage",
            "navigate to home",
            "back to home",
        ],
        regexPatterns: [
            /\b(go to (home|homepage)|take me (to )?home|open home(page)?|navigate to home)\b/i,
        ],
        primaryKeywords: ["home", "homepage"],
        secondaryKeywords: ["go", "navigate", "open", "take"],
        negativeKeywords: [],
    },

    [INTENTS.NAVIGATE_ABOUT]: {
        category: INTENT_CATEGORIES.NAVIGATION,
        exactPhrases: [
            "go to about page",
            "open about me",
            "navigate to about",
            "take me to about",
            "open about page",
        ],
        regexPatterns: [
            /\b(go to about|open about|navigate to about|take me to about( page)?)\b/i,
        ],
        primaryKeywords: ["about"],
        secondaryKeywords: ["page", "navigate", "open", "go"],
        negativeKeywords: [],
    },

    [INTENTS.NAVIGATE_WORK]: {
        category: INTENT_CATEGORIES.NAVIGATION,
        exactPhrases: [
            "go to work page",
            "open portfolio page",
            "take me to works",
            "navigate to portfolio",
            "go to projects page",
        ],
        regexPatterns: [
            /\b(go to (work|portfolio)|open (work|portfolio) page|take me to (work|portfolio)|navigate to (work|portfolio))\b/i,
        ],
        primaryKeywords: ["work", "portfolio", "projects"],
        secondaryKeywords: ["page", "navigate", "open", "go"],
        negativeKeywords: [],
    },

    [INTENTS.NAVIGATE_SERVICES]: {
        category: INTENT_CATEGORIES.NAVIGATION,
        exactPhrases: [
            "open services page",
            "take me to services",
            "navigate to services",
            "go to services",
            "go to services page",
        ],
        regexPatterns: [
            /\b(go to services|open services|navigate to services|take me to services( page)?)\b/i,
        ],
        primaryKeywords: ["services"],
        secondaryKeywords: ["page", "navigate", "open", "go"],
        negativeKeywords: [],
    },

    [INTENTS.NAVIGATE_CONTACT]: {
        category: INTENT_CATEGORIES.NAVIGATION,
        exactPhrases: [
            "open contact page",
            "take me to contact form",
            "contact page kholo",
            "navigate to contact",
            "go to contact page",
        ],
        regexPatterns: [
            /\b(go to contact|open contact|navigate to contact|take me to contact|contact page)\b/i,
        ],
        primaryKeywords: ["contact"],
        secondaryKeywords: ["page", "navigate", "open", "go", "form"],
        negativeKeywords: [],
    },

    [INTENTS.NAVIGATE_BLOG]: {
        category: INTENT_CATEGORIES.NAVIGATION,
        exactPhrases: [
            "open blog",
            "go to blog",
            "sketchbook page",
            "open articles",
            "navigate to blog",
            "take me to the blog section",
            "open sketchbook",
        ],
        regexPatterns: [
            /\b(go to (blog|sketchbook|articles)|open (blog|sketchbook)|navigate to blog|take me to.*blog)\b/i,
        ],
        primaryKeywords: ["blog", "sketchbook", "articles"],
        secondaryKeywords: ["page", "navigate", "open", "go", "section"],
        negativeKeywords: [],
    },

    // ==========================================
    // H. General
    // ==========================================
    [INTENTS.GENERAL_QUESTION]: {
        category: INTENT_CATEGORIES.GENERAL,
        exactPhrases: [
            "what is cinematography",
            "why 24fps",
            "what is shutter angle",
            "what is anamorphic ratio",
            "how does dynamic range work",
        ],
        regexPatterns: [
            /\b(what is (24fps|shutter angle|anamorphic|aperture|iso|dynamic range|aspect ratio)|why 24fps)\b/i,
        ],
        primaryKeywords: ["cinematography", "24fps", "shutter", "aperture", "iso", "sensor"],
        secondaryKeywords: ["what", "why", "how", "concept"],
        negativeKeywords: ["hire", "portfolio", "price"],
    },

    [INTENTS.OUT_OF_SCOPE]: {
        category: INTENT_CATEGORIES.GENERAL,
        exactPhrases: [
            "what is the weather today",
            "recipe for butter chicken",
            "write a python script for sorting",
            "who won the cricket match",
            "tell me a joke",
            "solve this math problem",
        ],
        regexPatterns: [
            /\b(weather|cricket|bitcoin|crypto|recipe|cook|calculator|write (a )?python|code in javascript|president of|capital of|stock market|ipl score|football match)\b/i,
        ],
        primaryKeywords: ["weather", "cricket", "recipe", "python", "javascript", "bitcoin", "ipl", "stock"],
        secondaryKeywords: ["cook", "score", "match", "temperature"],
        negativeKeywords: [],
    },

    [INTENTS.UNCLEAR_INTENT]: {
        category: INTENT_CATEGORIES.GENERAL,
        exactPhrases: [],
        regexPatterns: [],
        primaryKeywords: [],
        secondaryKeywords: [],
        negativeKeywords: [],
    },
});

export default INTENT_PATTERNS;
