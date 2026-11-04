/**
 * Configuration and dynamic field schema for the Blog Form.
 * Matches all data structures in src/app/blog/data/articles.ts and public blog components.
 */

export const BLOG_CATEGORIES = [
  'Cinematography',
  'Lighting & Exposure',
  'Camera & Lenses',
  'Visual Storytelling',
  'Behind the Scenes',
  'Filmmaking Techniques',
  'Gear & Workflow',
];

export const LAYOUT_VARIANTS = [
  { value: 'wide', label: 'Wide Editorial (Full Width Hero + Expanded Reading Grid)' },
  { value: 'standard', label: 'Standard Editorial (Contained Hero + Sidebar TOC)' },
];

export const ARTICLE_STATUSES = [
  { value: 'draft', label: 'Draft (Internal Only)', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' },
  { value: 'published', label: 'Published (Live On Journal)', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
];

export const FORM_STEPS = [
  {
    id: 'basic',
    stepNumber: 1,
    title: 'Core Details',
    shortDesc: 'Title, slug, category & author',
    iconName: 'FileText',
  },
  {
    id: 'media',
    stepNumber: 2,
    title: 'Hero & Media',
    shortDesc: 'Featured image & accessibility',
    iconName: 'Image',
  },
  {
    id: 'sections',
    stepNumber: 3,
    title: 'Content Sections',
    shortDesc: 'H2/H3 blocks, quotes, tables & checklist',
    iconName: 'Layers',
  },
  {
    id: 'seo',
    stepNumber: 4,
    title: 'SEO & Social',
    shortDesc: 'Meta tags, SERP & social cards',
    iconName: 'Globe',
  },
];

export const SUGGESTED_TAGS = [
  'cinematic lighting',
  'chiaroscuro',
  'negative fill',
  'lighting ratios',
  'motivated lighting',
  'anamorphic',
  'spherical',
  'lens flares',
  'oval bokeh',
  'color grading',
  'film emulation',
  'LUT pipeline',
  'Kodak 5219',
  'ARRI LogC4',
  'inverse square law',
  'location scouting',
  'visual worldbuilding',
  'color palette',
  'sun tracking',
  'pre-production',
];

export const STOCK_IMAGE_PRESETS = [
  {
    url: '/images/lighting-emotion-shadows.svg',
    alt: 'Chiaroscuro lighting diagram showing a warm tungsten key lamp, architectural window, and negative fill frame shaping shadow falloff.',
    label: 'Chiaroscuro Lighting Study (SVG)',
  },
  {
    url: '/images/anamorphic-lens-geometry.svg',
    alt: 'Optical diagram contrasting cylindrical lens squeeze geometry against spherical optics, highlighting 2x anamorphic horizontal field of view.',
    label: 'Anamorphic Lens Geometry (SVG)',
  },
  {
    url: '/images/film-emulation-lut-pipeline.svg',
    alt: 'Color science flowchart mapping ARRI LogC4 input through ACES AP0, custom film emulation LUT, and Rec.709 tone curve transforms.',
    label: 'Color Science & LUT Pipeline (SVG)',
  },
  {
    url: '/images/location-scouting-sun-angles.svg',
    alt: 'Architectural sun path diagram showing golden hour incident angles, ambient light bounce vectors, and terrain shadow contours.',
    label: 'Location Scouting & Sun Vectors (SVG)',
  },
];

export const INITIAL_SECTION_STATE = {
  id: '',
  heading: '',
  paragraphs: [''],
  subSections: [],
  pullQuote: null, // { text: '', context: '' }
  inlineImage: null, // { src: '', alt: '', caption: '' }
  table: null, // { caption: '', headers: ['Parameter', 'Value', 'Notes'], rows: [['', '', '']] }
  checklist: null, // ['Item 1', 'Item 2']
};

export const INITIAL_ARTICLE_STATE = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  tags: [],
  author: {
    name: '',
    role: '',
  },
  publishedAt: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString().split('T')[0],
  readingTime: '',
  featuredImage: '',
  featuredImageAlt: '',
  galleryImages: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  canonicalUrl: '',
  status: 'published',
  isFeatured: false,
  layoutVariant: 'wide',
  technicalNote: '',
  introduction: [],
  content: '',
  sections: [],
};

/**
 * Utility to calculate estimated reading time from article text
 */
export function calculateReadingTime(article) {
  if (!article) return '1 min read';
  let totalWords = 0;

  totalWords += (article.title || '').split(/\s+/).filter(Boolean).length;
  totalWords += (article.excerpt || '').split(/\s+/).filter(Boolean).length;

  (article.introduction || []).forEach((p) => {
    totalWords += (p || '').split(/\s+/).filter(Boolean).length;
  });

  (article.sections || []).forEach((sec) => {
    totalWords += (sec.heading || '').split(/\s+/).filter(Boolean).length;
    (sec.paragraphs || []).forEach((p) => {
      totalWords += (p || '').split(/\s+/).filter(Boolean).length;
    });
    (sec.subSections || []).forEach((sub) => {
      totalWords += (sub.title || '').split(/\s+/).filter(Boolean).length;
      (sub.paragraphs || []).forEach((sp) => {
        totalWords += (sp || '').split(/\s+/).filter(Boolean).length;
      });
    });
    if (sec.pullQuote?.text) {
      totalWords += sec.pullQuote.text.split(/\s+/).filter(Boolean).length;
    }
  });

  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.ceil(totalWords / wordsPerMinute));
  return `${minutes} min read`;
}

/**
 * Utility to slugify titles into safe url strings
 */
export function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

