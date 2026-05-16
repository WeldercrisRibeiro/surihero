-- Habilitar a extensão UUID se disponível
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para Roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Tabela de Perfis (complementa o Auth do Supabase ou gerencia localmente)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Colunas do Kanban
CREATE TABLE IF NOT EXISTS kanban_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT DEFAULT '#9ca3af',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cards do Kanban
CREATE TABLE IF NOT EXISTS kanban_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    column_id UUID REFERENCES kanban_columns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'MÉDIO',
    due_date DATE,
    position INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) - Simulado para Postgres puro, mas essencial no Supabase
-- No Supabase, usaríamos:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Inserir usuário Admin inicial para testes
INSERT INTO profiles (id, email, role) VALUES ('00000000-0000-0000-0000-000000000001', 'admin@suri.com', 'admin') ON CONFLICT (email) DO NOTHING;
INSERT INTO profiles (id, email, role) VALUES ('00000000-0000-0000-0000-000000000002', 'user@suri.com', 'user') ON CONFLICT (email) DO NOTHING;

-- Trigger para criar perfil automaticamente no Supabase Auth (Opcional, para produção)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, role)
--   VALUES (new.id, new.email, 'user');
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
