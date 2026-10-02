# Orfina Web

Interface Angular da Orfina, aplicação de gestão financeira familiar.

## Funcionalidades atuais

- Login e logout com Google OAuth.
- Tema claro/escuro, sidebar responsiva e rotas operacionais.
- Gestão de contas, categorias, subcategorias e lançamentos.
- Filtros, paginação e histórico de lançamentos por conta.
- Convites e membros de grupos familiares.

## Execução local

```bash
npm install
npm start
```

Abra `http://localhost:4200`. A API de desenvolvimento é `http://localhost:3000/api`.

## Ambientes e validação

- Desenvolvimento: `src/environments/environment.ts`.
- Produção: `src/environments/environment.production.ts`, com API relativa `/api`.
- `window.ORFINA_API_URL` pode substituir a URL em implantações especiais.

```bash
npm run build
```
