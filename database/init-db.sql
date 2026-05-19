-- Habilitar a extensão UUID se disponível
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para Roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Tabela de Perfis (complementa o Auth do Supabase ou gerencia localmente)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    telegram_token TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sessões de Login
CREATE TABLE IF NOT EXISTS login_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
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

-- Tabela de Documentos (Docs)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    author_role TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    banner_from TEXT,
    banner_to TEXT,
    banner_title TEXT,
    banner_subtitle TEXT
);

-- RLS (Row Level Security) - Simulado para Postgres puro, mas essencial no Supabase
-- No Supabase, usaríamos:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Qualquer um pode ler perfis públicos" ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Usuários modificam seu próprio perfil" ON profiles FOR UPDATE USING (true);
-- CREATE POLICY "Qualquer um pode criar perfis" ON profiles FOR INSERT WITH CHECK (true);


-- Inserir usuário Admin inicial para testes
INSERT INTO profiles (id, name, phone, role) VALUES ('00000000-0000-0000-0000-000000000001', 'Admin Suri', '11999999999', 'admin') ON CONFLICT (phone) DO NOTHING;
INSERT INTO profiles (id, name, phone, role) VALUES ('00000000-0000-0000-0000-000000000002', 'Usuário Suri', '11888888888', 'user') ON CONFLICT (phone) DO NOTHING;

-- Trigger para criar perfil automaticamente no Supabase Auth (Opcional, para produção)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, role)
--   VALUES (new.id, 'user');
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
