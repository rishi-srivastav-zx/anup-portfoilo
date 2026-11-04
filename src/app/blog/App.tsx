'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BlogLanding from './components/BlogLanding';
import ArticleDetail from './components/ArticleDetail';
import { BlogCategory } from './data/articles';

function normalizePathname(rawPath: string): string {
  if (!rawPath || rawPath === '/') return '/blog';
  const cleaned = rawPath.replace(/\/+$/, '');
  return cleaned || '/blog';
}

export default function App() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? normalizePathname(window.location.pathname) : '/blog'
  );
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() =>
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  );

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePathname(window.location.pathname));
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((targetUrl: string) => {
    // If target is a main portfolio anchor section, redirect to home page with hash
    if (
      targetUrl === '/home' ||
      targetUrl === '/' ||
      targetUrl === '#home' ||
      targetUrl === '/#home'
    ) {
      window.location.href = '/#home';
      return;
    }
    if (
      targetUrl === '/work' ||
      targetUrl === '#work' ||
      targetUrl === '/#work' ||
      targetUrl.includes('#work')
    ) {
      window.location.href = '/#work';
      return;
    }
    if (
      targetUrl === '/about' ||
      targetUrl === '#about' ||
      targetUrl === '/#about' ||
      targetUrl.includes('#about')
    ) {
      window.location.href = '/#about';
      return;
    }
    if (
      targetUrl === '/visuals' ||
      targetUrl === '#visuals' ||
      targetUrl === '/#visuals' ||
      targetUrl.includes('#visuals')
    ) {
      window.location.href = '/#visuals';
      return;
    }
    if (
      targetUrl === '/contact' ||
      targetUrl === '#contact' ||
      targetUrl === '/#contact' ||
      targetUrl.includes('#contact')
    ) {
      window.location.href = '/#contact';
      return;
    }

    const [rawPath, rawQuery] = targetUrl.split('?');
    const nextPath = normalizePathname(rawPath);
    const nextSearch = rawQuery ? `?${rawQuery}` : '';

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `${nextPath}${nextSearch}`);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    setPathname(nextPath);
    setSearchParams(new URLSearchParams(rawQuery || ''));
  }, []);

  const handleSyncFilterParams = useCallback((category: string, query: string) => {
    if (typeof window === 'undefined') return;
    if (normalizePathname(window.location.pathname) !== '/blog') return;

    const params = new URLSearchParams();
    if (category && category !== 'All') {
      params.set('category', category);
    }
    if (query && query.trim().length > 0) {
      params.set('q', query.trim());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/blog?${queryString}` : '/blog';
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (newUrl !== currentUrl) {
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleSelectFooterCategory = useCallback(
    (category: BlogCategory) => {
      handleNavigate(`/blog?category=${encodeURIComponent(category)}`);
    },
    [handleNavigate]
  );

  const renderMainView = () => {
    if (pathname === '/blog' || pathname === '/') {
      const initialCategory = searchParams.get('category') || 'All';
      const initialQuery = searchParams.get('q') || '';
      return (
        <BlogLanding
          initialCategory={initialCategory}
          initialQuery={initialQuery}
          onNavigate={handleNavigate}
          onSyncFilterParams={handleSyncFilterParams}
        />
      );
    }

    if (pathname.startsWith('/blog/')) {
      const slug = decodeURIComponent(pathname.slice('/blog/'.length));
      return <ArticleDetail slug={slug} onNavigate={handleNavigate} />;
    }

    // Fallback -> article detail or back to blog landing
    return <ArticleDetail slug={pathname.replace(/^\//, '')} onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E6DDD2] text-[#14100E] font-['DM_Sans'] selection:bg-[#012CEB] selection:text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#012CEB] focus:text-white focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

      <Header currentPath={pathname} onNavigate={handleNavigate} />

      <main id="main-content" className="flex-1">
        {renderMainView()}
      </main>

      <Footer onNavigate={handleNavigate} onSelectCategory={handleSelectFooterCategory} />
    </div>
  );
}
