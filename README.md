# Bot de Agendamento de Consultas - Facebook Messenger

Bot do Facebook Messenger para agendamento de consultas médicas em clínicas. Sistema completo com workflow conversacional, gerenciamento de estado e armazenamento de dados.

## Funcionalidades

- Agendamento de consultas através do Messenger
- Workflow conversacional intuitivo
- Seleção de especialidades médicas
- Escolha de data e horário
- Confirmação de agendamento
- Visualização de consultas agendadas
- Armazenamento persistente de dados
- Sistema de estado para cada usuário

## Estrutura do Projeto

```
facebook-messeger-bot/
├── src/
│   ├── index.js          # Servidor Express e webhook
│   ├── messenger.js      # API do Facebook Messenger
│   ├── workflow.js       # Lógica do workflow de agendamento
│   ├── stateManager.js   # Gerenciamento de estado dos usuários
│   └── storage.js        # Armazenamento de agendamentos
├── data/
│   └── appointments.json # Banco de dados de agendamentos
├── .env                  # Variáveis de ambiente (não versionado)
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json
└── README.md
```

## Pré-requisitos

- Node.js (v14 ou superior)
- Conta do Facebook Developer
- Página do Facebook
- ngrok ou servidor com HTTPS (para desenvolvimento)

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd facebook-messeger-bot
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais:
```env
PAGE_ACCESS_TOKEN=seu_page_access_token
VERIFY_TOKEN=seu_verify_token_personalizado
PORT=3000
CLINIC_NAME=Nome da Sua Clínica
CLINIC_HOURS=08:00-18:00
AVAILABLE_SPECIALTIES=Clínico Geral,Pediatria,Cardiologia,Dermatologia
```

## Configuração do Facebook Developer

### 1. Criar App no Facebook Developer

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em "Meus Apps" > "Criar App"
3. Escolha "Negócios" como tipo de app
4. Preencha as informações do app
5. Adicione o produto "Messenger"

### 2. Configurar Página do Facebook

1. Crie uma página no Facebook (se ainda não tiver)
2. No painel do app, vá em "Messenger" > "Configurações"
3. Em "Tokens de Acesso", selecione sua página
4. Copie o "Token de Acesso da Página" e adicione ao `.env` como `PAGE_ACCESS_TOKEN`

### 3. Configurar Webhook

1. Inicie o servidor localmente:
```bash
npm start
```

2. Use o ngrok para criar um túnel HTTPS:
```bash
ngrok http 3000
```

3. No Facebook Developer, em "Messenger" > "Configurações" > "Webhooks":
   - URL de Callback: `https://seu-dominio.ngrok.io/webhook`
   - Token de Verificação: O mesmo que você definiu em `VERIFY_TOKEN` no `.env`
   - Campos de assinatura: Marque `messages` e `messaging_postbacks`
   - Clique em "Verificar e Salvar"

4. Subscreva a página ao webhook

## Uso

### Iniciar o servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (com nodemon)
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Testar o Bot

1. Acesse sua página do Facebook
2. Clique em "Enviar Mensagem"
3. Digite "oi" ou "agendar" para iniciar

### Fluxo de Agendamento

1. **Menu Inicial**: Usuário escolhe "Agendar Consulta"
2. **Nome**: Bot solicita o nome do paciente
3. **Telefone**: Bot solicita o telefone com DDD
4. **Especialidade**: Bot mostra opções de especialidades
5. **Data**: Bot mostra datas disponíveis (próximos 5 dias úteis)
6. **Horário**: Bot mostra horários disponíveis
7. **Confirmação**: Bot mostra resumo e solicita confirmação
8. **Conclusão**: Agendamento salvo e confirmado

## Comandos do Bot

- `oi`, `olá`, `menu` - Mostra o menu principal
- `agendar` - Inicia o processo de agendamento
- Durante o fluxo, use os botões e quick replies para navegar

## Estrutura de Dados

### Agendamento

```json
{
  "id": "unique-id",
  "userId": "facebook-user-id",
  "name": "Nome do Paciente",
  "phone": "11987654321",
  "specialty": "Cardiologia",
  "date": "15/12",
  "time": "14:00",
  "status": "confirmed",
  "createdAt": "2025-12-17T10:00:00.000Z"
}
```

## API do Storage

```javascript
const storage = require('./storage');

// Salvar novo agendamento
storage.saveAppointment(appointment);

// Obter agendamentos de um usuário
storage.getUserAppointments(userId);

// Obter todos os agendamentos
storage.getAllAppointments();

// Atualizar agendamento
storage.updateAppointment(id, updates);

// Cancelar agendamento
storage.cancelAppointmentById(id);

// Limpar agendamentos antigos
storage.cleanOldAppointments();
```

## Personalização

### Adicionar Especialidades

Edite a variável `AVAILABLE_SPECIALTIES` no arquivo `.env`:

```env
AVAILABLE_SPECIALTIES=Clínico Geral,Pediatria,Cardiologia,Ortopedia,Ginecologia
```

### Alterar Horários Disponíveis

Edite a função `askTime()` em `src/workflow.js`:

```javascript
const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
```

### Alterar Dias Disponíveis

Edite a função `getAvailableDates()` em `src/workflow.js` para modificar quantos dias mostrar ou incluir fins de semana.

## Segurança

- Nunca commite o arquivo `.env` (já está no `.gitignore`)
- Use HTTPS em produção
- Valide e sanitize todas as entradas do usuário
- Implemente rate limiting para evitar spam
- Adicione autenticação para endpoints administrativos

## Deploy em Produção

### Opções de Hospedagem

1. **Heroku**
```bash
heroku create nome-do-app
git push heroku main
heroku config:set PAGE_ACCESS_TOKEN=seu_token
heroku config:set VERIFY_TOKEN=seu_verify_token
```

2. **DigitalOcean / AWS / Google Cloud**
- Configure um servidor Node.js
- Instale PM2 para gerenciamento de processos
- Configure Nginx como proxy reverso
- Configure SSL com Let's Encrypt

3. **Vercel / Railway / Render**
- Conecte seu repositório Git
- Configure as variáveis de ambiente
- Deploy automático

## Melhorias Futuras

- [ ] Integração com banco de dados (MongoDB, PostgreSQL)
- [ ] Sistema de lembretes automáticos
- [ ] Cancelamento de consultas pelo bot
- [ ] Reagendamento de consultas
- [ ] Integração com calendário do Google
- [ ] Notificações por email
- [ ] Dashboard administrativo
- [ ] Sistema de filas e prioridades
- [ ] Avaliação pós-consulta
- [ ] Histórico médico do paciente

## Troubleshooting

### Webhook não está recebendo mensagens

1. Verifique se o token de verificação está correto
2. Confirme que a URL do webhook está acessível publicamente
3. Verifique se subscreveu a página ao webhook
4. Confira os logs do servidor

### Erro ao enviar mensagens

1. Verifique se o `PAGE_ACCESS_TOKEN` está correto
2. Confirme que a página está aprovada para enviar mensagens
3. Verifique os limites de taxa da API do Facebook

### Estado do usuário não está sendo salvo

1. O estado é salvo em memória, reiniciar o servidor limpa todos os estados
2. Considere usar Redis ou banco de dados para persistência

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Consulte a [documentação do Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform)

## Licença

MIT

## Autor

Criado com dedicação para facilitar o agendamento de consultas médicas.
