# Painel Rubens

App pessoal (PWA) de saúde, tarefas e notas. Lê e grava no Notion (QG – Ecossistema Rubens).

## Telas
- **Painel** (`/`): treinos da semana, score, pressão, sono, tarefas de hoje, tendência e performance.
- **Tarefas** (`/tarefas`): abas Hoje, Semana, Recorrentes e Todas; detalhe e nova tarefa.
- **Registrar o dia** (`/registrar`): treinos, pressão 3x, peso, sono, protocolos e observações.
- **Saúde** (`/saude`): Dieta (check por refeição), Protocolos (aplicações) e Corpo (medidas).
- **Notas** (`/notas`): captura rápida para a base Notas rápidas.
- **Perfil** (`/perfil`): dias de treino, metas, sair.

## Variáveis (Vercel → Settings → Environment Variables)
| Nome | O que é |
| --- | --- |
| `NOTION_TOKEN` | Chave da conexão "Painel Rubens" no Notion |
| `APP_PASSWORD` | Senha para entrar no app |
| `AUTH_SECRET` | Texto aleatório longo (protege o login) |

## Tarefas recorrentes
Ao concluir uma tarefa Diária, Semanal ou Mensal, o app não marca "Feito": ele move a **Data** para a próxima vez
(amanhã, +7 dias ou +1 mês). Ela some de Hoje e volta sozinha na data certa.

## Rodar local
```
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```
