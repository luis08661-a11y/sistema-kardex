import { obtenerContextoLotes, obtenerLotes } from "@/actions/lotes.actions";
import { LotesModule } from "./lotes-module";

export default async function LotesPage() {
  const [lotes, contexto] = await Promise.all([obtenerLotes(), obtenerContextoLotes()]);
  return <LotesModule lotes={lotes} contexto={contexto} />;
}