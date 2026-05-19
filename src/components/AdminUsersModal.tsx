import React, { useEffect, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { Trash2, Shield, User, Calendar, Edit2, X, Check, UserPlus, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserAvatar } from '@/lib/telegram-avatar';

interface AdminUsersModalProps {
  onClose: () => void;
  onUsersUpdated: () => void;
}

export const AdminUsersModal = ({ onClose, onUsersUpdated }: AdminUsersModalProps) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Form State
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTelegramToken, setFormTelegramToken] = useState('');
  const [formRole, setFormRole] = useState<'user' | 'admin'>('user');
  
  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar usuários');
    } else {
      const mapped = (data || []).map((u: any) => ({
        ...u,
        token: u.telegram_token || u.phone
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('profiles').delete().eq('id', deleteConfirmId);
    if (error) {
      toast.error('Erro ao excluir usuário');
    } else {
      toast.success('Usuário excluído');
      fetchUsers();
      onUsersUpdated();
      setDeleteConfirmId(null);
    }
  };

  const openEdit = (user: Profile) => {
    setTargetUser(user);
    setFormName(user.name || '');
    setFormPhone(user.phone || '');
    setFormTelegramToken(user.telegram_token || '');
    setFormRole(user.role);
    setFormMode('edit');
  };

  const openCreate = () => {
    setTargetUser(null);
    setFormName('');
    setFormPhone('');
    setFormTelegramToken('');
    setFormRole('user');
    setFormMode('create');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formTelegramToken.trim()) {
      toast.error('Nome, Telefone e Token Telegram são obrigatórios!');
      return;
    }

    const payload: any = {
      name: formName.trim(),
      phone: formPhone.trim(),
      telegram_token: formTelegramToken.trim(),
      role: formRole
    };

    setLoading(true);
    if (formMode === 'edit' && targetUser) {
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', targetUser.id);

      if (error) {
        toast.error('Erro ao atualizar usuário: ' + error.message);
      } else {
        toast.success('Usuário atualizado');
        setFormMode(null);
        fetchUsers();
        onUsersUpdated();
      }
    } else if (formMode === 'create') {
      const newId = generateUUID();
      const { error } = await supabase
        .from('profiles')
        .insert([{ id: newId, ...payload }]);

      if (error) {
        toast.error('Erro ao criar usuário: ' + error.message);
      } else {
        toast.success('Usuário criado com sucesso!');
        setFormMode(null);
        fetchUsers();
        onUsersUpdated();
      }
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.phone || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.telegram_token || '').toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="kb-modal-overlay" onClick={onClose}>
      <div className="kb-modal" style={{ maxWidth: 800, width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="m-0">Gestão de Usuários</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider m-0">Painel Administrativo</p>
            </div>
          </div>
          <button className="kb-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                className="kb-input pl-9" 
                placeholder="Buscar usuário por nome ou ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={openCreate}
              className="kb-btn-primary flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Novo Usuário</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">Função</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400">Carregando...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400">Nenhum usuário encontrado</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.id} className="text-sm">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar token={user.token} name={user.name} size={36} />
                          <div>
                            <div className="font-semibold text-slate-700 dark:text-slate-200">{user.name || 'Sem Nome'}</div>
                            {user.phone && <div className="text-xs text-slate-500">Telefone: {user.phone}</div>}
                            {user.telegram_token && <div className="text-[10px] text-slate-400 font-mono">Token: {user.telegram_token}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(user)} className="kb-icon-btn text-slate-400 hover:bg-slate-100"><Edit2 size={16} /></button>
                          <button onClick={() => setDeleteConfirmId(user.id)} className="kb-icon-btn text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal (Create/Edit) */}
      {formMode && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setFormMode(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold m-0">{formMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}</h3>
              <button onClick={() => setFormMode(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nome *</label>
                <input 
                  className="kb-input"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Token Telegram *</label>
                <input 
                  className="kb-input"
                  type="text"
                  required
                  value={formTelegramToken}
                  onChange={(e) => setFormTelegramToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 2146671843"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Telefone *</label>
                <input 
                  className="kb-input"
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ex: (21) 99999-9999"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Papel (Role)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormRole('user')}
                    className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
                      formRole === 'user' 
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-600' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Usuário Comum
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormRole('admin')}
                    className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
                      formRole === 'admin' 
                        ? 'bg-purple-50 border-purple-500 text-purple-600' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Administrador
                  </button>
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setFormMode(null)} className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-2xl bg-cyan-500 text-white text-sm font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20">
                  {formMode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Excluir Usuário?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Esta ação não pode ser desfeita. O usuário perderá o acesso e todos os seus dados serão removidos.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
