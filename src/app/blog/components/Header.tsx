import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NAV_ITEMS = [
  { label: 'Home', path: '/home' },
  { label: 'About', path: '/about' },
  { label: 'Visuals', path: '/visuals' },
  { label: 'Work', path: '/work' },
  { label: 'Journal', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

export default function Header({ currentPath, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const isNavActive = (itemPath: string) => {
    if (itemPath === '/blog') {
      return (
        currentPath === '/' ||
        currentPath === '/blog' ||
        currentPath.startsWith('/blog/')
      );
    }
    return currentPath === itemPath;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#E6DDD2]/90 backdrop-blur-md border-b border-[#14100E]/15">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Signature */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="flex items-center gap-2 select-none group"
        >
          <span className="font-signature text-2xl sm:text-3xl font-bold text-[#14100E] leading-none transform -rotate-1 group-hover:text-[#012CEB] transition-colors">
            Anup Rawat
          </span>
          <span className="font-signature text-lg sm:text-xl font-bold text-[#012CEB] leading-none transform -rotate-1">
            (Baaz)
          </span>
        </a>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Primary Portfolio Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-['DM_Mono'] uppercase tracking-wider"
        >
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                aria-current={active ? 'page' : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 text-xs font-semibold ${
                  active
                    ? 'text-[#14100E] font-bold after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-[#012CEB]'
                    : 'text-[#6B625A] hover:text-[#14100E]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, '/contact')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-['DM_Mono'] font-bold text-[#F4EFE6] bg-[#14100E] hover:bg-[#012CEB] transition-all duration-150 uppercase tracking-wider rounded-md shadow-[2px_2px_0_#14100E] active:translate-x-[1px] active:translate-y-[1px]"
          >
            Project Enquiry ↗
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[#14100E] hover:text-[#012CEB] border border-[#14100E]/20 rounded-md"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          className="md:hidden border-b border-[#14100E]/20 bg-[#F4EFE6] px-5 py-6 shadow-xl"
        >
          <ul className="flex flex-col space-y-3 font-['DM_Mono'] uppercase tracking-wider text-xs font-semibold">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.path);
              return (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => handleLinkClick(e, item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between py-2.5 border-b border-[#14100E]/10 ${
                      active ? 'text-[#012CEB] font-bold' : 'text-[#14100E]/80 hover:text-[#14100E]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="text-[10px] text-[#012CEB] font-bold">• Active</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-6">
            <a
              href="/contact"
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-['DM_Mono'] font-bold text-[#F4EFE6] bg-[#14100E] hover:bg-[#012CEB] transition-colors uppercase tracking-wider rounded-md shadow-[2px_2px_0_#14100E]"
            >
              Discuss a Project ↗
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
