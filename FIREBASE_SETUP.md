# Configuração do Firebase Authentication

Este documento explica como configurar o Firebase Authentication para o projeto Orkut.

## Passo 1: Criar um projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar um novo projeto

## Passo 2: Configurar a autenticação

1. No console do Firebase, navegue até "Authentication"
2. Clique em "Começar"
3. Habilite os provedores de login desejados:
   - Email/Senha
   - Google
   - Outros, se necessário

## Passo 3: Registrar o aplicativo web

1. Na página inicial do projeto no Firebase, clique no ícone da web (</>) para adicionar um app
2. Digite um nome para o app e registre-o
3. Guarde as informações de configuração que serão mostradas

## Passo 4: Configurar as variáveis de ambiente na Vercel

1. No painel do projeto na Vercel, navegue até "Settings" > "Environment Variables"
2. Adicione as seguintes variáveis de ambiente com os valores que você obteve do Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=seu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
```

## Passo 5: Configurar desenvolvimento local

Para desenvolvimento local, crie um arquivo `.env.local` na raiz do projeto com as mesmas variáveis de ambiente:

1. Copie o arquivo `.env.local.example` para `.env.local`
2. Preencha os valores com as credenciais do seu projeto Firebase

**IMPORTANTE:** Nunca cometa o arquivo `.env.local` no controle de versão. Ele já está incluído no `.gitignore` para evitar isso. 