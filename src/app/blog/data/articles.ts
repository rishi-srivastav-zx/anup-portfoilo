export type BlogCategory =
  | 'Cinematography'
  | 'Lighting & Exposure'
  | 'Camera & Lenses'
  | 'Visual Storytelling'
  | 'Behind the Scenes'
  | 'Filmmaking Techniques'
  | 'Gear & Workflow';

export interface ArticleTableData {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface ArticleSubSection {
  title: string;
  paragraphs: string[];
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  subSections?: ArticleSubSection[];
  pullQuote?: {
    text: string;
    context: string;
  };
  inlineImage?: {
    src: string;
    alt: string;
    caption: string;
  };
  table?: ArticleTableData;
  checklist?: string[];
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  author: {
    name: string;
    role: string;
  };
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  featuredImage: string;
  featuredImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  status: 'published' | 'draft';
  isFeatured?: boolean;
  layoutVariant?: 'wide' | 'standard';
  technicalNote: string;
  introduction: string[];
  sections: ArticleSection[];
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  'Cinematography',
  'Lighting & Exposure',
  'Camera & Lenses',
  'Visual Storytelling',
  'Behind the Scenes',
  'Filmmaking Techniques',
  'Gear & Workflow',
];

export const ARTICLES: BlogArticle[] = [
  {
    id: 'art-of-cinematic-lighting',
    title: 'The Art of Cinematic Lighting: Creating Emotion with Shadows',
    slug: 'cinematic-lighting-techniques',
    excerpt:
      'Lighting is less about illumination and more about selective concealment. Explore how contrast ratios, motivated sources, and negative fill shape psychological tension inside the frame.',
    category: 'Lighting & Exposure',
    tags: [
      'cinematic lighting',
      'chiaroscuro',
      'negative fill',
      'lighting ratios',
      'motivated lighting',
      'inverse square law',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-10-14',
    updatedAt: '2026-10-20',
    readingTime: '9 min read',
    featuredImage: '/images/lighting-emotion-shadows.svg',
    featuredImageAlt:
      'Chiaroscuro lighting diagram showing a warm tungsten key lamp, a rain-streaked architectural window, and an 8x8 negative fill frame shaping shadow falloff across a subject.',
    seoTitle: 'The Art of Cinematic Lighting: Creating Emotion with Shadows | Anup Rawat',
    seoDescription:
      'Learn how cinematography lighting techniques—from motivated practicals and contrast ratios to negative fill and inverse-square falloff—create emotional depth on screen.',
    status: 'published',
    isFeatured: true,
    layoutVariant: 'wide',
    technicalNote: 'Contrast Study · 8:1 Key-to-Fill · 3200K Practical Key',
    introduction: [
      'When beginning a lighting setup, the instinctive impulse is often to add illumination until every corner of the room registers cleanly on the sensor. Yet in narrative and atmospheric cinematography, emotional resonance rarely comes from what is lit—it emerges from what is deliberately withheld in shadow.',
      'By treating darkness as an active compositional canvas rather than a technical deficit, a cinematographer directs the viewer’s eye, establishes spatial depth, and communicates a character’s internal state before a single line of dialogue is spoken.',
    ],
    sections: [
      {
        id: 'motivated-sources-and-visual-logic',
        heading: 'Motivated Light and Emotional Credibility',
        paragraphs: [
          'Every light source in a cinematic space benefits from an emotional and architectural justification. Whether the motivating source is a late-afternoon window, a shaded tungsten desk lamp, or sodium-vapor streetspill filtering through sheer curtains, anchoring the key light to the environment preserves suspension of disbelief.',
          'Motivating a source does not mean relying solely on a weak household bulb. Frequently, a practical lamp establishes the visual logic in the wide frame while a larger, diffused fixture positioned along the same vector provides the actual exposure and wrap required for close-ups.',
        ],
        subSections: [
          {
            title: 'Upstage vs. Downstage Key Placement',
            paragraphs: [
              'Positioning the key light on the upstage side of the actor—away from the camera—forces the majority of the face turning toward the lens into shadow. Known as far-side or upstage lighting, this simple geometric choice immediately introduces three-dimensional modeling and avoids flat, front-lit television aesthetics.',
            ],
          },
        ],
        pullQuote: {
          text: 'Shadow is the acoustic silence of the visual image; without it, every highlight shouts at the same volume.',
          context: 'On tonal separation and negative fill',
        },
      },
      {
        id: 'controlling-contrast-ratios-and-negative-fill',
        heading: 'Shaping Contrast Ratios with Negative Fill',
        paragraphs: [
          'In compact real-world locations with pale walls, light bounces unpredictably, lifting the shadow side of a face and flattening tonal contrast. Adding more key light only raises overall room ambiance. The solution is subtraction: placing black solids or unbleached duvetyne on the shadow side of the subject to absorb ambient bounce.',
          'Choosing a key-to-fill ratio is an editorial decision tied directly to genre and dramatic beat. Rather than guessing by eye on an uncalibrated monitor, metering reflected or incident values in stops ensures repeatable continuity from the master shot through coverage.',
        ],
        table: {
          caption: 'Standard Key-to-Fill Contrast Ratios & Dramatic Applications',
          headers: ['Key-to-Fill Ratio', 'Stop Difference', 'Tonal Character', 'Typical Narrative Context'],
          rows: [
            ['2:1 Ratio', '1.0 Stop', 'Open, gentle shadow transition', 'Naturalistic daylight dialogue, commercial lifestyle'],
            ['4:1 Ratio', '2.0 Stops', 'Naturalistic three-dimensional sculptural depth', 'Intimate character drama, grounded realism'],
            ['8:1 Ratio', '3.0 Stops', 'Pronounced shadow side with discernible detail', 'Nocturnal interiors, psychological tension'],
            ['16:1+ Ratio', '4.0+ Stops', 'Stark chiaroscuro silhouette and falloff', 'Thriller climax, isolation, moral ambiguity'],
          ],
        },
      },
      {
        id: 'inverse-square-law-and-falloff',
        heading: 'Using the Inverse Square Law to Pace Light Falloff',
        paragraphs: [
          'Light intensity diminishes inversely with the square of the distance from the source. In practical on-set terms, moving a soft key fixture very close to a subject causes exposure to drop off rapidly just a few feet behind them, plunging the background into rich darkness.',
          'Conversely, backing a powerful fixture far outside a window produces an even, gradual falloff across the entire room—mimicking natural sunlight, where two subjects standing ten feet apart receive virtually identical exposure.',
        ],
        inlineImage: {
          src: '/images/natural-vs-artificial-light.svg',
          alt: 'Overhead diagram of a book-light setup bouncing a fixture into an ultrabounce reflector and through half-grid diffusion with negative fill.',
          caption: 'Book-light geometry: bouncing illumination into a reflector before passing it through diffusion creates soft, wrapping light with controlled directional falloff.',
        },
      },
    ],
  },
  {
    id: 'camera-movement-emotion',
    title: 'How Camera Movement Changes the Emotion of a Scene',
    slug: 'understanding-camera-movement',
    excerpt:
      'Every pan, dolly push-in, handheld breath, and static lock-off carries a distinct psychological subtext. A breakdown of when to move the camera—and when stillness is more powerful.',
    category: 'Cinematography',
    tags: [
      'camera movement',
      'dolly shot',
      'steadicam',
      'handheld cinematography',
      'visual pacing',
      'blocking',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-10-08',
    readingTime: '7 min read',
    featuredImage: '/images/camera-movement-psychology.svg',
    featuredImageAlt:
      'Perspective corridor diagram with dolly track rails converging toward a solitary silhouette at the central vanishing point.',
    seoTitle: 'How Camera Movement Changes the Emotion of a Scene | Anup Rawat',
    seoDescription:
      'Understand the psychological impact of camera movement in filmmaking—comparing dolly tracks, Steadicam, handheld work, focal zooms, and intentional static composition.',
    status: 'published',
    layoutVariant: 'standard',
    technicalNote: 'Kinetic Grammar · Dolly vs. Handheld · 32mm Focal Axis',
    introduction: [
      'In a visual medium, the camera is never a neutral observer. It occupies physical space in the room, possesses virtual mass, and represents the audience’s emotional proximity to the characters.',
      'Unmotivated movement—floating the camera simply to keep a static dialogue scene visually busy—quickly dilutes tension. When camera movement is tied strictly to character agency or narrative revelation, even a six-inch push-in feels monumental.',
    ],
    sections: [
      {
        id: 'dolly-push-vs-focal-zoom',
        heading: 'Physical Space vs. Optical Compression: The Dolly and the Zoom',
        paragraphs: [
          'Moving the camera physically through space on a dolly changes the spatial relationship between foreground, midground, and background. As the lens passes foreground architecture, parallax reveals the volume of the room and invites the viewer physically into the character’s personal sphere.',
          'An optical zoom, by contrast, magnifies the image from a fixed vantage point. Because perspective remains frozen while the background compresses toward the subject, a slow zoom often feels observational, clinical, or claustrophobic—as though the environment itself is closing in.',
        ],
      },
      {
        id: 'objective-stillness-vs-subjective-breath',
        heading: 'Static Lock-Offs, Steadicam, and Handheld Intimacy',
        paragraphs: [
          'A locked-off tripod frame forces the audience to confront the geometry of the scene without distraction. When characters move within a rigid frame, the boundaries of the screen act like walls of a stage, amplifying feelings of entrapment or inevitability.',
          'Transitioning from disciplined tripod frames to handheld operation mid-story signals an immediate fracture in stability. The key to cinematic handheld work is mass and balance—operating from the core rather than the wrists so the frame breathes with human cadence rather than jittery micro-shakes.',
        ],
        table: {
          caption: 'Psychological Signatures of Primary Camera Support Systems',
          headers: ['Support Method', 'Parallax & Horizon', 'Psychological Subtext', 'Best Suited For'],
          rows: [
            ['Locked Tripod / Geared Head', 'Zero camera parallax; rigid horizon', 'Objective observation, tension, composure', 'Tableau framing, stoic confrontation'],
            ['Dolly on Track', 'Smooth linear parallax across axes', 'Deliberate revelation, emotional gravity', 'Realization beats, rhythmic pacing'],
            ['Steadicam / Gimbal', 'Fluid multi-axis traversal', 'Dreamlike continuity, immersive following', 'Long-take spatial transitions, point-of-view'],
            ['Balanced Shoulder Handheld', 'Organic micro-cadence and response', 'Visceral immediacy, vulnerability, urgency', 'Emotional fracture, documentary realism'],
          ],
        },
      },
    ],
  },
  {
    id: 'choosing-cinema-camera-lenses',
    title: 'How to Choose a Cinema Camera and Lens Package for Narrative & Commercial Work',
    slug: 'how-to-choose-a-cinema-camera',
    excerpt:
      'Sensors capture data, but glass shapes memory. A practical framework for evaluating dynamic range, sensor format, prime vs. zoom optics, andspherical vs. anamorphic character.',
    category: 'Camera & Lenses',
    tags: [
      'cinema camera',
      'prime vs zoom lens',
      'anamorphic lenses',
      'sensor size',
      'dynamic range',
      'optics',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-09-29',
    updatedAt: '2026-10-12',
    readingTime: '10 min read',
    featuredImage: '/images/prime-vs-zoom-optics.svg',
    featuredImageAlt:
      'Technical cutaway illustration of an anamorphic 50mm cinema prime lens showing amber glass coatings, 2x squeeze element, and 11-blade iris.',
    seoTitle: 'How to Choose a Cinema Camera & Lens Package | Anup Rawat',
    seoDescription:
      'A practical guide for filmmakers and producers on selecting a cinema camera and lens package—covering dynamic range, Super 35 vs Large Format, and prime vs zoom lenses.',
    status: 'published',
    layoutVariant: 'standard',
    technicalNote: 'Optical Architecture · S35 & Large Format · T-Stop Transmission',
    introduction: [
      'Discussions around camera packages often fixate on resolution numbers—4K, 6K, or 8K. Yet on a theatrical screen or calibrated reference monitor, pixel count is rarely what distinguishes a cinematic image from harsh digital video.',
      'The true differentiators are highlight roll-off, color science in skin tones, physical sensor dimensions, and above all, the optical personality of the lens placed in front of the sensor.',
    ],
    sections: [
      {
        id: 'highlight-rolloff-over-resolution',
        heading: 'Why Highlight Roll-Off Matters More Than Resolution',
        paragraphs: [
          'When a bright window or specular reflection exceeds the clipping point of a lesser sensor, the transition from tonal detail to pure white is abrupt and mechanical. Cinema sensors prioritize latitude above middle grey, allowing bright sources to desaturate gracefully toward warm white—mimicking the shoulder of photochemical film stock.',
          'Before selecting a camera body, evaluate the locations on the schedule: if the project involves untamed daytime exteriors or high-contrast practical night interiors, usable dynamic range and dual native ISO capabilities outweigh raw spatial resolution every time.',
        ],
      },
      {
        id: 'prime-lenses-vs-zoom-lenses',
        heading: 'Prime Lenses vs. Zoom Lenses in Filmmaking',
        paragraphs: [
          'Prime lenses—fixed focal lengths such as 25mm, 35mm, 50mm, and 85mm—offer wider maximum T-stops, lighter physical weight for handheld or gimbal work, and a disciplined visual grammar. Knowing that a 35mm lens is on the camera forces the director and cinematographer to decide where the camera physically belongs in the room.',
          'Modern cinema zooms, however, are indispensable when shooting rapidly changing natural light, multi-camera documentary setups, or complex commercial choreography where re-rigging primes would cost precious golden-hour takes.',
        ],
        subSections: [
          {
            title: 'Spherical Precision vs. Anamorphic Imperfection',
            paragraphs: [
              'Spherical primes render out-of-focus highlights as circular bokeh and maintain rectilinear geometry toward the edges of the frame. Anamorphic lenses use cylindrical glass elements to squeeze a wider horizontal field of view onto the sensor, yielding oval bokeh, subtle barrel distortion at the frame edges, and organic horizontal streak flares.',
            ],
          },
        ],
        checklist: [
          'Evaluate close-focus distance requirements for tight tabletop or claustrophobic dialogue frames.',
          'Test lens flare color and veiling glare against hard backlighting before locking the lookbook.',
          'Match T-stop transmission across focal lengths to maintain consistent depth of field during coverage.',
          'Confirm physical front diameter and focus gear pitch compatibility with matte boxes and wireless FIZ motors.',
        ],
      },
    ],
  },
  {
    id: 'understanding-exposure-iso-shutter-aperture',
    title: 'Understanding Exposure, Native ISO, Shutter Angle, and T-Stops in Digital Cinematography',
    slug: 'exposure-iso-shutter-aperture-guide',
    excerpt:
      'Moving beyond photography’s exposure triangle: how dual native ISO redistributes dynamic range, why 180-degree shutter angle governs motion cadence, and how to read a waveform monitor.',
    category: 'Lighting & Exposure',
    tags: [
      'exposure triangle',
      'native ISO',
      'shutter angle',
      'T-stops',
      'waveform monitor',
      'false color',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-09-18',
    readingTime: '8 min read',
    featuredImage: '/images/exposure-triangle-latitude.svg',
    featuredImageAlt:
      'Log-C dynamic range S-curve chart illustrating 14.5 stops of latitude, 18% middle grey at 0 EV, highlight shoulder roll-off, and shadow toe detail.',
    seoTitle: 'Exposure, Native ISO, Shutter Angle & T-Stops Guide | Anup Rawat',
    seoDescription:
      'Master cinema exposure: learn how T-stops differ from f-stops, why the 180-degree shutter rule controls motion blur, and how ISO shifts highlight and shadow latitude.',
    status: 'published',
    layoutVariant: 'wide',
    technicalNote: 'Sensitometry · 180° Shutter · 14.5 Stops Latitude',
    introduction: [
      'In still photography, aperture, shutter speed, and ISO are often treated as three interchangeable levers to brighten or darken a frame. In motion picture photography, however, shutter angle is typically locked to preserve natural motion cadence, and exposure index (EI/ISO) is chosen to allocate dynamic range between highlights and shadows.',
      'That leaves lighting intensity, Neutral Density (ND) filtration, and the lens T-stop as the primary tools for sculpting exposure on set.',
    ],
    sections: [
      {
        id: 't-stops-and-neutral-density',
        heading: 'T-Stops vs. F-Stops and the Role of ND Filtration',
        paragraphs: [
          'While an f-stop is a purely mathematical ratio of focal length to entrance pupil diameter, a T-stop (Transmission stop) measures the actual quantity of light exiting the rear element after accounting for glass absorption and internal reflections. When cutting between a 24mm wide shot and an 85mm close-up, setting both cinema lenses to T2.8 guarantees identical image brightness.',
          'Because the T-stop governs depth of field, cinematographers rarely close the iris to T11 on a sunny exterior just to control brightness. Instead, internal or matte-box IRND (Infrared Neutral Density) filters cut incoming light evenly so the lens can remain at its optical sweet spot—often between T2.0 and T4.0.',
        ],
      },
      {
        id: 'exposure-index-and-latitude-allocation',
        heading: 'How Rating ISO Shifts Highlight and Shadow Latitude',
        paragraphs: [
          'A digital cinema sensor has a fixed physical sensitivity at its base circuit. Rating the camera at a lower Exposure Index (for example, EI 400 instead of EI 800) prompts you to feed the sensor more light, resulting in cleaner, noise-free shadows at the cost of one stop of highlight headroom.',
          'Conversely, rating the sensor higher (such as EI 1600) allocates extra stops above middle grey, protecting bright windows and neon signs from clipping during night shoots.',
        ],
        table: {
          caption: 'Dynamic Range Allocation by Exposure Index (Base 800 EI Sensor Example)',
          headers: ['Exposure Index (EI)', 'Stops Above 18% Grey', 'Stops Below 18% Grey', 'Recommended Scenario'],
          rows: [
            ['EI 200', '5.0 Stops', '9.5 Stops', 'Low-contrast shadowy interiors requiring ultra-clean blacks'],
            ['EI 400', '6.0 Stops', '8.5 Stops', 'Controlled studio lighting with dark tonal palettes'],
            ['EI 800 (Base)', '7.0 Stops', '7.5 Stops', 'Balanced narrative scenes, mixed day interiors'],
            ['EI 1600', '8.0 Stops', '6.5 Stops', 'High-contrast exteriors, bright windows, practical night scenes'],
          ],
        },
      },
      {
        id: 'shutter-angle-and-motion-cadence',
        heading: 'The 180-Degree Shutter Rule and Intentional Deviations',
        paragraphs: [
          'Inherited from rotary disc shutters in film cameras, a 180-degree shutter angle at 24 frames per second yields an exposure time of 1/48th of a second. This specific duration produces the familiar, cohesive motion blur that the human brain associates with cinema.',
          'Narrowing the shutter to 90 degrees or 45 degrees (1/96s or 1/192s) strips away motion blur, rendering airborne dust, water droplets, and physical impacts with staccato, hyper-real clarity. Widening the shutter to 270 or 360 degrees smears movement into dreamlike trails, useful for disorientation or memory sequences.',
        ],
      },
    ],
  },
  {
    id: 'visual-storytelling-composition',
    title: 'How to Build a Visual Story Through Frame Architecture and Negative Space',
    slug: 'visual-storytelling-through-composition',
    excerpt:
      'Composition is visual psychology. Explore how aspect ratio selection, headroom, architectural sub-framing, and intentional negative space communicate power and isolation.',
    category: 'Visual Storytelling',
    tags: [
      'composition',
      'visual storytelling',
      'negative space',
      'aspect ratio',
      'framing',
      'camera angles',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-09-05',
    readingTime: '6 min read',
    featuredImage: '/images/composition-visual-story.svg',
    featuredImageAlt:
      '2.39:1 widescreen composition diagram demonstrating architectural sub-framing, rule-of-thirds intersections, and expansive negative space around a solitary figure.',
    seoTitle: 'Visual Storytelling Through Composition & Negative Space | Anup Rawat',
    seoDescription:
      'Discover how cinematographers use aspect ratios, negative space, sub-framing, and camera angles to tell compelling visual stories without relying on dialogue.',
    status: 'published',
    layoutVariant: 'standard',
    technicalNote: 'Frame Geometry · 2.39:1 vs 1.66:1 · Sub-Framing',
    introduction: [
      'Before an audience processes plot mechanics, they react viscerally to geometry. Where a character is placed relative to the four borders of the frame communicates whether they command their environment or are being crushed by it.',
      'Strong composition goes beyond mechanically placing eyes on the upper rule-of-thirds line; it treats every frame as a dynamic balance of weight, gaze direction, and architectural tension.',
    ],
    sections: [
      {
        id: 'aspect-ratio-as-narrative-container',
        heading: 'Choosing the Aspect Ratio as a Narrative Container',
        paragraphs: [
          'The aspect ratio defines the stage before a single light is rigged. Taller formats such as 1.33:1 (4:3) or 1.66:1 naturally isolate single portraits and emphasize vertical architecture, making them deeply effective for introspective character studies.',
          'Widescreen formats like 2.39:1 expand peripheral awareness. They excel at placing multiple characters in the same frame to show emotional distance across a table, or dwarfing a lone figure against an expansive landscape.',
        ],
      },
      {
        id: 'short-siding-and-negative-space',
        heading: 'Conventional Look Room vs. Intentional Short-Siding',
        paragraphs: [
          'In classical continuity framing, a character looking camera-right is positioned on the left third of the frame, leaving comfortable "look room" in the direction of their gaze. This creates visual equilibrium and conversational openness.',
          'When a character is deliberately placed on the right edge while still looking right—starving their gaze of space and leaving vast negative emptiness behind their back—the frame becomes psychologically charged. The empty space behind them feels heavy, suggesting paranoia, unseen threat, or emotional disconnection.',
        ],
      },
    ],
  },
  {
    id: 'cinematic-color-and-mood',
    title: 'A Practical Guide to Cinematic Color Contrast, Kelvin Ratios, and Mood',
    slug: 'practical-guide-cinematic-color-and-mood',
    excerpt:
      'Color grading works best when it is built on set rather than rescued in post. How to balance camera white balance against mixed tungsten and daylight sources for rich tonal separation.',
    category: 'Filmmaking Techniques',
    tags: [
      'color grading',
      'color temperature',
      'kelvin',
      'color contrast',
      'blue hour',
      'cinematic mood',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-08-22',
    readingTime: '7 min read',
    featuredImage: '/images/color-mood-grading.svg',
    featuredImageAlt:
      'Twilight blue hour landscape contrasting 7200K cool slate ambient shadows with a warm 2700K tungsten lantern held by a solitary traveler.',
    seoTitle: 'Practical Guide to Cinematic Color Contrast & Mood | Anup Rawat',
    seoDescription:
      'Learn how to create cinematic color palettes in-camera using Kelvin white balance shifts, complementary tungsten-daylight contrast, and restrained production design.',
    status: 'published',
    layoutVariant: 'standard',
    technicalNote: 'Chromatic Separation · 4300K Split Balance · In-Camera Palette',
    introduction: [
      'A common misconception in digital filmmaking is that color mood is applied during the final DI (Digital Intermediate) grading session. In reality, a Lookup Table (LUT) or colorist can only separate hues that were physically recorded with distinct spectral values on set.',
      'If every fixture in a room is dialed to the exact same 5600K white balance and the camera is set to 5600K, pushing the image warm or cool in post shifts the entire frame uniformly, sacrificing chromatic depth.',
    ],
    sections: [
      {
        id: 'splitting-the-kelvin-white-balance',
        heading: 'Splitting the Difference on Camera White Balance',
        paragraphs: [
          'To create natural warm-cool color contrast in-camera, combine sources of different color temperatures and set the camera’s white balance between them. For example, in a dusk interior where ambient window light reads 6500K and an interior practical lamp reads 2800K, setting the camera to 4300K renders the window a rich slate blue while keeping the lamp a glowing amber.',
          'Crucially, because this separation happens optically in front of the sensor, skin tones illuminated by the key light remain natural and full-spectrum even under aggressive post-production grading.',
        ],
      },
      {
        id: 'production-design-and-wardrobe-restraint',
        heading: 'Collaborating with Production Design and Wardrobe',
        paragraphs: [
          'The most evocative cinematic color palettes rarely use the entire color wheel at once. Limiting a scene to two dominant tonal families—such as muted olive greens, weathered charcoal, and warm brass—prevents stray background objects from competing with the actors’ faces.',
        ],
      },
    ],
  },
  {
    id: 'natural-vs-artificial-lighting',
    title: 'Natural Lighting vs. Artificial Lighting: Controlling Falloff on Location',
    slug: 'natural-vs-artificial-lighting-in-film',
    excerpt:
      'Shooting with available light does not mean surrendering control. How to shape sun paths, bounce boards, overheads, and supplemental fixtures so location work feels seamless.',
    category: 'Behind the Scenes',
    tags: [
      'natural lighting',
      'location lighting',
      'golden hour',
      'book light',
      'grip and electric',
      'diffusion',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-08-09',
    readingTime: '8 min read',
    featuredImage: '/images/natural-vs-artificial-light.svg',
    featuredImageAlt:
      'Technical diagram of a location book-light and negative fill grip setup used to shape natural window light.',
    seoTitle: 'Natural Lighting vs. Artificial Lighting in Film | Anup Rawat',
    seoDescription:
      'Compare natural and artificial lighting techniques in filmmaking. Learn how to schedule around the sun path, control harsh midday light, and blend fixtures on location.',
    status: 'published',
    layoutVariant: 'standard',
    technicalNote: 'Location Craft · Sun Path Blocking · Grip Modifiers',
    introduction: [
      'Natural light possesses a scale and spectral fullness that is difficult to replicate from scratch. Yet the sun is a moving fixture: over a four-hour dialogue scene, its angle, intensity, and color temperature shift continuously.',
      'The art of location cinematography lies in bridging the two worlds—using blocking and grip modifiers to harness natural light for the wide shots, then matching that exact direction and softness with artificial fixtures as the sun moves during close-up coverage.',
    ],
    sections: [
      {
        id: 'always-keep-the-sun-as-backlight',
        heading: 'Scheduling Around the Sun as a Consistent Backlight',
        paragraphs: [
          'On exterior locations, staging actors so the sun serves as a three-quarter backlight solves two problems simultaneously. First, the actors are not squinting into harsh direct light, keeping their eyes open and expressive. Second, their faces fall into consistent open shade, which can then be gently lifted to the exact desired stop using unbleached muslin or poly bounce boards.',
          'When overhead midday sun is unavoidable, flying a 12x12 or 20x20 overhead silk or quarter-grid diffusion frame transforms steep, unflattering top-light into a broad, wrapping sky source.',
        ],
      },
      {
        id: 'supplementing-day-interiors',
        heading: 'Extending Daylight Continuity Inside Real Locations',
        paragraphs: [
          'When shooting inside real apartments or heritage buildings, natural window light often drops off too quickly or shifts when clouds pass. Positioning a daylight-balanced fixture outside the window—pushed through diffusion or bounced into an ultrabounce frame—locks in consistent exposure for the entire shooting day.',
        ],
      },
    ],
  },
  {
    id: 'cinematography-pre-production-checklist',
    title: 'The Cinematographer’s Pre-Production Checklist: From Tech Scout to Lookbook',
    slug: 'cinematography-pre-production-checklist',
    excerpt:
      'Great cinematography happens weeks before call time. A practical field checklist covering script breakdowns, sun-tracking scouts, lighting floorplans, and camera prep.',
    category: 'Gear & Workflow',
    tags: [
      'pre-production',
      'tech scout',
      'shot list',
      'lighting diagram',
      'cinematography workflow',
      'camera prep',
    ],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-07-24',
    readingTime: '6 min read',
    featuredImage: '/images/preproduction-shotlist-workflow.svg',
    featuredImageAlt:
      'Overhead architectural floorplan showing south-facing windows, 16:30 sun azimuth, Camera A 28mm wide cone, and Camera B 65mm over-the-shoulder angle.',
    seoTitle: 'Cinematography Pre-Production Checklist & Workflow | Anup Rawat',
    seoDescription:
      'A complete cinematography pre-production checklist covering visual lookbooks, location tech scouts, sun-path planning, lighting diagrams, and rental house camera prep.',
    status: 'published',
    layoutVariant: 'wide',
    technicalNote: 'Production Workflow · Tech Scout · Overhead Floorplans',
    introduction: [
      'On set, time is the scarcest resource. Every minute spent debating where to stage a master shot or waiting for a cable run that wasn’t planned during the scout is a minute taken away from performance and lighting refinement.',
      'Thorough pre-production does not lock a film into a rigid cage; rather, by solving technical logistics in advance, it gives the director and cinematographer the freedom to improvise confidently when inspiration strikes on the day.',
    ],
    sections: [
      {
        id: 'visual-language-and-lookbook-alignment',
        heading: '01. Visual Language & Director Alignment',
        paragraphs: [
          'Begin by translating the emotional arc of the script into concrete visual rules. Instead of collecting random pretty stills, organize the lookbook by narrative act—defining how contrast, lens focal length, camera stability, and color palette evolve as the protagonist changes.',
        ],
        checklist: [
          'Break down the script scene-by-scene for time of day, emotional temperature, and motivating light sources.',
          'Establish aspect ratio, framing grammar, and focal length boundaries for each narrative phase.',
          'Align with the Production Designer and Costume Designer on reflectance values, wall textures, and color contrast.',
        ],
      },
      {
        id: 'location-tech-scout-and-sun-tracking',
        heading: '02. Location Tech Scout & Sun-Path Verification',
        paragraphs: [
          'During the technical scout, walk every location at the actual hour the scene is scheduled to shoot whenever possible. Measure window orientations, ceiling rigging heights, available tie-in power or generator placement, and staging areas for grip and electric carts.',
        ],
        checklist: [
          'Log exact compass azimuth and elevation of the sun for every exterior and window-lit interior scene.',
          'Verify window access from the exterior (ground floor, balcony, condor lift, or interior-only rigging).',
          'Draft overhead lighting and blocking floorplans with the Gaffer and Key Grip to pre-order exact cable runs and frames.',
          'Complete a full checkout day at the rental house: test back-focus on every lens, verify frame lines, and load the show LUT.',
        ],
      },
    ],
  },
  {
    id: 'draft-custom-show-lut-pipeline',
    title: 'Designing a Non-Destructive Show LUT Pipeline for Log-C and RED IPP2',
    slug: 'unpublished-lut-pipeline-notes',
    excerpt:
      'Working draft exploring 33-point tetrahedral 3D LUT transforms, CDL on-set communication, and preserving highlight roll-off through dailies.',
    category: 'Gear & Workflow',
    tags: ['show LUT', 'color pipeline', 'dailies', 'CDL'],
    author: {
      name: 'Anup Rawat',
      role: 'Cinematographer & Visual Storyteller',
    },
    publishedAt: '2026-10-24',
    readingTime: '5 min read',
    featuredImage: '/images/exposure-triangle-latitude.svg',
    featuredImageAlt: 'Sensitometric LUT curve working draft.',
    seoTitle: 'Show LUT Pipeline Notes (Draft) | Anup Rawat',
    seoDescription: 'Internal working draft on non-destructive show LUT creation.',
    status: 'draft',
    technicalNote: 'Working Draft · Internal Notes',
    introduction: [
      'This article is currently in draft status and is excluded from public listings, search results, and XML sitemaps.',
    ],
    sections: [
      {
        id: 'draft-overview',
        heading: 'Draft Notes',
        paragraphs: [
          'Unpublished draft content reserved for editorial review.',
        ],
      },
    ],
  },
];

export function getPublishedArticles(): BlogArticle[] {
  return ARTICLES.filter((article) => article.status === 'published');
}

export function getFeaturedArticle(): BlogArticle {
  const published = getPublishedArticles();
  return published.find((a) => a.isFeatured) || published[0];
}

export function getPublishedArticleBySlug(slug: string): BlogArticle | undefined {
  return ARTICLES.find((article) => article.slug === slug && article.status === 'published');
}

export function getRelatedArticles(currentArticle: BlogArticle, limit = 3): BlogArticle[] {
  const published = getPublishedArticles().filter((a) => a.slug !== currentArticle.slug);

  const scored = published.map((candidate) => {
    let score = 0;
    if (candidate.category === currentArticle.category) score += 3;
    const sharedTags = candidate.tags.filter((tag) => currentArticle.tags.includes(tag));
    score += sharedTags.length * 2;
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((item) => item.candidate);
}

export function getAdjacentArticles(currentSlug: string): {
  previous: BlogArticle | null;
  next: BlogArticle | null;
} {
  const published = getPublishedArticles();
  const idx = published.findIndex((a) => a.slug === currentSlug);
  if (idx === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: idx > 0 ? published[idx - 1] : null,
    next: idx < published.length - 1 ? published[idx + 1] : null,
  };
}
