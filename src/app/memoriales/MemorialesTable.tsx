import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { Memorial } from "./page";

interface Props {
  memoriales: Memorial[];
  abrirModal: (memorial: Memorial) => void;
  eliminarMemorial: (id: string) => void;
  reenviarWhatsapp: (celular: string, imagenUrl: string) => void;
}

export default function MemorialesTable({ memoriales, abrirModal, eliminarMemorial, reenviarWhatsapp }: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow className="bg-gray-200">
          <TableCell className="font-semibold">Nombre</TableCell>
          <TableCell className="font-semibold">Celular</TableCell>
          <TableCell className="font-semibold">Vista</TableCell>
          <TableCell className="font-semibold">Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {memoriales.length > 0 ? (
          memoriales.map((memorial) => (
            <TableRow key={memorial.id}>
              <TableCell>{memorial.nombre}</TableCell>
              <TableCell>{memorial.celular}</TableCell>
              <TableCell>
                <IconButton onClick={() => abrirModal(memorial)}>
                  <Visibility />
                </IconButton>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => eliminarMemorial(memorial.id)}
                  >
                    Eliminar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={() => reenviarWhatsapp(memorial.celular, memorial.imagen_url)}
                  >
                    Reenviar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} align="center">
              No hay memoriales registrados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}