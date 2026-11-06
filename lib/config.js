// IDs das bases (data sources) do Notion usadas pelo app.
export const DS = {
  tarefas: '9d07e382-cb79-4bcf-ade9-f96b706fa08f',
  projetos: 'e2336d7b-c765-40e8-906f-c6539eb382ea',
  indicadores: '9957b3c8-b045-4d89-8aad-9e13d4fb36f3',
  notas: 'd6f2a573-887e-4d78-a388-fa37f82f090d',
  agenda: 'ab891413-e973-421b-980a-56b9e5e72bad',
  plano: '4f6e4081-8527-4bea-9c55-44d8303e4c6e',
  protocolos: '08c4e6c0-6dcd-43a3-9166-6f43a043c102',
  aplicacoes: 'c14e5e99-8941-40b3-85ee-cba3c5ce137f',
  medidas: '6195cab7-14a2-4113-85e0-cda510452fe5',
  exercicios: 'e6f528ea-b82f-471e-8b5b-f9519acd958e',
  treinos: 'd65ebac6-db76-42b1-8bc5-a38d4d3326c6',
  itensTreino: '83a69b1e-3a6b-4d95-9b45-fea88de2e252',
  series: 'b01329bb-e845-4ddf-aeb0-8d3d9e5c5b06',
  corridas: '9878acd6-cc20-49bb-b99b-e4c04ecfc3ef',
  itensDieta: '064b3a7c-0f42-49bd-b1c4-2ad3b384aca0',
  trocas: 'f87976bf-d21c-44c7-9f85-fc22f257c98d',
  metasDieta: '5b0cdb3a-6d9c-4762-a9ee-36c7ab5d43a1',
  bolt: 'ef5ff28f-23c7-45c8-bb26-e165a42b3e6b',
  agendaBlocos: '939d9b03-423c-400c-b681-8b5c294b1581'
};

// Dieta 90 dias e ciclo de treino começaram juntos.
export const INICIO_PROTOCOLO = '2026-11-02';
export const SEMANAS_PROTOCOLO = 13;
// Tipo de dia padrão da dieta por dia da semana (0 = domingo). Pode ser trocado no app.
export const TIPO_PADRAO = ['B', 'A', 'A', 'A', 'A', 'A', 'B'];

export const META_SCORE = 80; // % mínimo do score do dia
export const TZ = 'America/Sao_Paulo';
export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DIAS_LONGO = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
// Campos de treino/hábito na base Indicadores de Saúde.
export const TREINOS = ['Jiu-jitsu', 'Academia', 'Corrida', 'Respiração'];
