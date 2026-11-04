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
  featuredImageFileId?: string;
  galleryImages?: any[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  status: 'published' | 'draft';
  isFeatured?: boolean;
  layoutVariant?: 'wide' | 'standard';
  technicalNote: string;
  introduction: string[];
  content?: string;
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

// Pure dynamic data model - no static mock articles
export const ARTICLES: BlogArticle[] = [];

export function getPublishedArticles(): BlogArticle[] {
  return ARTICLES.filter((article) => article.status === 'published');
}

export function getFeaturedArticle(): BlogArticle | undefined {
  const published = getPublishedArticles();
  return published.find((a) => a.isFeatured) || published[0];
}

export function getPublishedArticleBySlug(slug: string): BlogArticle | undefined {
  return ARTICLES.find((article) => article.slug === slug && article.status === 'published');
}

export function getRelatedArticles(
  currentArticle: BlogArticle,
  candidateList?: BlogArticle[],
  limit = 3
): BlogArticle[] {
  const pool = (candidateList && candidateList.length > 0 ? candidateList : getPublishedArticles())
    .filter((a) => a.slug !== currentArticle.slug);

  const scored = pool.map((candidate) => {
    let score = 0;
    if (candidate.category === currentArticle.category) score += 3;
    const sharedTags = (candidate.tags || []).filter((tag) => (currentArticle.tags || []).includes(tag));
    score += sharedTags.length * 2;
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((item) => item.candidate);
}

export function normalizeApiBlog(raw: any): BlogArticle {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://anuprawat.com')
  ).replace(/\/+$/, '');

  const cleanSlug = raw.slug || '';
  const canonical =
    raw.canonicalUrl ||
    raw.canonical_url ||
    `${siteUrl}/blog/${cleanSlug}`;

  let introduction: string[] = [];
  if (Array.isArray(raw.introduction)) {
    introduction = raw.introduction;
  } else if (typeof raw.introduction === 'string') {
    try {
      const parsed = JSON.parse(raw.introduction);
      if (Array.isArray(parsed)) introduction = parsed;
      else if (parsed) introduction = [String(parsed)];
    } catch {
      if (raw.introduction.trim()) introduction = [raw.introduction];
    }
  }

  let sections: ArticleSection[] = [];
  if (Array.isArray(raw.sections)) {
    sections = raw.sections;
  } else if (typeof raw.sections === 'string') {
    try {
      const parsed = JSON.parse(raw.sections);
      if (Array.isArray(parsed)) sections = parsed;
    } catch {
      sections = [];
    }
  }

  let galleryImages: any[] = [];
  if (Array.isArray(raw.galleryImages)) {
    galleryImages = raw.galleryImages;
  } else if (Array.isArray(raw.gallery_images)) {
    galleryImages = raw.gallery_images;
  } else if (typeof raw.galleryImages === 'string') {
    try {
      const parsed = JSON.parse(raw.galleryImages);
      if (Array.isArray(parsed)) galleryImages = parsed;
    } catch {
      galleryImages = [];
    }
  } else if (typeof raw.gallery_images === 'string') {
    try {
      const parsed = JSON.parse(raw.gallery_images);
      if (Array.isArray(parsed)) galleryImages = parsed;
    } catch {
      galleryImages = [];
    }
  }

  return {
    id: String(raw.id || cleanSlug),
    title: raw.title || 'Untitled Article',
    slug: cleanSlug,
    excerpt: raw.excerpt || '',
    category: (raw.category as BlogCategory) || 'Cinematography',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    author:
      raw.author && typeof raw.author === 'object'
        ? {
            name: raw.author.name || 'Anup Rawat',
            role: raw.author.role || 'Cinematographer & Visual Storyteller',
          }
        : { name: 'Anup Rawat', role: 'Cinematographer & Visual Storyteller' },
    publishedAt:
      raw.publishedAt || raw.published_at || new Date().toISOString().split('T')[0],
    updatedAt: raw.updatedAt || raw.updated_at,
    readingTime: raw.readingTime || raw.reading_time || '4 min read',
    featuredImage:
      raw.featuredImage || raw.featured_image || '/images/hero-cinematic-set.svg',
    featuredImageAlt:
      raw.featuredImageAlt ||
      raw.featured_image_alt ||
      raw.title ||
      'Article feature image',
    featuredImageFileId: raw.featuredImageFileId || raw.featured_image_file_id,
    galleryImages,
    seoTitle: raw.seoTitle || raw.seo_title || `${raw.title} | Anup Rawat`,
    seoDescription: raw.seoDescription || raw.seo_description || raw.excerpt || '',
    seoKeywords:
      raw.seoKeywords ||
      raw.seo_keywords ||
      (Array.isArray(raw.tags) ? raw.tags.join(', ') : ''),
    canonicalUrl: canonical,
    status: (raw.status as 'published' | 'draft') || 'published',
    isFeatured: Boolean(raw.isFeatured || raw.is_featured),
    layoutVariant:
      (raw.layoutVariant || raw.layout_variant) === 'standard' ? 'standard' : 'wide',
    technicalNote: raw.technicalNote || raw.technical_note || '',
    introduction,
    content: raw.content || undefined,
    sections,
  };
}

export async function fetchDynamicArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const cleanSlug = decodeURIComponent(slug).trim();
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:5000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${backendUrl}/api/blogs/${encodeURIComponent(cleanSlug)}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        return normalizeApiBlog(json.data);
      }
    }
  } catch {
    // Backend offline or error
  }

  return null;
}

export async function fetchDynamicArticles(): Promise<BlogArticle[]> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:5000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${backendUrl}/api/blogs?limit=50&status=published`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        return json.data.map(normalizeApiBlog);
      }
    }
  } catch {
    // Backend offline or error
  }

  return [];
}
