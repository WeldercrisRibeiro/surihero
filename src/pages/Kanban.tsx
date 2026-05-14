import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Trash2,
  Tag,
  Calendar,
  GripVertical,
  GripHorizontal,
  X,
  ChevronDown,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { KanbanService } from '@/lib/kanban-service';
import { supabase, type Profile } from '@/lib/supabase';
import { toast } from 'sonner';
import { AdminUsersModal } from '@/components/AdminUsersModal';

// ──────────────────────────── Types ────────────────────────────

type Priority = 'BAIXO' | 'MÉDIO' | 'URGENTE' | 'IMEDIATO';

interface KanbanTag {
  label: string;
  color: string;
}

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags?: KanbanTag[];
  dueDate?: string;
  owner_email?: string; // For global view
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string; // dot/badge color
  cards: KanbanCard[];
}

// ──────────────────────────── Helpers ────────────────────────────

const PRIORITY_STYLES: Record<Priority, { bg: string; color: string }> = {
  BAIXO:   { bg: '#f3f4f6', color: '#6b7280' },
  MÉDIO:   { bg: '#e0f2fe', color: '#3b82f6' }, // Light blue bg, blue text
  URGENTE: { bg: '#fee2e2', color: '#ef4444' }, // Light red bg, red text
  IMEDIATO:{ bg: '#ffedd5', color: '#f97316' }, // Light orange bg, orange text
};

const COLUMN_COLORS = ['#9ca3af', '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ec4899'];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

// ──────────────────────────── Sub-components ────────────────────────────

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const s = PRIORITY_STYLES[priority];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 4,
        letterSpacing: '0.05em',
        display: 'inline-block',
      }}
    >
      {priority}
    </span>
  );
};

