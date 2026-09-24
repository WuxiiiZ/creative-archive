import { useContext } from "react";
import { NoticeContext } from "../context/noticeContextInstance";

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error("useNotice must be used within NoticeProvider");
  }
  return context;
}
