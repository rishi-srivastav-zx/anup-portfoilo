'use client';

import { useRouter } from 'next/navigation';
import { BLOG_CATEGORIES, BlogCategory } from '../data/articles';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onSelectCategory?: (category: BlogCategory) => void;
}

export default function Footer({ onNavigate, onSelectCategory }: FooterProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    if (path === '/' || path === '/home' || path.startsWith('/#')) {
      window.location.href = path === '/' ? '/#home' : path;
      return;
    }
    if (path === '/about' || path === '/work' || path === '/visuals' || path === '/contact') {
      window.location.href = `/#${path.replace('/', '')}`;
      return;
    }
    router.push(path);
  };

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    handleNavigate(path);
  };

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: BlogCategory) => {
    e.preventDefault();
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      handleNavigate(`/blog?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <footer className="border-t border-[#14100E]/15 bg-[#E6DDD2] text-[#14100E]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#14100E]/15">
          {/* Column 1: Identity & Signature */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col items-start select-none">
              <span className="font-signature text-3xl sm:text-4xl font-bold text-[#14100E] leading-none tracking-tight transform -rotate-1">
                Anup Rawat
              </span>
              <span className="font-signature text-xl sm:text-2xl font-bold text-[#012CEB] leading-none mt-1 transform -rotate-1">
                (Baaz)
              </span>
            </div>
            <p className="text-sm text-[#6B625A] max-w-md leading-relaxed">
              Cinematographer &amp; Visual Storyteller crafting narrative drama, commercial films,
              and visual essays. Focused on motivated lighting, disciplined camera movement, and
              emotional visual grammar.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#6B625A]">
              <span>Narrative Features</span>
              <span aria-hidden="true">·</span>
              <span>Commercial Cinematography</span>
              <span aria-hidden="true">·</span>
              <span>Visual Grammar</span>
            </div>
          </div>

          {/* Column 2: Portfolio Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h2 className="font-mono-tech text-xs font-semibold tracking-wider text-[#14100E] uppercase">
              Portfolio
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/#home"
                  onClick={(e) => handleLink(e, '/#home')}
                  className="text-[#6B625A] hover:text-[#012CEB] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/#work"
                  onClick={(e) => handleLink(e, '/#work')}
                  className="text-[#6B625A] hover:text-[#012CEB] transition-colors"
                >
                  Selected Work
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={(e) => handleLink(e, '/#about')}
                  className="text-[#6B625A] hover:text-[#012CEB] transition-colors"
                >
                  About &amp; Approach
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  onClick={(e) => handleLink(e, '/blog')}
                  className="text-[#012CEB] font-semibold transition-colors"
                >
                  The Cinematic Journal
                </a>
              </li>
              <li>
                <a
                  href="/#contact"
                  onClick={(e) => handleLink(e, '/#contact')}
                  className="text-[#6B625A] hover:text-[#012CEB] transition-colors"
                >
                  Project Enquiry
                </a>
              </li>
              <li className="pt-1">
                <a
                  href="/login-page"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#14100E] hover:text-[#012CEB] underline underline-offset-4 decoration-[#14100E]/30 hover:decoration-[#012CEB] transition-colors"
                >
                  <span>Client Portal / Login</span>
                  <span className="text-xs">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Journal Topics */}
          <div className="md:col-span-4 space-y-3">
            <h2 className="font-mono-tech text-xs font-semibold tracking-wider text-[#14100E] uppercase">
              Journal Topics
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {BLOG_CATEGORIES.map((category) => (
                <li key={category}>
                  <a
                    href={`/blog?category=${encodeURIComponent(category)}`}
                    onClick={(e) => handleCategoryClick(e, category)}
                    className="text-[#6B625A] hover:text-[#012CEB] transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#6B625A]">
          <p>© {new Date().getFullYear()} Anup Rawat. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#14100E] font-medium">Keep creating.</span>
            <span aria-hidden="true">·</span>
            <a
              href="/login-page"
              className="hover:text-[#012CEB] transition-colors"
            >
              Client Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
