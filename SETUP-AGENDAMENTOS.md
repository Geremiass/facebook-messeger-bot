# Configuração do Sistema de Agendamentos

## Arquitetura

```
Site (Formulário) → n8n (Webhook) → Supabase (Base de dados)
                                  → Email (Confirmação)
```

---

## 1. Configurar Supabase

### 1.1 Criar projeto
1. Vai a [supabase.com](https://supabase.com)
2. Cria um novo projeto
3. Guarda a **URL** e a **anon key** (Settings → API)

### 1.2 Criar tabela
1. Vai ao **SQL Editor** no Supabase
2. Cola o conteúdo do ficheiro `supabase-schema.sql`
3. Clica **Run**

### 1.3 Verificar
- Vai a **Table Editor**
- Verifica se a tabela `agendamentos` foi criada

---

## 2. Configurar n8n

### 2.1 Importar workflow
1. Abre o n8n
2. Vai a **Workflows** → **Import from File**
3. Seleciona o ficheiro `n8n-workflow-agendamentos.json`

### 2.2 Configurar credenciais Supabase
1. Clica no nó **Supabase - Guardar Agendamento**
2. Clica em **Create New Credential**
3. Preenche:
   - **Host**: `https://SEU-PROJETO.supabase.co`
   - **Service Role Key**: (Settings → API → service_role key)

### 2.3 Configurar SMTP (opcional - para emails)
1. Clica no nó **Email - Confirmação Cliente**
2. Configura o SMTP:
   - Gmail: `smtp.gmail.com`, porta `587`
   - Outlook: `smtp.office365.com`, porta `587`

### 2.4 Ativar workflow
1. Clica em **Activate** (toggle no canto superior direito)
2. Copia o **Webhook URL** (clica no nó Webhook → URL Production)

---

## 3. Configurar Site

### 3.1 Atualizar URL do webhook
No ficheiro `site-completo.html`, procura esta linha:

```javascript
const N8N_WEBHOOK_URL = 'https://SEU-N8N.app.n8n.cloud/webhook/agendar-consulta';
```

Substitui pelo URL copiado do n8n.

---

## 4. Testar

1. Abre o site
2. Preenche o formulário de agendamento
3. Verifica:
   - ✓ Dados aparecem na tabela `agendamentos` do Supabase
   - ✓ Email de confirmação enviado (se configurado)
   - ✓ Notificação para a clínica (se configurado)

---

## Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único (auto) |
| nome | VARCHAR | Nome do paciente |
| email | VARCHAR | Email |
| telefone | VARCHAR | Telefone |
| servico | VARCHAR | Serviço pretendido |
| mensagem | TEXT | Mensagem adicional |
| data_criacao | TIMESTAMP | Data do pedido (auto) |
| data_consulta | TIMESTAMP | Data marcada (definir depois) |
| status | VARCHAR | pendente/confirmado/cancelado/concluido |
| notas | TEXT | Notas internas |

---

## Status do Agendamento

- **pendente** - Acabou de chegar
- **confirmado** - Clínica confirmou com o paciente
- **cancelado** - Cancelado pelo paciente ou clínica
- **concluido** - Consulta realizada

---

## Segurança

- A tabela tem **Row Level Security (RLS)** ativado
- Apenas INSERT é permitido sem autenticação
- SELECT/UPDATE requer autenticação (para o dashboard admin)

---

## Próximos Passos (opcional)

- [ ] Criar dashboard admin para gerir agendamentos
- [ ] Adicionar calendário para escolher data/hora
- [ ] Integrar com WhatsApp Business API
- [ ] Adicionar lembretes automáticos
