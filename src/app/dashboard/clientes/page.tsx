import { obtenerClientes } from "@/actions/cliente.actions";
import { ClientesModule } from "./clientes-module";

export default async function ClientesPage() {
  const resultadoInicial = await obtenerClientes({ page: 1, pageSize: 10 });

  return <ClientesModule resultadoInicial={resultadoInicial} />;
}