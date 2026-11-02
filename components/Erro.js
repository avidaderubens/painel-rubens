export default function Erro({ e }) {
  const msg = String(e && e.message ? e.message : e);
  const dica = msg.includes('NOTION_TOKEN')
    ? 'Falta a chave do Notion nas variáveis da Vercel.'
    : msg.includes('404') || msg.includes('object_not_found')
      ? 'O Notion não encontrou a base. Confira se a conexão "Painel Rubens" está liberada no QG.'
      : msg.includes('401')
        ? 'A chave do Notion está errada ou foi revogada.'
        : 'Não consegui falar com o Notion agora.';
  return (
    <div className="error" role="alert">
      <b>{dica}</b>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8, wordBreak: 'break-word' }}>{msg.slice(0, 300)}</div>
    </div>
  );
}
