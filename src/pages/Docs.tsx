import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, Search, ChevronRight, ChevronDown, FileText,
  X, Menu, Clock, Bookmark, BookMarked, Loader2, AlertTriangle,
  ArrowRight, Copy, Check, AlignLeft, User, Plus, Edit, Save, Trash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOCS_MANIFEST, type ManifestPage, type ManifestCategory } from '@/docs/manifest';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
      const rawId = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const id = /^\d/.test(rawId) ? `h-${rawId}` : rawId;
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

function makeHeadingId(text: string): string {
  const raw = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return /^\d/.test(raw) ? `h-${raw}` : raw;
}

function extractHeadings(md: string) {
  const result: { level: number; text: string; id: string }[] = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^(#{2,4})\s+(.+)/);
    if (m) {
      const text = m[2].trim().replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1');
      result.push({ level: m[1].length, text, id: makeHeadingId(text) });
    }
  }
  return result;
}

const DEFAULT_UUIDS: Record<string, string> = {
  'bem-vindo': '00000000-0000-0000-0000-000000000010',
  'suri-api': '00000000-0000-0000-0000-000000000020',
  'suri-calcs': '00000000-0000-0000-0000-000000000030',
  'kanban': '00000000-0000-0000-0000-000000000040',
  'workflow': '00000000-0000-0000-0000-000000000050'
};

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Docs() {
  const sessionStr = localStorage.getItem('suri_session');
  const user = sessionStr ? JSON.parse(sessionStr) : null;
  const isAdmin = user?.role === 'admin';

  const [categories, setCategories] = useState<ManifestCategory[]>([]);
  const [dynamicPages, setDynamicPages] = useState<any[]>([]);

  const [activePage, setActivePage] = useState<ManifestPage>({ id: '', title: '', file: '' });
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
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Editor states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editAuthorRole, setEditAuthorRole] = useState('');
  const [editBannerFrom, setEditBannerFrom] = useState('');
  const [editBannerTo, setEditBannerTo] = useState('');
  const [editBannerTitle, setEditBannerTitle] = useState('');
  const [editBannerSubtitle, setEditBannerSubtitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => { setPortalNode(document.getElementById('topbar-portal-target')); }, []);

  // ── Helper to rebuild categories from page list ─────────────────────────────
  const rebuildFromPages = (pagesList: any[]) => {
    const categoriesMap: Record<string, ManifestPage[]> = {};
    pagesList.forEach((p) => {
      const catLabel = p.category || 'Geral';
      if (!categoriesMap[catLabel]) {
        categoriesMap[catLabel] = [];
      }
      categoriesMap[catLabel].push({
        id: p.id,
        title: p.title,
        file: '', // Dynamically provided content
        updatedAt: p.updated_at || p.updatedAt,
        author: p.author_name ? { name: p.author_name, role: p.author_role } : undefined,
        banner: p.banner_from ? {
          type: 'gradient',
          from: p.banner_from,
          to: p.banner_to,
          title: p.banner_title,
          subtitle: p.banner_subtitle
        } : undefined,
        content: p.content
      } as any);
    });

    const cats = Object.entries(categoriesMap).map(([label, pages]) => ({
      id: label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      label,
      pages
    }));
    
    setCategories(cats);

    // Expand categories by default
    setExpandedCats((prev) => {
      const next = { ...prev };
      cats.forEach((c) => {
        if (next[c.id] === undefined) next[c.id] = true;
      });
      return next;
    });

    // Also build the index for search
    const entries = pagesList.map((p) => {
      const catLabel = p.category || 'Geral';
      const pageObj = {
        id: p.id,
        title: p.title,
        file: '',
        updatedAt: p.updated_at,
        author: p.author_name ? { name: p.author_name, role: p.author_role } : undefined,
        banner: p.banner_from ? {
          type: 'gradient',
          from: p.banner_from,
          to: p.banner_to,
          title: p.banner_title,
          subtitle: p.banner_subtitle
        } : undefined,
        content: p.content
      };
      const catObj = {
        id: catLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        label: catLabel,
        pages: [pageObj]
      };
      return {
        page: pageObj as any,
        category: catObj as any,
        plainText: stripMarkdown(p.content)
      };
    });

    setIndex(entries);
    setIndexReady(true);
  };

  // ── Bootstrap from static files to database ─────────────────────────────
  const bootstrapDocs = async () => {
    const seededPages: any[] = [];
    for (const cat of DOCS_MANIFEST) {
      for (const page of cat.pages) {
        try {
          const response = await fetch(page.file);
          const mdText = await response.text();
          const stableId = DEFAULT_UUIDS[page.id] || generateUUID();
          const docObj = {
            id: stableId,
            slug: page.id,
            title: page.title,
            category: cat.label,
            content: mdText,
            updated_at: page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
            created_at: new Date().toISOString(),
            author_name: page.author?.name || '',
            author_role: page.author?.role || '',
            banner_from: page.banner?.from || '',
            banner_to: page.banner?.to || '',
            banner_title: page.banner?.title || '',
            banner_subtitle: page.banner?.subtitle || ''
          };
          seededPages.push(docObj);
        } catch (err) {
          console.error('Error seeding document', page.title, err);
        }
      }
    }

    try {
      await supabase.from('documents').insert(seededPages);
    } catch (err) {
      console.error('Failed to seed Supabase database documents:', err);
    }

    localStorage.setItem('suri_docs_v1', JSON.stringify(seededPages));
    return seededPages;
  };

  // ── Load documents from Supabase/localStorage ───────────────────────────
  const loadDocuments = async () => {
    setLoadState('loading');
    try {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      if (data && data.length > 0) {
        setDynamicPages(data);
        rebuildFromPages(data);
        setLoadState('idle');
        return data;
      }
      
      const local = localStorage.getItem('suri_docs_v1');
      if (local) {
        const parsed = JSON.parse(local);
        const hasInvalidId = parsed.some((p: any) => !p.id || p.id.length < 15);
        if (hasInvalidId) {
          localStorage.removeItem('suri_docs_v1');
        } else {
          setDynamicPages(parsed);
          rebuildFromPages(parsed);
          setLoadState('idle');
          return parsed;
        }
      }

      const seeded = await bootstrapDocs();
      setDynamicPages(seeded);
      rebuildFromPages(seeded);
      setLoadState('idle');
      return seeded;
    } catch (err) {
      console.error('Error loading documents:', err);
      const local = localStorage.getItem('suri_docs_v1');
      if (local) {
        const parsed = JSON.parse(local);
        const hasInvalidId = parsed.some((p: any) => !p.id || p.id.length < 15);
        if (!hasInvalidId) {
          setDynamicPages(parsed);
          rebuildFromPages(parsed);
          setLoadState('idle');
          return parsed;
        }
      }
      setLoadState('error');
    }
  };

  // ── Build search index on mount ──────────────────────────────────────────
  useEffect(() => {
    loadDocuments().then((pages) => {
      if (pages && pages.length > 0) {
        const first = pages[0];
        const mappedPage = {
          id: first.id,
          title: first.title,
          file: '',
          updatedAt: first.updated_at,
          author: first.author_name ? { name: first.author_name, role: first.author_role } : undefined,
          banner: first.banner_from ? {
            type: 'gradient' as const,
            from: first.banner_from,
            to: first.banner_to,
            title: first.banner_title,
            subtitle: first.banner_subtitle
          } : undefined,
          content: first.content
        };
        setActivePage(mappedPage as any);
      }
    });
  }, []);

  // ── Fetch page markdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activePage.id) return;
    
    if (activePage.content !== undefined) {
      setMarkdownContent(activePage.content);
      setRenderedHtml(parseMarkdown(activePage.content));
      setPageTitle(activePage.title);
      setTocHeadings(extractHeadings(activePage.content));
      setActiveHeadingId('');
      setLoadState('idle');
      if (contentRef.current) contentRef.current.scrollTop = 0;
    } else if (activePage.file) {
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
    }
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

  const all = allPages(categories);
  const currentIdx = all.findIndex((p) => p.id === activePage.id);
  const prevPage = currentIdx > 0 ? all[currentIdx - 1] : null;
  const nextPage = currentIdx < all.length - 1 ? all[currentIdx + 1] : null;
  const isBookmarked = bookmarks.includes(activePage.id);

  // ── CRUD Actions ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditId(null);
    setEditTitle('');
    setEditCategory('');
    setEditAuthorName(user?.name || '');
    setEditAuthorRole('Admin');
    setEditBannerFrom('#0a1172');
    setEditBannerTo('#3a0ca3');
    setEditBannerTitle('');
    setEditBannerSubtitle('');
    setEditContent('# Novo Documento\n\nEscreva seu conteúdo em markdown aqui...');
    setIsEditing(true);
  };

  const openEdit = () => {
    setEditId(activePage.id);
    setEditTitle(activePage.title);
    
    const cat = categories.find((c) => c.pages.some((p) => p.id === activePage.id));
    setEditCategory(cat ? cat.label : 'Geral');
    
    setEditAuthorName(activePage.author?.name || user?.name || '');
    setEditAuthorRole(activePage.author?.role || '');
    setEditBannerFrom(activePage.banner?.from || '#0a1172');
    setEditBannerTo(activePage.banner?.to || '#3a0ca3');
    setEditBannerTitle(activePage.banner?.title || '');
    setEditBannerSubtitle(activePage.banner?.subtitle || '');
    setEditContent(activePage.content || '');
    setIsEditing(true);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editCategory.trim() || !editContent.trim()) {
      toast.error('Título, Categoria e Conteúdo são obrigatórios!');
      return;
    }

    const docId = editId || generateUUID();
    const slug = editTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    const payload = {
      id: docId,
      slug,
      title: editTitle.trim(),
      category: editCategory.trim(),
      content: editContent,
      author_name: editAuthorName.trim() || null,
      author_role: editAuthorRole.trim() || null,
      banner_from: editBannerFrom.trim() || null,
      banner_to: editBannerTo.trim() || null,
      banner_title: editBannerTitle.trim() || null,
      banner_subtitle: editBannerSubtitle.trim() || null,
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('documents').upsert([payload]);
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Database save error, using local fallback:', err);
    }

    const updatedPages = editId
      ? dynamicPages.map((p) => p.id === editId ? { ...p, ...payload } : p)
      : [...dynamicPages, { ...payload, created_at: new Date().toISOString() }];
      
    setDynamicPages(updatedPages);
    localStorage.setItem('suri_docs_v1', JSON.stringify(updatedPages));
    rebuildFromPages(updatedPages);
    
    const savedPage = {
      id: docId,
      title: editTitle.trim(),
      file: '',
      updatedAt: payload.updated_at,
      author: payload.author_name ? { name: payload.author_name, role: payload.author_role } : undefined,
      banner: payload.banner_from ? {
        type: 'gradient' as const,
        from: payload.banner_from,
        to: payload.banner_to,
        title: payload.banner_title,
        subtitle: payload.banner_subtitle
      } : undefined,
      content: editContent
    };
    setActivePage(savedPage as any);

    setIsEditing(false);
    toast.success('Documento salvo com sucesso!');
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Tem certeza de que deseja excluir este documento?')) return;

    try {
      const { error } = await supabase.from('documents').delete().eq('id', docId);
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Database delete error, using local fallback:', err);
    }

    const updatedPages = dynamicPages.filter((p) => p.id !== docId);
    setDynamicPages(updatedPages);
    localStorage.setItem('suri_docs_v1', JSON.stringify(updatedPages));
    
    if (updatedPages.length > 0) {
      rebuildFromPages(updatedPages);
      const firstPage = updatedPages[0];
      const mappedPage = {
        id: firstPage.id,
        title: firstPage.title,
        file: '',
        updatedAt: firstPage.updated_at,
        author: firstPage.author_name ? { name: firstPage.author_name, role: firstPage.author_role } : undefined,
        banner: firstPage.banner_from ? {
          type: 'gradient' as const,
          from: firstPage.banner_from,
          to: firstPage.banner_to,
          title: firstPage.banner_title,
          subtitle: firstPage.banner_subtitle
        } : undefined,
        content: firstPage.content
      };
      setActivePage(mappedPage as any);
    } else {
      setCategories([]);
      setActivePage({ id: '', title: '', file: '' });
      setMarkdownContent('');
      setRenderedHtml('');
    }

    setIsEditing(false);
    toast.success('Documento excluído com sucesso!');
  };

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
            {isAdmin && (
              <>
                <button 
                  onClick={openCreate} 
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm h-8"
                  title="Criar Documento"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">Criar</span>
                </button>
                {activePage && activePage.id && (
                  <button 
                    onClick={openEdit} 
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 h-8"
                    title="Editar Documento"
                  >
                    <Edit size={13} />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                )}
              </>
            )}
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
            {categories.map((cat) => (
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
      {isEditing ? (
        <main className="docs-content overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-foreground">{editId ? 'Editar Documento' : 'Novo Documento'}</h2>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Editor Premium de Markdown</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Título do Documento *</label>
                  <input 
                    className="kb-input"
                    type="text"
                    required
                    placeholder="Ex: Introdução ao CRM"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Categoria *</label>
                  <input 
                    className="kb-input"
                    type="text"
                    required
                    placeholder="Ex: Módulos, Integração, Geral"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    {categories.map((c) => (
                      <option key={c.id} value={c.label} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Nome do Autor</label>
                <input 
                  className="kb-input"
                  type="text"
                  placeholder="Ex: Weldercris Ribeiro"
                  value={editAuthorName}
                  onChange={(e) => setEditAuthorName(e.target.value)}
                />
              </div>

              <div className="border border-border/60 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/20 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">Banner do Topo (Opcional)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cor Inicial (Gradient From)</label>
                    <div className="flex gap-2">
                      <input 
                        className="w-10 h-10 rounded-xl border border-border cursor-pointer shrink-0"
                        type="color"
                        value={editBannerFrom.startsWith('#') && editBannerFrom.length === 7 ? editBannerFrom : '#0a1172'}
                        onChange={(e) => setEditBannerFrom(e.target.value)}
                      />
                      <input 
                        className="kb-input flex-1"
                        type="text"
                        placeholder="Ex: #0a1172"
                        value={editBannerFrom}
                        onChange={(e) => setEditBannerFrom(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cor Final (Gradient To)</label>
                    <div className="flex gap-2">
                      <input 
                        className="w-10 h-10 rounded-xl border border-border cursor-pointer shrink-0"
                        type="color"
                        value={editBannerTo.startsWith('#') && editBannerTo.length === 7 ? editBannerTo : '#3a0ca3'}
                        onChange={(e) => setEditBannerTo(e.target.value)}
                      />
                      <input 
                        className="kb-input flex-1"
                        type="text"
                        placeholder="Ex: #3a0ca3"
                        value={editBannerTo}
                        onChange={(e) => setEditBannerTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Título do Banner</label>
                    <input 
                      className="kb-input"
                      type="text"
                      placeholder="Deixe em branco para usar o título principal"
                      value={editBannerTitle}
                      onChange={(e) => setEditBannerTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subtítulo do Banner</label>
                    <input 
                      className="kb-input"
                      type="text"
                      placeholder="Subtítulo chamativo no banner"
                      value={editBannerSubtitle}
                      onChange={(e) => setEditBannerSubtitle(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Conteúdo (Markdown) *</label>
                  <span className="text-[10px] text-muted-foreground">Suporta títulos, listas, blocos de código e alertas</span>
                </div>
                <textarea 
                  className="kb-input min-h-[300px] font-mono text-sm leading-relaxed"
                  placeholder="# Título Principal&#10;&#10;Use o formato padrão do markdown para escrever..."
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      if (confirm('Deseja descartar as alterações?')) {
                        setIsEditing(false);
                      }
                    }} 
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  {editId && (
                    <button 
                      type="button" 
                      onClick={() => handleDeleteDocument(editId)}
                      className="px-5 py-2.5 rounded-2xl border border-red-200 text-sm font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-1.5"
                    >
                      <Trash size={14} /> Excluir
                    </button>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-2xl bg-cyan-500 text-white text-sm font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Save size={14} /> Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <main className="docs-content" ref={contentRef}>
          <div className="docs-layout">
            <article className="docs-article text-left">
              {loadState === 'loading' && (
                <div className="flex items-center justify-center py-32 text-muted-foreground gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando...</span>
                </div>
              )}
              {loadState === 'error' && (
                <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-destructive opacity-60" />
                  <p className="text-sm font-semibold">Não foi possível carregar o documento.</p>
                  <p className="text-xs text-muted-foreground">Arquivo ou ID de documento não sincronizado.</p>
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
                    <div className="docs-article__header-meta flex items-center flex-wrap gap-3 mb-2">
                      <span className="docs-article__tag"><FileText size={11} />Documento</span>
                      {activePage.updatedAt && (
                        <span className="docs-article__updated flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={11} />
                          Atualizado em {new Date(activePage.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                      {activePage.author && (
                        <span className="docs-article__author flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-3">
                          <User size={11} />
                          Por{' '}
                          <span className="font-medium text-foreground">
                            {activePage.author.name}{activePage.author.role ? ` - ${activePage.author.role}` : ''}
                          </span>
                        </span>
                      )}
                    </div>
                    <h1 className="docs-article__title">{pageTitle || activePage.title}</h1>
                    <hr className="docs-article__separator" />
                  </header>

                  <div className="docs-article__body text-left" dangerouslySetInnerHTML={{ __html: renderedHtml }} />

                  <footer className="docs-article__footer">
                    <div className="docs-nav-arrows">
                      {prevPage ? (
                        <button onClick={() => navigate(prevPage)} className="docs-nav-arrow docs-nav-arrow--prev">
                          <ChevronRight size={14} className="rotate-180 shrink-0" />
                          <div className="text-left"><span className="docs-nav-arrow__label">Anterior</span><span className="docs-nav-arrow__title">{prevPage.title}</span></div>
                        </button>
                      ) : <span />}
                      {nextPage ? (
                        <button onClick={() => navigate(nextPage)} className="docs-nav-arrow docs-nav-arrow--next">
                          <div className="text-right"><span className="docs-nav-arrow__label">Próximo</span><span className="docs-nav-arrow__title">{nextPage.title}</span></div>
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
                <div className="docs-toc__inner text-left">
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
      )}

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
            <div className="docs-search-modal__results text-left">
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