interface CardItemProps {
  card: KanbanCard;
  onDelete: () => void;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const CardItem = ({ card, onDelete, onEdit, onDragStart, onDragEnd }: CardItemProps) => {
  return (
    <div
      className="kb-card"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onEdit}
    >
      <div className="kb-card-inner">
        <div className="kb-card-top">
          <PriorityBadge priority={card.priority} />
          <div className="flex gap-1">
            <button
              className="kb-icon-btn kb-delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Excluir card"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <p className="kb-card-title">{card.title}</p>
        {card.description && (
          <p className="kb-card-desc">{card.description}</p>
        )}
        {card.tags && card.tags.length > 0 && (
          <div className="kb-tags">
            {card.tags.map((t) => (
              <span
                key={t.label}
                className="kb-tag"
                style={{ background: t.color + '22', color: t.color, border: `1px solid ${t.color}44` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
        {card.dueDate && (
          <div className="kb-card-date">
            <Calendar size={11} />
            <span>{formatDate(card.dueDate)}</span>
          </div>
        )}
        {card.owner_email && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center gap-1.5 opacity-60">
            <User size={10} className="text-cyan-500" />
            <span className="text-[9px] font-bold truncate uppercase tracking-wider">{card.owner_email.split('@')[0]}</span>
          </div>
        )}
      </div>
      <div className="kb-drag-handle">
        <GripVertical size={14} />
      </div>
    </div>
  );
};

// ──────────────────────────── Modal: New Task ────────────────────────────

interface TaskModalProps {
  columns: KanbanColumn[];
  defaultColId: string;
  initialData?: KanbanCard;
  onClose: () => void;
  onSave: (colId: string, card: KanbanCard) => void;
}

const TaskModal = ({ columns, defaultColId, initialData, onClose, onSave }: TaskModalProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [desc, setDesc] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'MÉDIO');
  const [colId, setColId] = useState(defaultColId);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<KanbanTag[]>(initialData?.tags || []);

  const TAG_COLORS = ['#7c3aed', '#2563eb', '#059669', '#e11d48', '#f97316', '#eab308'];
  const [tagColorIdx, setTagColorIdx] = useState(0);

  const addTag = () => {
    if (!tagInput.trim()) return;
    setTags((prev) => [...prev, { label: tagInput.trim(), color: TAG_COLORS[tagColorIdx % TAG_COLORS.length] }]);
    setTagInput('');
    setTagColorIdx((i) => i + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(colId, {
      id: initialData?.id || generateId(),
      title: title.trim(),
      description: desc.trim() || undefined,
      priority,
      tags: tags.length ? tags : undefined,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  return (
    <div className="kb-modal-overlay" onClick={onClose}>
      <div className="kb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-header">
          <h3>{initialData ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <button className="kb-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="kb-modal-body">
          <label className="kb-label">Título *</label>
          <input
            className="kb-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da tarefa..."
            autoFocus
            required
          />

          <label className="kb-label">Descrição</label>
          <textarea
            className="kb-input kb-textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição opcional..."
            rows={3}
          />

          <div className="kb-modal-row">
            <div style={{ flex: 1 }}>
              <label className="kb-label">Prioridade</label>
              <select className="kb-input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {(['BAIXO', 'MÉDIO', 'URGENTE', 'IMEDIATO'] as Priority[]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="kb-label">Coluna</label>
              <select className="kb-input" value={colId} onChange={(e) => setColId(e.target.value)}>
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="kb-label">Data de Vencimento</label>
          <input
            className="kb-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label className="kb-label">Tags</label>
          <div className="kb-tag-input-row">
            <input
              className="kb-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Nome da tag + Enter"
              style={{ flex: 1 }}
            />
            <button type="button" className="kb-btn-secondary" onClick={addTag}>
              <Tag size={14} />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="kb-tags" style={{ marginTop: 6 }}>
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="kb-tag"
                  style={{ background: t.color + '22', color: t.color, border: `1px solid ${t.color}44`, cursor: 'pointer' }}
                  onClick={() => setTags((prev) => prev.filter((_, idx) => idx !== i))}
                  title="Clique para remover"
                >
                  {t.label} ×
                </span>
              ))}
            </div>
          )}

          <div className="kb-modal-actions">
            <button type="button" className="kb-btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="kb-btn-primary">
              {initialData ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ──────────────────────────── Modal: New Column ────────────────────────────

interface ColModalProps {
  onClose: () => void;
  onAdd: (title: string, color: string) => void;
  initialData?: { title: string, color: string };
}

const ColModal = ({ onClose, onAdd, initialData }: ColModalProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [color, setColor] = useState(initialData?.color || COLUMN_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), color);
    onClose();
  };

  return (
    <div className="kb-modal-overlay" onClick={onClose}>
      <div className="kb-modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-header">
          <h3>{initialData ? 'Editar Coluna' : 'Nova Coluna'}</h3>
          <button className="kb-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="kb-modal-body">
          <label className="kb-label">Título da Coluna *</label>
          <input
            className="kb-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Em Progresso"
            autoFocus
            required
          />
          <label className="kb-label">Cor do Indicador</label>
          <div className="kb-color-swatches">
            {COLUMN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`kb-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="kb-modal-actions">
            <button type="button" className="kb-btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="kb-btn-primary">
              {initialData ? 'Salvar' : 'Criar Coluna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ──────────────────────────── Main KanbanBoard ────────────────────────────

export const KanbanBoard = () => {
  const { profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    if (!authLoading) {
      if (profile) {
        setSelectedUserId(profile.id);
        fetchUsers();
      } else {
        navigate('/login');
      }
    }
  }, [authLoading, profile]);

  useEffect(() => {
    if (selectedUserId) {
      loadBoard(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      
      let userList = data || [];
      // Ensure current profile is in the list even if DB is empty/mock
      if (profile && !userList.some(u => u.id === profile.id)) {
        userList = [profile, ...userList];
      }
      setAllUsers(userList);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (profile) setAllUsers([profile]);
    }
  };

  const loadBoard = async (uid: string) => {
    if (!uid || authLoading || !profile) return;
    setLoading(true);

    // Segurança: Forçar fechamento do loading após 5s
    const timeout = setTimeout(() => setLoading(false), 5000);

    try {
      if (uid === 'all') {
        // 1. Buscar colunas do admin como base
        const { data: adminCols, error: adminColsError } = await supabase
          .from('kanban_columns')
          .select('*')
          .eq('user_id', profile?.id)
          .order('position');

        if (adminColsError) throw adminColsError;

        // 2. Tentar buscar cards com Join de email
        let { data: allCards, error: allCardsError } = await supabase
          .from('kanban_cards')
          .select('*, profiles!user_id(email)');

        // Fallback se o Join falhar (evita tela branca)
        if (allCardsError) {
          console.warn('Busca com profiles falhou, tentando busca simples');
          const { data: simpleCards } = await supabase.from('kanban_cards').select('*');
          allCards = simpleCards;
        }

        if (!adminCols) {
          setLoading(false);
          return;
        }

        // 3. Mapear nomes de colunas para agrupar cards de todos
        const { data: allCols } = await supabase.from('kanban_columns').select('*');
        const colIdToTitle: Record<string, string> = {};
        allCols?.forEach(c => colIdToTitle[c.id] = c.title);

        const merged = adminCols.map(ac => ({
          id: ac.id,
          title: ac.title,
          color: ac.color,
          cards: (allCards || [])
            .filter(card => colIdToTitle[card.column_id] === ac.title)
            .map(card => ({
              id: card.id,
              title: card.title,
              description: card.description || undefined,
              priority: card.priority,
              tags: card.tags,
              dueDate: card.due_date || undefined,
              owner_email: (card as any).profiles?.email || 'Desconhecido'
            }))
        }));

        setColumns(merged);

        // Auto-init Admin columns if empty
        if (adminCols.length === 0 && profile) {
          const defaults = [
            { title: 'Solicitação', color: '#3b82f6', position: 0 },
            { title: 'Em Triagem', color: '#8b5cf6', position: 1 },
            { title: 'Agendado', color: '#10b981', position: 2 },
            { title: 'Finalizado', color: '#6366f1', position: 3 }
          ];
          for (const d of defaults) {
            await supabase.from('kanban_columns').insert([{ ...d, user_id: profile.id }]);
          }
          const { data: fresh } = await supabase.from('kanban_columns').select('*').eq('user_id', profile.id).order('position');
          if (fresh) setColumns(fresh.map(c => ({ ...c, cards: [] })));
        }
      } else {
        // Modo Usuário: Carregar apenas seus dados
        const { data: cols } = await supabase.from('kanban_columns').select('*').eq('user_id', uid).order('position');
        const { data: cards } = await supabase.from('kanban_cards').select('*').eq('user_id', uid);
        
        if (cols && cols.length > 0) {
          setColumns(cols.map(col => ({
            ...col,
            cards: (cards || []).filter(c => c.column_id === col.id).map(c => ({
              ...c,
              dueDate: c.due_date || undefined,
              description: c.description || undefined
            }))
          })));
        } else if (uid === profile?.id) {
          // Inicializar se for o próprio usuário
          const defaults = [
            { title: 'Solicitação', color: '#3b82f6', position: 0 },
            { title: 'Em Triagem', color: '#8b5cf6', position: 1 },
            { title: 'Agendado', color: '#10b981', position: 2 },
            { title: 'Finalizado', color: '#6366f1', position: 3 }
          ];
          for (const d of defaults) {
            await supabase.from('kanban_columns').insert([{ ...d, user_id: uid }]);
          }
          const { data: fresh } = await supabase.from('kanban_columns').select('*').eq('user_id', uid).order('position');
          if (fresh) setColumns(fresh.map(c => ({ ...c, cards: [] })));
        } else {
          setColumns([]);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar quadro:', err);
      toast.error('Erro na conexão com o banco');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const [search, setSearch] = useState('');
  const [taskModal, setTaskModal] = useState<{ isOpen: boolean; colId: string; card?: KanbanCard }>({
    isOpen: false,
    colId: '',
  });
  const [colModal, setColModal] = useState<{ isOpen: boolean; colId?: string; initialData?: { title: string; color: string } }>({
    isOpen: false,
  });

  const [defaultNewColId, setDefaultNewColId] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  // Column persistence is now managed by Admin only


  // Drag state (cards)
  const draggingCard = useRef<{ cardId: string; fromColId: string } | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  // Drag state (columns)
  const draggingCol = useRef<string | null>(null);
  const [dragOverColForReorder, setDragOverColForReorder] = useState<string | null>(null);

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalNode(document.getElementById('topbar-portal-target'));
  }, []);

  // ── Actions ──

  const saveCard = async (colId: string, card: KanbanCard) => {
    if (!selectedUserId) return;
    try {
      const col = columns.find(c => c.id === colId);
      const position = card.id.length > 10 ? columns.find(c => c.cards.some(k => k.id === card.id))?.cards.findIndex(k => k.id === card.id) ?? 0 : (col?.cards.length || 0);
      
      await KanbanService.saveCard(selectedUserId, colId, {
        ...card,
        position
      });
      loadBoard(selectedUserId);
      toast.success('Tarefa salva');
    } catch (err) {
      toast.error('Erro ao salvar tarefa');
    }
  };

  const deleteCard = async (colId: string, cardId: string) => {
    if (!confirm('Excluir esta tarefa?')) return;
    try {
      await KanbanService.deleteCard(cardId);
      loadBoard(selectedUserId!);
      toast.success('Tarefa excluída');
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const deleteColumn = async (colId: string) => {
    if (confirm('Deseja excluir esta coluna e todas as suas tarefas?')) {
      try {
        await KanbanService.deleteColumn(colId);
        loadBoard(selectedUserId!);
        toast.success('Coluna excluída');
      } catch (err) {
        toast.error('Erro ao excluir coluna');
      }
    }
  };

  const saveColumn = async (title: string, color: string, colId?: string) => {
    if (!selectedUserId) return;
    try {
      await KanbanService.saveColumn(selectedUserId, {
        id: colId,
        title,
        color,
        position: colId ? columns.find(c => c.id === colId)!.position : columns.length
      });
      loadBoard(selectedUserId);
      toast.success('Coluna salva');
    } catch (err) {
      toast.error('Erro ao salvar coluna');
    }
  };

  // ── Drag & Drop ──

  const handleDragStart = (e: React.DragEvent, cardId: string, fromColId: string) => {
    draggingCard.current = { cardId, fromColId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    draggingCard.current = null;
    setDragOverColId(null);
    setDragOverCardId(null);
  };

  const handleDragOverCol = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColId(colId);
    setDragOverCardId(null);
  };

  const handleDragOverCard = (e: React.DragEvent, colId: string, cardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColId(colId);
    setDragOverCardId(cardId);
  };

  const handleDrop = async (e: React.DragEvent, toColId: string, toCardId?: string) => {
    e.preventDefault();
    if (!draggingCard.current || !selectedUserId) return;
    const { cardId, fromColId } = draggingCard.current;
    
    try {
      const toCol = columns.find(c => c.id === toColId);
      let newPos = toCol?.cards.length || 0;
      if (toCardId) {
        newPos = toCol?.cards.findIndex(c => c.id === toCardId) ?? newPos;
      }

      await KanbanService.updateCardPosition(cardId, toColId, newPos);
      loadBoard(selectedUserId);
    } catch (err) {
      toast.error('Erro ao mover card');
    }

    setDragOverColId(null);
    setDragOverCardId(null);
    draggingCard.current = null;
  };

  // ── Column Drag & Drop ──

  const handleColDragStart = (e: React.DragEvent, colId: string) => {
    // Only allow column drag if not dragging a card
    if (draggingCard.current) return;
    draggingCol.current = colId;
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handleColDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (draggingCol.current && draggingCol.current !== colId) {
      setDragOverColForReorder(colId);
    }
  };

  const handleColDrop = (e: React.DragEvent, toColId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingCol.current || draggingCol.current === toColId) {
      draggingCol.current = null;
      setDragOverColForReorder(null);
      return;
    }
    const fromColId = draggingCol.current;
    setColumns((prev) => {
      const fromIdx = prev.findIndex((c) => c.id === fromColId);
      const toIdx = prev.findIndex((c) => c.id === toColId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    draggingCol.current = null;
    setDragOverColForReorder(null);
  };

  const handleColDragEnd = () => {
    draggingCol.current = null;
    setDragOverColForReorder(null);
  };

  // ── Filtered Data ──

  const filteredColumns = columns.map((col) => ({
    ...col,
    cards: col.cards.filter(
      (card) =>
        card.title.toLowerCase().includes(search.toLowerCase()) ||
        (card.description || '').toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const openNewTask = (colId?: string) => {
    setTaskModal({
      isOpen: true,
      colId: colId || columns[0]?.id || '',
    });
  };

  const openEditTask = (colId: string, card: KanbanCard) => {
    setTaskModal({
      isOpen: true,
      colId,
      card,
    });
  };

  const openEditCol = (col: KanbanColumn) => {
    setColModal({
      isOpen: true,
      colId: col.id,
      initialData: { title: col.title, color: col.color },
    });
  };

  return (
    <div className="kb-root animate-fade-in">
      {/* Header MOVED TO PORTAL */}
      {portalNode && createPortal(
        <div className="flex w-full items-center justify-between gap-2 min-w-0">
          {/* Título — oculto no mobile, visível em sm+ */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <h1 className="text-sm font-bold text-foreground m-0 whitespace-nowrap">Kanban Board</h1>
            {isAdmin && (
              <select 
                className="ml-2 text-[11px] bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 outline-none ring-1 ring-slate-200 dark:ring-slate-700 min-w-[120px]"
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {allUsers.length === 0 && <option value="">Sem usuários</option>}
                <option value="all">🌐 Todos os Usuários</option>
                <optgroup label="Usuários Individuais">
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.email}</option>
                  ))}
                </optgroup>
              </select>
            )}
            {isAdmin && (
              <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="ml-2 flex items-center justify-center w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                title="Gerenciar Usuários"
              >
                <Shield size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Campo de busca: expande em sm+, ícone clicável em mobile */}
            <div className="kb-search-box h-8 hidden sm:flex">
              <Search size={13} />
              <input
                className="text-xs"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Busca mobile: só ícone */}
            <button
              className="sm:hidden kb-icon-btn h-8 w-8 flex items-center justify-center"
              title="Pesquisar"
              onClick={() => {
                const q = prompt('Pesquisar tarefa:');
                if (q !== null) setSearch(q);
              }}
            >
              <Search size={14} />
            </button>

            {/* View toggle removed as per request */}


            {/* Botão Nova Coluna — APENAS ADMIN */}
            {isAdmin && (
              <button
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 h-8"
                onClick={() => setColModal({ isOpen: true })}
                title="Nova Coluna (Admin)"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Coluna</span>
              </button>
            )}

            {/* Botão Nova Tarefa — ícone em mobile, texto em sm+ */}
            {(isAdmin || selectedUserId === profile?.id) && (
              <button
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm h-8"
                onClick={() => openNewTask()}
                title="Nova Tarefa"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Tarefa</span>
              </button>
            )}

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* User Info & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-bold text-foreground leading-none">{profile?.email}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{profile?.role}</span>
              </div>
              <button 
                onClick={() => { signOut(); navigate('/'); }}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>,
        portalNode
      )}

      {/* ── Board ── */}
      <div className="kb-board">
        {filteredColumns.map((col) => (
          <div
            key={col.id}
            className={cn(
              "kb-column",
              dragOverColId === col.id && !draggingCol.current ? 'drag-over' : '',
              dragOverColForReorder === col.id ? 'col-drag-over' : ''
            )}
            onDragOver={(e) => {
              if (draggingCol.current) {
                handleColDragOver(e, col.id);
              } else {
                handleDragOverCol(e, col.id);
              }
            }}
            onDrop={(e) => {
              if (draggingCol.current) {
                handleColDrop(e, col.id);
              } else {
                handleDrop(e, col.id);
              }
            }}
            onDragEnd={handleColDragEnd}
          >
            {/* Column header */}
            <div
              className="kb-col-header"
              draggable={isAdmin}
              onDragStart={(e) => isAdmin && handleColDragStart(e, col.id)}
              style={{ cursor: isAdmin ? 'grab' : 'default' }}
              title={isAdmin ? "Arraste para reordenar a coluna" : ""}
            >
              <div className="kb-col-title">
                {isAdmin && <GripHorizontal size={13} className="opacity-30 mr-1 flex-shrink-0" />}
                <span className="kb-col-dot" style={{ background: col.color }} />
                <span className="kb-col-name">{col.title}</span>
                <span className="kb-col-count">{col.cards.length}</span>
              </div>
              <div className="kb-col-actions">
                <button
                  className="kb-icon-btn"
                  title="Adicionar tarefa"
                  onClick={() => openNewTask(col.id)}
                >
                  <Plus size={14} />
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="kb-icon-btn"
                      title="Editar coluna"
                      onClick={() => openEditCol(col)}
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      className="kb-icon-btn kb-delete-btn"
                      title="Excluir coluna"
                      onClick={() => deleteColumn(col.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Drop zone + Cards */}
            <div className="kb-cards-list">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  className={`kb-card-wrapper ${dragOverCardId === card.id ? 'drag-over-card' : ''}`}
                  onDragOver={(e) => handleDragOverCard(e, col.id, card.id)}
                  onDrop={(e) => handleDrop(e, col.id, card.id)}
                >
                  <CardItem
                    card={card}
                    onDelete={() => deleteCard(col.id, card.id)}
                    onEdit={() => openEditTask(col.id, card)}
                    onDragStart={(e) => handleDragStart(e, card.id, col.id)}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              ))}
              {col.cards.length === 0 && (
                <div className="kb-empty-col">
                  <p>Arraste algo para cá</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredColumns.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <LayoutGrid size={32} className="opacity-20" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Nenhuma coluna encontrada</h3>
            <p className="text-sm opacity-60 mb-6">Crie sua primeira coluna para começar a organizar suas tarefas.</p>
            {isAdmin && (
              <button 
                onClick={() => setColModal({ isOpen: true })}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Plus size={18} />
                Nova Coluna
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {taskModal.isOpen && (
        <TaskModal
          columns={columns}
          defaultColId={taskModal.colId}
          initialData={taskModal.card}
          onClose={() => setTaskModal({ isOpen: false, colId: '' })}
          onSave={saveCard}
        />
      )}
      {colModal.isOpen && (
        <ColModal
          initialData={colModal.initialData}
          onClose={() => setColModal({ isOpen: false })}
          onAdd={(title, color) => saveColumn(title, color, colModal.colId)}
        />
      )}

      {isAdminModalOpen && (
        <AdminUsersModal 
          onClose={() => setIsAdminModalOpen(false)}
          onUsersUpdated={fetchUsers}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
