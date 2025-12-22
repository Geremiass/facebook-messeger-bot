-- ============================================
-- TABELA DE AGENDAMENTOS - Clínica Dentária
-- ============================================

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    servico VARCHAR(100),
    mensagem TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_consulta TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pendente',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_email ON agendamentos(email);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_criacao ON agendamentos(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_consulta ON agendamentos(data_consulta);

-- Criar enum para status (opcional)
-- CREATE TYPE status_agendamento AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido');

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT via API (anon key)
CREATE POLICY "Permitir inserção de agendamentos" ON agendamentos
    FOR INSERT
    WITH CHECK (true);

-- Política para leitura apenas por utilizadores autenticados
CREATE POLICY "Leitura apenas autenticados" ON agendamentos
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política para atualização apenas por utilizadores autenticados
CREATE POLICY "Atualização apenas autenticados" ON agendamentos
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================
-- TABELA DE SERVIÇOS (opcional)
-- ============================================

CREATE TABLE IF NOT EXISTS servicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2),
    duracao_minutos INTEGER,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir serviços padrão
INSERT INTO servicos (nome, descricao, duracao_minutos) VALUES
    ('Consulta geral', 'Avaliação completa da saúde oral', 30),
    ('Branqueamento', 'Clareamento dental profissional', 60),
    ('Ortodontia', 'Avaliação e tratamento ortodôntico', 45),
    ('Implantes', 'Consulta para implantes dentários', 60),
    ('Limpeza', 'Higienização profissional', 45),
    ('Odontopediatria', 'Consulta para crianças', 30),
    ('Urgência', 'Atendimento de urgência', 30)
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEW para Dashboard (opcional)
-- ============================================

CREATE OR REPLACE VIEW dashboard_agendamentos AS
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE status = 'pendente') AS pendentes,
    COUNT(*) FILTER (WHERE status = 'confirmado') AS confirmados,
    COUNT(*) FILTER (WHERE status = 'concluido') AS concluidos,
    COUNT(*) FILTER (WHERE status = 'cancelado') AS cancelados,
    COUNT(*) FILTER (WHERE data_criacao >= NOW() - INTERVAL '7 days') AS ultimos_7_dias,
    COUNT(*) FILTER (WHERE data_criacao >= NOW() - INTERVAL '30 days') AS ultimos_30_dias
FROM agendamentos;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE agendamentos IS 'Tabela para guardar pedidos de agendamento da clínica dentária';
COMMENT ON COLUMN agendamentos.status IS 'Status: pendente, confirmado, cancelado, concluido';
