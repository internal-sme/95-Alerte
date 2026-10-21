import { Fragment } from "react";
import { fold } from "@/utils/index";

export interface HlProps {
  text: string;
  q: string;
}

export function Hl({ text, q }: HlProps) {
  const i = q ? fold(text).indexOf(q) : -1;
  if (i < 0) return text;
  return <Fragment>{text.slice(0, i)}<b>{text.slice(i, i + q.length)}</b>{text.slice(i + q.length)}</Fragment>;
}
