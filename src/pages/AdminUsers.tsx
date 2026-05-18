import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, type Profile } from '@/lib/supabase';
import { Trash2, UserPlus, Shield, User, Mail, Calendar, Edit2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const AdminUsers = () => {
  const { isAdmin, profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar usuários');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    if (id === currentProfile?.id) {
      toast.error('Você não pode excluir a si mesmo');
      return;
    }
    if (!confirm('Deseja realmente excluir este usuário?')) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir usuário');
    } else {
      toast.success('Usuário excluído');
      fetchUsers();
    }
  };

  const startEdit = (user: Profile) => {
    setEditingId(user.id);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ email: editEmail, role: editRole })
      .eq('id', editingId);

    if (error) {
      toast.error('Erro ao atualizar usuário');
    } else {
      toast.success('Usuário atualizado');
      setEditingId(null);
      fetchUsers();
    }
  };

  const createUser = async () => {
    const email = prompt('Email do novo usuário:');
    if (!email) return;
    const role = confirm('Será um administrador?') ? 'admin' : 'user';

    const { error } = await supabase.from('profiles').insert([{ email, role }]);
    if (error) {
      toast.error('Erro ao criar usuário');
    } else {
      toast.success('Usuário criado');
      fetchUsers();
    }
  };

  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciamento de Usuários</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Controle de acesso e permissões do sistema</p>
        </div>
        <button 
          onClick={createUser}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20"
        >
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-bottom border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Criado em</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Carregando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum usuário encontrado</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    {editingId === user.id ? (
                      <input 
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm w-full"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{user.email}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{user.id}</div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingId === user.id ? (
                    <select 
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {editingId === user.id ? (
                      <>
                        <button onClick={saveEdit} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"><Check size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"><X size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(user)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => deleteUser(user.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-4 rounded-xl flex items-start gap-3">
        <Shield className="text-blue-500 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Dica do Administrador</h4>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            Como administrador, você pode alternar entre os quadros de diferentes usuários diretamente na página do Kanban usando o seletor no topo da página.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
