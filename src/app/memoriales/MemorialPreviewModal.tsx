import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import Image from "next/image";
import { Memorial } from "./page";

interface Props {
  open: boolean;
  onClose: () => void;
  memorial: Memorial | null;
}

export default function MemorialPreviewModal({ open, onClose, memorial }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Vista del Memorial</DialogTitle>
      <DialogContent>
        {memorial && (
          <Image
            src={memorial.imagen_url}
            alt="memorial"
            width={0}
            height={0}
            sizes="100vw"
            className="w-auto h-[80vh] mx-auto object-contain rounded"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}