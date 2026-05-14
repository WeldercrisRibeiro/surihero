import { supabase, type KanbanColumnDB, type KanbanCardDB } from './supabase';

export const KanbanService = {
  async getBoard(userId: string) {
    // Fetch columns
    const { data: cols, error: colError } = await supabase
      .from('kanban_columns')
      .select('*')
      .eq('user_id', userId)
      .order('position');

    if (colError) throw colError;

    // Fetch cards
    const { data: cards, error: cardError } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('user_id', userId)
      .order('position');

    if (cardError) throw cardError;

    // Transform to the structure used in the component
    return cols.map(col => ({
      id: col.id,
      title: col.title,
      color: col.color,
      cards: cards
        .filter(card => card.column_id === col.id)
        .map(card => ({
          id: card.id,
          title: card.title,
          description: card.description || undefined,
          priority: card.priority,
          tags: card.tags,
          dueDate: card.due_date || undefined,
        }))
    }));
  },

  async saveColumn(userId: string, column: { id?: string; title: string; color: string; position: number }) {
    if (column.id && !column.id.includes('-')) {
        // Handle mock/temporary IDs if necessary, or just insert
    }

    const payload = {
        user_id: userId,
        title: column.title,
        color: column.color,
        position: column.position
    };

    if (column.id && column.id.length > 10) { // Simple check for UUID vs temporary short ID
        const { data, error } = await supabase
            .from('kanban_columns')
            .update(payload)
            .eq('id', column.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from('kanban_columns')
            .insert([payload])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
  },

  async deleteColumn(columnId: string) {
    const { error } = await supabase
      .from('kanban_columns')
      .delete()
      .eq('id', columnId);
    if (error) throw error;
  },

  async saveCard(userId: string, columnId: string, card: { id?: string; title: string; description?: string; priority: string; tags?: any[]; dueDate?: string; position: number }) {
    const payload = {
        user_id: userId,
        column_id: columnId,
        title: card.title,
        description: card.description,
        priority: card.priority,
        tags: card.tags || [],
        due_date: card.dueDate || null,
        position: card.position
    };

    if (card.id && card.id.length > 10) {
        const { data, error } = await supabase
            .from('kanban_cards')
            .update(payload)
            .eq('id', card.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from('kanban_cards')
            .insert([payload])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
  },

  async deleteCard(cardId: string) {
    const { error } = await supabase
      .from('kanban_cards')
      .delete()
      .eq('id', cardId);
    if (error) throw error;
  },

  async updateCardPosition(cardId: string, columnId: string, position: number) {
    const { error } = await supabase
        .from('kanban_cards')
        .update({ column_id: columnId, position })
        .eq('id', cardId);
    if (error) throw error;
  }
};
