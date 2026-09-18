import { useContext } from "react";
import { ArchiveContext } from "../context/archiveContextInstance";

export function useArchive() {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error("useArchive must be used within ArchiveProvider");
  }
  return context;
}
