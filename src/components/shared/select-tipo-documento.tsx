import { TIPO_DOCUMENTO_LABEL, type TipoDocumento } from "@/components/ventas/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampoFormulario } from "@/components/shared/modulo-cabecera";

type Labels = Record<TipoDocumento, string>;

type Props = {
  label?: string;
  value: TipoDocumento;
  onValueChange: (value: TipoDocumento) => void;
  labels?: Labels;
};

export function SelectTipoDocumento({
  label = "Tipo documento",
  value,
  onValueChange,
  labels = TIPO_DOCUMENTO_LABEL,
}: Props) {
  return (
    <CampoFormulario label={label}>
      <Select value={value} onValueChange={(v) => onValueChange((v ?? "DNI") as TipoDocumento)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(labels) as TipoDocumento[]).map((t) => (
            <SelectItem key={t} value={t}>
              {labels[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CampoFormulario>
  );
}
