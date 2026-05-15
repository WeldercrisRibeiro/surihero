import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, Search, ChevronRight, ChevronDown, FileText,
  X, Menu, Clock, Bookmark, BookMarked, Loader2, AlertTriangle,
  ArrowRight, Copy, Check, AlignLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOCS_MANIFEST, type ManifestPage, type ManifestCategory } from '@/docs/manifest';

// ─── Markdown → HTML parser ───────────────────────────────────────────────────

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inlineMd(text: string): string {
  return escHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

const CALLOUT_VARIANTS: Record<string, string> = {
  NOTE: 'info', TIP: 'tip', WARNING: 'warning', CAUTION: 'danger', DANGER: 'danger', INFO: 'info',
};
const CALLOUT_TITLES: Record<string, string> = {
  NOTE: 'Nota', TIP: 'Dica', WARNING: 'Atenção', CAUTION: 'Cuidado', DANGER: 'Atenção', INFO: 'Informação',
};

function parseMarkdown(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      const lang = escHtml(line.slice(3).trim());
      let code = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code += lines[i] + '\n'; i++; }
      html += `<div class="docs-code-block">${lang ? `<span class="docs-code-block__lang">${lang}</span>` : ''}<pre><code>${escHtml(code.trimEnd())}</code></pre></div>`;
      i++; continue;
    }
    if (line.startsWith('> ')) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) { bqLines.push(lines[i].slice(2)); i++; }
      const raw = bqLines.join('\n');
      const alertMatch = raw.match(/^\[!(NOTE|TIP|WARNING|CAUTION|DANGER|INFO)\]\n?([\s\S]*)/i);
      if (alertMatch) {
        const key = alertMatch[1].toUpperCase();
        const variant = CALLOUT_VARIANTS[key] ?? 'info';
        const title = CALLOUT_TITLES[key] ?? key;
        html += `<div class="docs-callout docs-callout--${variant}"><div class="docs-callout__icon"></div><div class="docs-callout__body"><p class="docs-callout__title">${title}</p><p class="docs-callout__text">${inlineMd(alertMatch[2].trim())}</p></div></div>`;
      } else {
        html += `<div class="docs-callout docs-callout--info"><div class="docs-callout__body"><p class="docs-callout__text">${inlineMd(raw.trim())}</p></div></div>`;
      }
      continue;
    }
    const hm = line.match(/^(#{1,4})\s+(.+)/);
    if (hm) {
      const level = hm[1].length;
      const text = hm[2].trim();
      if (level === 1) { i++; continue; }
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      html += `<h${level} id="${id}" class="docs-heading docs-heading--${level}"><a href="#${id}" class="docs-heading-anchor">#</a>${inlineMd(text)}</h${level}>`;
      i++; continue;
    }
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) { html += `<hr class="docs-divider">`; i++; continue; }
    if (/^[-*+] /.test(line)) {
      html += `<ul class="docs-list docs-list--unordered">`;
      while (i < lines.length && /^[-*+] /.test(lines[i])) { html += `<li>${inlineMd(lines[i].slice(2))}</li>`; i++; }
      html += `</ul>`; continue;
    }
    if (/^\d+\. /.test(line)) {
      html += `<ol class="docs-list docs-list--ordered">`;
      while (i < lines.length && /^\d+\. /.test(lines[i])) { html += `<li>${inlineMd(lines[i].replace(/^\d+\. /, ''))}</li>`; i++; }
      html += `</ol>`; continue;
    }
    if (line.trim() === '') { i++; continue; }
    let para = '';
    while (i < lines.length && lines[i].trim() !== '' && !/^#{1,4} /.test(lines[i]) && !lines[i].startsWith('```') && !lines[i].startsWith('> ') && !/^[-*+] /.test(lines[i]) && !/^\d+\. /.test(lines[i]) && !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim())) {
      para += lines[i] + ' '; i++;
    }
    if (para.trim()) html += `<p class="docs-paragraph">${inlineMd(para.trim())}</p>`;
  }
  return html;
}

function extractTitle(md: string): string {
  const m = md.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : '';
}

// ─── Search helpers ───────────────────────────────────────────────────────────

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/gm, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s*\[!\w+\]\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^-{3,}$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function highlightText(text: string, query: string): string {
  const safe = escHtml(text);
  if (!query.trim()) return safe;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
}

