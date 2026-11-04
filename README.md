# 🐦 Twitter Clone (Fullstack)

Um clone completo do Twitter desenvolvido como aplicação *fullstack*, apresentando uma API robusta em Django REST Framework e uma interface moderna e tipada em React com TypeScript e Vite.

---

## 🚀 Tecnologias Utilizadas

### **Backend (API)**
* **Python 3.14** & **Django 6.0** / **Django REST Framework (DRF)**
* **Autenticação:** JSON Web Tokens (`djangorestframework-simplejwt`)
* **Banco de Dados:** PostgreSQL (Produção/Render) / SQLite (Desenvolvimento local)
* **Armazenamento de Mídia:** **Cloudinary** (para gestão persistente de fotos de perfil e uploads)
* **Gerenciamento de Estáticos:** WhiteNoise
* **Outros:** `dj-database-url`, `django-cors-headers`

### **Frontend **
* **React** com **TypeScript**
* **Bundler:** **Vite**
* **Estilização:** Styled Components
* **Comunicação HTTP:** Axios

---

## ✨ Funcionalidades Principais

* **Autenticação Segura:** Cadastro, login, renovação de tokens (JWT) e recuperação de senha.
* **Gerenciamento de Perfil:** Atualização de dados de usuário e upload de imagem de perfil integrada com a nuvem (Cloudinary).
* **Feed de Tweets:** Criação, visualização, exclusão, curtidas, *retweets* e tweets citados.
* **Interatividade Avançada:** Seção de comentários em árvore, modais de usuários e seções dinâmicas.
* **Notificações & Mensagens:** Contadores em tempo real e abas dedicadas.

---

## 📁 Estrutura do Projeto

```text
Twitter/
├── backend/                # Servidor Django (API)
│   ├── api/                # Modelos, views, serializers e rotas da API
│   ├── setup/              # Configurações globais do Django (settings.py, urls.py)
│   ├── requirements.txt    # Dependências Python de produção
│   └── manage.py
├── src/                    # Código-fonte Frontend (React + TS)
│   ├── components/         # Componentes reutilizáveis (Sidebar, Feed, Tweet, Modais)
│   ├── pages/              # Páginas da aplicação (Auth, ProfilePage, Messages, Settings, etc.)
│   ├── hooks/              # Custom hooks (Autenticação, interações de tweets)
│   ├── services/           # Configuração do Axios e serviços de API
│   ├── styles/             # Temas globais e estilos (GlobalStyles, themes, Icons)
│   ├── App.tsx
│   └── main.tsx
├── public/                 # Recursos públicos e favicon
└── README.md

# 🛠️ Clonar o Repositório

git clone [https://github.com/Jeferson7770/Clone-Twitter.git]

cd Clone-Twitter


# Entrar no diretório da aplicação frontend
cd twitter

# Instalar as dependências
yarn install
# (ou npm install)

# Iniciar o servidor de desenvolvimento
yarn dev
# (ou npm run dev)

# Entrar no diretório do backend
cd backend

# Criar e ativar o ambiente virtual
python -m venv venv

# No Windows:
venv\Scripts\activate
# No macOS/Linux:
source venv/bin/activate

# Instalar as dependências
pip install -r requirements.txt

# Executar as migrações do banco de dados
python manage.py migrate

# Iniciar o servidor de desenvolvimento
python manage.py runserver

