# Lumina API - Sistema de Autenticação

Sistema de autenticação seguro e pronto para produção construído com Node.js, Express e TypeScript. Implementa autenticação baseada em JWT com hash de senhas bcrypt, validação completa de entrada, limitação de taxa, internacionalização e cobertura total de testes.

![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-%23F7DF1E.svg?style=for-the-badge&logo=jsonwebtokens&logoColor=black)
![Jest](https://img.shields.io/badge/jest-%23C21325.svg?style=for-the-badge&logo=jest&logoColor=white)
![TypeORM](https://img.shields.io/badge/typeorm-%2300BFFF.svg?style=for-the-badge&logo=typeorm&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-%23FF5733.svg?style=for-the-badge&logo=internationalization&logoColor=white)
![Github Actions](https://img.shields.io/badge/github%20actions-%23181717.svg?style=for-the-badge&logo=githubactions&logoColor=white)

---
## ✨ Principais Funcionalidades

### 🔐 Autenticação e Segurança
- **Registro de Usuários**: Criação de contas com validação de email, senha e nome de usuário
- **Login Seguro**: Autenticação com email e senha usando bcrypt (10 salt rounds)
- **Sistema JWT**: Tokens de acesso (15 min) e refresh (7 dias) com rotação automática
- **Refresh Token**: Renovação automática de tokens sem necessidade de novo login
- **Logout**: Invalidação de sessão no cliente
- **Perfil de Usuário**: Acesso a informações do usuário autenticado

### 🌍 Internacionalização (i18n)
- **Suporte Multi-idioma**: Sistema de internacionalização completo
  - Português (pt)
  - Inglês (en)
  - Espanhol (es)
- **Mensagens Customizadas**: Todas as respostas traduzidas (erros, sucessos, validações)

### 💾 Banco de Dados
- **TypeORM**: ORM robusto para PostgreSQL
- **Entidades Estruturadas**: Modelo User com timestamps automáticos
- **Sistema de Roles**: Suporte a múltiplos papéis de usuário (extensível)
- **Migrations**: Sincronização automática em desenvolvimento

### 🐳 DevOps e Infraestrutura
- **Docker Compose**: Ambiente completo containerizado
  - PostgreSQL: Banco de dados principal (porta 5432)
  - API Node.js: Aplicação principal (porta 3000)
- **Health Checks**: Monitoramento de saúde dos serviços
- **Hot Reload**: Desenvolvimento com nodemon e ts-node

### 🧪 Testes
- **Jest**: Framework de testes completo
- **Testes Unitários**: Cobertura dos serviços de autenticação
- **Testes de Integração**: Validação end-to-end das rotas
- **Supertest**: Testes de API HTTP
- **Watch Mode**: Desenvolvimento com testes contínuos

## 📋 Requisitos

- Node.js 22+
- npm 11+
- PostgreSQL 14+ (ou Docker)
- Redis (opcional, via Docker)

## 🛠️ Instalação

### 1. Clonar o Repositório

```bash
git clone <repository-url>
cd Lumina-API
```

### 2. Instalar Dependências

```bash
npm install
```

**Variáveis de ambiente importantes:**

```env
# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=sua-chave-secreta-mude-em-producao
JWT_ACCESS_EXPIRY=900000        # 15 minutos em ms
JWT_REFRESH_EXPIRY=604800000    # 7 dias em ms

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lumina

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000     # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Redis (opcional)
REDIS_PORT=6379
REDIS_VERSION=7-alpine

# pgAdmin
PGADMIN_PORT=5050
PGADMIN_DEFAULT_EMAIL=admin@lumina.com
PGADMIN_DEFAULT_PASSWORD=admin
```

Para produção, gere uma chave JWT segura:
```bash
openssl rand -base64 32
```

### 4. Iniciar com Docker Compose (Recomendado)

```bash

docker-compose up -d


docker-compose logs -f


docker-compose down
```

Isso iniciará:
- ✅ PostgreSQL na porta 5432
- ✅ Redis na porta 6379
- ✅ pgAdmin na porta 5050
- ✅ API Node.js na porta 3000

Acesse:
- **API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050

### 5. Instalação Manual (Sem Docker)

#### PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Criar banco de dados:**
```sql
CREATE DATABASE lumina;
CREATE USER lumina_user WITH PASSWORD 'lumina_password';
GRANT ALL PRIVILEGES ON DATABASE lumina TO lumina_user;
```

#### Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
Lumina-API/
├── src/
│   ├── @types/              # Definições TypeScript
│   │   ├── auth/
│   │   │   └── Auth.ts      # Interfaces de autenticação
│   │   ├── config/
│   │   │   └── Configuration.ts
│   │   └── user/
│   │       └── User.ts
│   ├── config/              # Configurações
│   │   ├── config.ts        # Variáveis de ambiente
│   │   └── database.ts      # Configuração TypeORM
│   ├── controllers/         # Controladores HTTP
│   │   ├── AuthController.ts
│   │   └── index.ts
│   ├── middlewares/         # Middlewares Express
│   │   ├── AuthMiddleware.ts    # JWT verification
│   │   ├── ErrorHandler.ts      # Error handling global
│   │   ├── RateLimiter.ts       # Rate limiting
│   │   └── index.ts
│   ├── models/              # Modelos de dados
│   │   ├── User.ts          # Lógica de negócio
│   │   ├── UserEntity.ts    # Entidade TypeORM
│   │   └── index.ts
│   ├── routes/              # Rotas da API
│   │   ├── AuthRoutes.ts
│   │   └── index.ts
│   ├── services/            # Serviços de negócio
│   │   └── AuthService.ts   # Lógica de autenticação
│   ├── utils/               # Utilitários
│   │   ├── tokenUtils.ts    # Operações JWT
│   │   └── validation.ts    # Validação com Joi
│   ├── i18n/                # Internacionalização
│   │   └── i18n.ts
│   ├── app.ts               # Configuração Express
│   └── server.ts            # Entry point
├── locales/                 # Traduções
│   ├── pt.json              # Português
│   ├── en.json              # Inglês
│   └── es.json              # Espanhol
├── tests/                   # Testes
│   ├── AuthService.test.ts  # Testes unitários
│   └── AuthRoutes.test.ts   # Testes de integração
├── docker-compose.yml       # Configuração Docker
├── Dockerfile               # Imagem de produção
├── jest.config.ts           # Configuração Jest
├── tsconfig.json            # Configuração TypeScript
└── package.json             # Dependências
```

## 📦 Build e Deploy

### Build para Produção

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor de produção
npm start
```

### Docker Production

```bash
# Build da imagem
docker build -t lumina-api:latest .

# Executar container
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=sua-chave-secreta \
  -e DB_HOST=seu-host \
  -e DB_PASSWORD=sua-senha \
  --name lumina-api \
  lumina-api:latest
```

## 🌐 Internacionalização

### Idiomas Suportados
- 🇧🇷 Português (pt)
- 🇺🇸 Inglês (en) - Padrão
- 🇪🇸 Espanhol (es)

**Stack**: Node.js • Express • TypeScript • JWT • PostgreSQL • TypeORM • Docker
