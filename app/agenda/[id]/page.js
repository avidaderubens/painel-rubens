import { notFound } from 'next/navigation';
import BlocoForm from '../BlocoForm';
import Erro from '../../../components/Erro';
import { getBlocos } from '../../../lib/agenda';
import { getProjetos } from '../../../lib/data';
import { hoje } from '../../../lib/date';
import { norm } from '../../../lib/treino';

export const dynamic = 'force-dynamic';

export default async function Editar({ params, searchParams }) {
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.d || '') ? searchParams.d : hoje();
  let blocos, projetos;
  try {
    [blocos, { rows: projetos }] = await Promise.all([getBlocos(), getProjetos()]);
  } catch (e) {
    return <main className="page"><Erro e={e} /></main>;
  }
  const bloco = blocos.find((b) => norm(b.id) === norm(params.id));
  if (!bloco) notFound();
  const lista = projetos.filter((p) => p.Nome).map((p) => ({ id: p.id, nome: p.Nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
  return <main className="page"><BlocoForm bloco={bloco} dia={dia} projetos={lista} outros={blocos} /></main>;
}
