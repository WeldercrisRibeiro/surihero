import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Trash2,
  Tag,
  Calendar,
  GripVertical,
  GripHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string; // dot/badge color
  cards: KanbanCard[];
}

// ──────────────────────────── Helpers ────────────────────────────

const PRIORITY_STYLES: Record<Priority, { bg: string; color: string }> = {
  BAIXO: { bg: '#f3f4f6', color: '#6b7280' },
  MÉDIO: { bg: '#ffffff', color: '#4a54ff' }, // Snow Blue bg, Suri Blue text
  URGENTE: { bg: '#fee2e2', color: '#ef4444' }, // Light red bg, red text
  IMEDIATO: { bg: '#ffedd5', color: '#f97316' }, // Light orange bg, orange text
};

const COLUMN_COLORS = ['#9ca3af', '#4a54ff', '#f97316', '#00b914', '#2e1de8', '#ec4899'];

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
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    const saved = localStorage.getItem('suri-kanban-v2');
    if (saved) {
      const cols = JSON.parse(saved);
      // Garantir que PENDENTE venha antes de CONCLUÍDO
      const pIdx = cols.findIndex((c: any) => c.title === 'PENDENTE');
      const cIdx = cols.findIndex((c: any) => c.title === 'CONCLUÍDO');
      if (pIdx !== -1 && cIdx !== -1 && cIdx < pIdx) {
        const [pCol] = cols.splice(pIdx, 1);
        cols.splice(cIdx, 0, pCol);
      }
      return cols;
    }
    return [
      { id: '1', title: 'BACKLOG', color: '#9ca3af', cards: [] },
      { id: '2', title: 'A FAZER', color: '#9ca3af', cards: [] },
      { id: '3', title: 'FAZENDO', color: '#4a54ff', cards: [] },
      { id: '4', title: 'PENDENTE', color: '#9ca3af', cards: [] },
      { id: '5', title: 'CONCLUÍDO', color: '#00b914', cards: [] },
    ];
  });

  useEffect(() => {
    localStorage.setItem('suri-kanban-v2', JSON.stringify(columns));
  }, [columns]);

  const [search, setSearch] = useState('');
  const [taskModal, setTaskModal] = useState<{ isOpen: boolean; colId: string; card?: KanbanCard }>({
    isOpen: false,
    colId: '',
  });
  const [colModal, setColModal] = useState<{ isOpen: boolean; colId?: string; initialData?: { title: string; color: string } }>({
    isOpen: false,
  });

  const [defaultNewColId, setDefaultNewColId] = useState('');



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

  const saveCard = (colId: string, card: KanbanCard) => {
    setColumns((prev) => {
      // If it's an edit, we might have changed columns
      const originalCol = prev.find((c) => c.cards.some((k) => k.id === card.id));

      let updatedCols = prev;
      if (originalCol && originalCol.id !== colId) {
        // Remove from old col
        updatedCols = updatedCols.map((c) =>
          c.id === originalCol.id ? { ...c, cards: c.cards.filter((k) => k.id !== card.id) } : c
        );
      }

      return updatedCols.map((col) => {
        if (col.id === colId) {
          const cardExists = col.cards.some((k) => k.id === card.id);
          if (cardExists) {
            return { ...col, cards: col.cards.map((k) => (k.id === card.id ? card : k)) };
          } else {
            return { ...col, cards: [...col.cards, card] };
          }
        }
        return col;
      });
    });
  };

  const deleteCard = (colId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col
      )
    );
  };

  const deleteColumn = (colId: string) => {
    if (confirm('Deseja excluir esta coluna e todas as suas tarefas?')) {
      setColumns((prev) => prev.filter((c) => c.id !== colId));
    }
  };

  const saveColumn = (title: string, color: string, colId?: string) => {
    if (colId) {
      setColumns((prev) =>
        prev.map((c) => (c.id === colId ? { ...c, title, color } : c))
      );
    } else {
      setColumns((prev) => [...prev, { id: generateId(), title, color, cards: [] }]);
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

  const handleDrop = (e: React.DragEvent, toColId: string, toCardId?: string) => {
    e.preventDefault();
    if (!draggingCard.current) return;
    const { cardId, fromColId } = draggingCard.current;
    if (cardId === toCardId) return;

    setColumns((prev) => {
      // Find card
      const fromCol = prev.find((c) => c.id === fromColId);
      if (!fromCol) return prev;
      const card = fromCol.cards.find((c) => c.id === cardId);
      if (!card) return prev;

      // Remove from source
      const newCols = prev.map((col) =>
        col.id === fromColId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col
      );

      // Insert into destination
      return newCols.map((col) => {
        if (col.id !== toColId) return col;
        if (!toCardId) {
          return { ...col, cards: [...col.cards, card] };
        }
        const idx = col.cards.findIndex((c) => c.id === toCardId);
        const newCards = [...col.cards];
        newCards.splice(idx, 0, card);
        return { ...col, cards: newCards };
      });
    });

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



            {/* Botão Nova Coluna — ícone em mobile, texto em sm+ */}
            <button
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 h-8"
              onClick={() => setColModal({ isOpen: true })}
              title="Nova Coluna"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Coluna</span>
            </button>

            {/* Botão Nova Tarefa — ícone em mobile, texto em sm+ */}
            <button
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm h-8"
              onClick={() => openNewTask()}
              title="Nova Tarefa"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Tarefa</span>
            </button>
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
              draggable
              onDragStart={(e) => handleColDragStart(e, col.id)}
              style={{ cursor: 'grab' }}
              title="Arraste para reordenar a coluna"
            >
              <div className="kb-col-title">
                <GripHorizontal size={13} className="opacity-30 mr-1 flex-shrink-0" />
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
                  <Trash2 size={14} />
                </button>
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
                  <p>Arraste cards aqui</p>
                </div>
              )}
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default KanbanBoard;
