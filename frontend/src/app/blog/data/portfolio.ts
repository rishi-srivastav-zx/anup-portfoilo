export interface PortfolioWorkItem {
  id: string;
  title: string;
  category: 'Narrative Drama' | 'Commercial & Brand' | 'Documentary' | 'Visual Essay';
  year: string;
  aspectRatio: string;
  optics: string;
  synopsis: string;
  image: string;
  imageAlt: string;
  relatedArticleSlug: string;
}

export const SELECTED_WORKS: PortfolioWorkItem[] = [
  {
    id: 'nocturne-in-amber',
    title: 'Nocturne in Amber',
    category: 'Narrative Drama',
    year: '2026',
    aspectRatio: '2.39:1 Anamorphic',
    optics: '50mm & 75mm Anamorphic Primes · T2.0',
    synopsis:
      'An intimate nocturnal chamber drama exploring memory and estrangement, lit primarily through motivated practical tungsten sources and rain-diffused streetlight.',
    image: '/images/lighting-emotion-shadows.svg',
    imageAlt: 'High-contrast chiaroscuro frame from Nocturne in Amber showing warm lamp key light and cool window shadow.',
    relatedArticleSlug: 'cinematic-lighting-techniques',
  },
  {
    id: 'salt-and-basalt',
    title: 'Salt & Basalt',
    category: 'Visual Essay',
    year: '2026',
    aspectRatio: '1.85:1 Spherical',
    optics: 'Large Format Vintage Primes · T2.4',
    synopsis:
      'Filmed entirely during twilight blue hour along volcanic coastal cliffs, contrasting 7200K natural ambient light against handheld flame and lantern practicals.',
    image: '/images/color-mood-grading.svg',
    imageAlt: 'Wide twilight frame from Salt and Basalt contrasting deep blue basalt cliffs with a warm amber lantern.',
    relatedArticleSlug: 'practical-guide-cinematic-color-and-mood',
  },
  {
    id: 'the-corridor-study',
    title: 'The Architecture of Silence',
    category: 'Commercial & Brand',
    year: '2025',
    aspectRatio: '2.39:1 Scope',
    optics: '32mm Wide Prime on Linear Dolly Track',
    synopsis:
      'A study in disciplined camera movement and brutalist architectural geometry, utilizing single-take dolly push-ins and natural skylight shafts.',
    image: '/images/camera-movement-psychology.svg',
    imageAlt: 'Symmetrical architectural corridor with linear dolly track converging toward a backlit silhouette.',
    relatedArticleSlug: 'understanding-camera-movement',
  },
  {
    id: 'monolith-horizon',
    title: 'Before the Monsoon',
    category: 'Documentary',
    year: '2025',
    aspectRatio: '1.66:1 European Widescreen',
    optics: 'Spherical Primes & Lightweight Zoom · Natural Light',
    synopsis:
      'Observational visual documentary examining rural craftsmanship and changing weather patterns, shaped solely with negative fill and natural window bounce.',
    image: '/images/composition-visual-story.svg',
    imageAlt: 'Sub-framed landscape study showing a solitary figure anchored in negative space before a storm horizon.',
    relatedArticleSlug: 'visual-storytelling-through-composition',
  },
];

export const PHILOSOPHY_PILLARS = [
  {
    index: '01',
    title: 'Story-First Visual Grammar',
    description:
      'Every decision regarding lens choice, sensor format, and camera support begins with the emotional subtext of the scene rather than technical spectacle.',
  },
  {
    index: '02',
    title: 'Motivated Light & Tonal Restraint',
    description:
      'Crafting atmosphere that feels organic to the architecture—allowing actors to move freely within a space while maintaining sculpted shadow falloff.',
  },
  {
    index: '03',
    title: 'Disciplined Pre-Production',
    description:
      'Detailed sun-path tracking, overhead lighting schematics, and collaborative lookbooks ensure that on-set hours are dedicated to performance and nuance.',
  },
];