function extractSnippet(plainText: string, query: string, contextLen = 65): string {
  const lower = plainText.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return plainText.slice(0, 130) + '…';
  const start = Math.max(0, idx - contextLen);
  const end = Math.min(plainText.length, idx + q.length + contextLen);
  let snippet = plainText.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < plainText.length) snippet += '…';
  return snippet;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface IndexEntry { page: ManifestPage; category: ManifestCategory; plainText: string; }
interface SearchResult { page: ManifestPage; category: ManifestCategory; snippet: string; matchCount: number; }

function allPages(manifest: ManifestCategory[]): ManifestPage[] {
  return manifest.flatMap((c) => c.pages);
}

/** Extrai headings h2/h3/h4 do markdown para o sumário lateral */
function extractHeadings(md: string) {
  const result: { level: number; text: string; id: string }[] = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^(#{2,4})\s+(.+)/);
    if (m) {
      const text = m[2].trim().replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      result.push({ level: m[1].length, text, id });
    }
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Docs() {
  const [activePage, setActivePage] = useState<ManifestPage>(DOCS_MANIFEST[0].pages[0]);
  const [markdownContent, setMarkdownContent] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [tocHeadings, setTocHeadings] = useState<{ level: number; text: string; id: string }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [copied, setCopied] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [index, setIndex] = useState<IndexEntry[]>([]);
  const [indexReady, setIndexReady] = useState(false);

  // Sidebar / bookmarks
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(
    Object.fromEntries(DOCS_MANIFEST.map((c) => [c.id, true]))
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => { setPortalNode(document.getElementById('topbar-portal-target')); }, []);

  // ── Build search index on mount ──────────────────────────────────────────
  useEffect(() => {
    const entries: IndexEntry[] = [];
    const promises = DOCS_MANIFEST.flatMap((cat) =>
      cat.pages.map((page) =>
        fetch(page.file)
          .then((r) => r.text())
          .then((md) => entries.push({ page, category: cat, plainText: stripMarkdown(md) }))
          .catch(() => {})
      )
    );
    Promise.all(promises).then(() => { setIndex(entries); setIndexReady(true); });
  }, []);

  // ── Fetch page markdown ──────────────────────────────────────────────────
  useEffect(() => {
    setLoadState('loading');
    setMarkdownContent(''); setRenderedHtml('');
    if (contentRef.current) contentRef.current.scrollTop = 0;
    fetch(activePage.file)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((md) => {
        setMarkdownContent(md);
        setRenderedHtml(parseMarkdown(md));
        setPageTitle(extractTitle(md) || activePage.title);
        setTocHeadings(extractHeadings(md));
        setActiveHeadingId('');
        setLoadState('idle');
      })
      .catch(() => setLoadState('error'));
  }, [activePage]);

  // ── Run search ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || !indexReady) { setSearchResults([]); setSelectedIdx(0); return; }
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    index.forEach((entry) => {
      const text = entry.plainText.toLowerCase();
      let count = 0, pos = 0;
      while ((pos = text.indexOf(q, pos)) !== -1) { count++; pos += q.length; }
      if (count > 0) {
        results.push({
          page: entry.page,
          category: entry.category,
          snippet: extractSnippet(entry.plainText, searchQuery),
          matchCount: count,
        });
      }
    });
    results.sort((a, b) => b.matchCount - a.matchCount);
    setSearchResults(results);
    setSelectedIdx(0);
  }, [searchQuery, index, indexReady]);

  // ── IntersectionObserver para heading ativo ──────────────────────────────
  useEffect(() => {
    if (!tocHeadings.length || !contentRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveHeadingId(e.target.id); });
      },
      { root: contentRef.current, rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );
    tocHeadings.forEach(({ id }) => {
      const el = contentRef.current?.querySelector(`#${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocHeadings, renderedHtml]);

  // ── Copy page link ────────────────────────────────────────────────────────
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Open overlay when typing ─────────────────────────────────────────────
  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => overlayInputRef.current?.focus(), 50);
  };

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  // ── Keyboard nav in overlay ──────────────────────────────────────────────
  const handleOverlayKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { closeSearch(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, searchResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && searchResults[selectedIdx]) {
      setActivePage(searchResults[selectedIdx].page);
      closeSearch();
    }
  }, [searchResults, selectedIdx, closeSearch]);

  // ── ESC + Ctrl+K global shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) { closeSearch(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, closeSearch]);

  const navigate = (page: ManifestPage) => { setActivePage(page); closeSearch(); };
  const toggleCat = (id: string) => setExpandedCats((p) => ({ ...p, [id]: !p[id] }));
  const toggleBookmark = (id: string) => setBookmarks((p) => p.includes(id) ? p.filter((b) => b !== id) : [...p, id]);

  const all = allPages(DOCS_MANIFEST);
  const currentIdx = all.findIndex((p) => p.id === activePage.id);
  const prevPage = currentIdx > 0 ? all[currentIdx - 1] : null;
  const nextPage = currentIdx < all.length - 1 ? all[currentIdx + 1] : null;
  const isBookmarked = bookmarks.includes(activePage.id);

  return (
    <div className="docs-root">
      {/* ── Topbar portal ── */}
      {portalNode && createPortal(
        <div className="docs-topbar-portal">
          {/* Breadcrumb — left */}
          <div className="docs-topbar-portal__side">
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
              <h1 className="font-bold text-xs sm:text-sm text-foreground truncate m-0">Documentação</h1>
              <span className="hidden sm:block text-muted-foreground/40 text-xs">/</span>
              <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[130px]">{pageTitle || activePage.title}</span>
            </div>
          </div>

          {/* Search — center */}
          <div className="docs-topbar-portal__center">
            <button onClick={openSearch} className="docs-topbar-search">
              <Search size={13} className="shrink-0 opacity-60" />
              <span className="docs-topbar-search__placeholder">
                {indexReady ? 'Buscar documentação...' : 'Indexando...'}
              </span>
              <kbd className="docs-topbar-search__kbd">Ctrl K</kbd>
            </button>
          </div>

          {/* Actions — right */}
          <div className="docs-topbar-portal__side docs-topbar-portal__side--right">
            <button onClick={() => toggleBookmark(activePage.id)} className={cn('flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all h-8', isBookmarked ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-accent hover:text-foreground')}>
              {isBookmarked ? <BookMarked className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isBookmarked ? 'Salvo' : 'Salvar'}</span>
            </button>
            <button onClick={() => setSidebarOpen((o) => !o)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-foreground/70 hover:bg-accent hover:text-foreground text-[11px] font-bold uppercase tracking-wider transition-all h-8">
              {sidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{sidebarOpen ? 'Ocultar' : 'Sumário'}</span>
            </button>
          </div>
        </div>,
        portalNode
      )}

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <aside className="docs-sidebar">


          {/* Nav tree */}
          <nav className="docs-sidebar__nav">
            {DOCS_MANIFEST.map((cat) => (
              <div key={cat.id} className="docs-sidebar__category">
                <button onClick={() => toggleCat(cat.id)} className="docs-sidebar__cat-btn">
                  <span className="docs-sidebar__cat-label">{cat.label}</span>
                  {expandedCats[cat.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                {expandedCats[cat.id] && (
                  <ul className="docs-sidebar__pages">
                    {cat.pages.map((page) => (
                      <li key={page.id}>
                        <button onClick={() => navigate(page)} className={cn('docs-sidebar__page-btn', activePage.id === page.id && 'docs-sidebar__page-btn--active')}>
                          <FileText size={12} className="shrink-0 opacity-60" />
                          <span className="truncate">{page.title}</span>
                          {bookmarks.includes(page.id) && <Bookmark size={10} className="ml-auto shrink-0 text-primary opacity-70" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* ── Content + ToC wrapper ── */}
      <main className="docs-content" ref={contentRef}>
        <div className="docs-layout">
          <article className="docs-article">
            {loadState === 'loading' && (
              <div className="flex items-center justify-center py-32 text-muted-foreground gap-3">
                <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando...</span>
              </div>
            )}
            {loadState === 'error' && (
              <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive opacity-60" />
                <p className="text-sm font-semibold">Não foi possível carregar o documento.</p>
                <p className="text-xs text-muted-foreground">Arquivo: <code className="bg-muted px-1 rounded text-xs">{activePage.file}</code></p>
              </div>
            )}
            {loadState === 'idle' && markdownContent && (
              <>
                {/* Banner */}
                {activePage.banner && activePage.banner.type === 'gradient' && (
                  <div
                    className="docs-banner"
                    style={{ background: `linear-gradient(135deg, ${activePage.banner.from}, ${activePage.banner.to})` }}
                  >
                    {activePage.banner.title && (
                      <div className="docs-banner__text">
                        <span className="docs-banner__title">{activePage.banner.title}</span>
                        {activePage.banner.subtitle && (
                          <span className="docs-banner__subtitle">{activePage.banner.subtitle}</span>
                        )}
                      </div>
                    )}
                    <div className="docs-banner__glow" />
                  </div>
                )}

                {/* Article header */}
                <header className="docs-article__header">
                  <div className="docs-article__header-meta">
                    <span className="docs-article__tag"><FileText size={11} />Documento</span>
                    {activePage.updatedAt && (
                      <span className="docs-article__updated">
                        <Clock size={11} />
                        Atualizado em {new Date(activePage.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h1 className="docs-article__title">{pageTitle || activePage.title}</h1>
                  <hr className="docs-article__separator" />
                </header>

                <div className="docs-article__body" dangerouslySetInnerHTML={{ __html: renderedHtml }} />

                <footer className="docs-article__footer">
                  <div className="docs-nav-arrows">
                    {prevPage ? (
                      <button onClick={() => navigate(prevPage)} className="docs-nav-arrow docs-nav-arrow--prev">
                        <ChevronRight size={14} className="rotate-180 shrink-0" />
                        <div><span className="docs-nav-arrow__label">Anterior</span><span className="docs-nav-arrow__title">{prevPage.title}</span></div>
                      </button>
                    ) : <span />}
                    {nextPage ? (
                      <button onClick={() => navigate(nextPage)} className="docs-nav-arrow docs-nav-arrow--next">
                        <div><span className="docs-nav-arrow__label">Próximo</span><span className="docs-nav-arrow__title">{nextPage.title}</span></div>
                        <ChevronRight size={14} className="shrink-0" />
                      </button>
                    ) : <span />}
                  </div>
                </footer>
              </>
            )}
          </article>

          {/* ToC — sumário lateral direito */}
          {tocHeadings.length > 0 && loadState === 'idle' && (
            <aside className="docs-toc">
              <div className="docs-toc__inner">
                <p className="docs-toc__label">
                  <AlignLeft size={12} />
                  Nesta página
                </p>
                <ul className="docs-toc__list">
                  {tocHeadings.map(({ id, text, level }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={cn(
                          'docs-toc__link',
                          level === 3 && 'docs-toc__link--h3',
                          level === 4 && 'docs-toc__link--h4',
                          activeHeadingId === id && 'docs-toc__link--active'
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = contentRef.current?.querySelector(`#${id}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setActiveHeadingId(id);
                        }}
                      >
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div className="docs-search-overlay" onClick={closeSearch}>
          <div className="docs-search-modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleOverlayKey}>
            {/* Input row */}
            <div className="docs-search-modal__input-row">
              <Search size={16} className="docs-search-modal__input-icon" />
              <input
                ref={overlayInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar na documentação..."
                className="docs-search-modal__input"
              />
              {searchQuery && searchResults.length > 0 && (
                <span className="docs-search-modal__count">{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}</span>
              )}
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="docs-search-modal__clear"><X size={14} /></button>
              )}
            </div>

            {/* Results */}
            <div className="docs-search-modal__results">
              {!indexReady && (
                <div className="docs-search-modal__empty"><Loader2 className="w-4 h-4 animate-spin opacity-50" /><span>Indexando documentos...</span></div>
              )}
              {indexReady && searchQuery && searchResults.length === 0 && (
                <div className="docs-search-modal__empty"><span>Nenhum resultado para "<strong>{searchQuery}</strong>"</span></div>
              )}
              {indexReady && !searchQuery && (
                <div className="docs-search-modal__empty"><span>Digite para buscar em todos os documentos</span></div>
              )}
              {searchResults.map((result, idx) => (
                <button
                  key={result.page.id}
                  onClick={() => navigate(result.page)}
                  className={cn('docs-search-result', idx === selectedIdx && 'docs-search-result--selected')}
                >
                  <div className="docs-search-result__left">
                    <FileText size={15} className="docs-search-result__icon" />
                  </div>
                  <div className="docs-search-result__body">
                    <span className="docs-search-result__category">{result.category.label}</span>
                    <span
                      className="docs-search-result__title"
                      dangerouslySetInnerHTML={{ __html: highlightText(result.page.title, searchQuery) }}
                    />
                    <span
                      className="docs-search-result__snippet"
                      dangerouslySetInnerHTML={{ __html: highlightText(result.snippet, searchQuery) }}
                    />
                  </div>
                  <ArrowRight size={14} className="docs-search-result__arrow" />
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="docs-search-modal__footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> Navegar</span>
              <span><kbd>Enter</kbd> Abrir</span>
              <span><kbd>ESC</kbd> Fechar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
