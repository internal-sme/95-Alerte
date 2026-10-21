import type { ReactNode } from "react";
export interface ReportFooterProps {
  children: ReactNode;
  note?: ReactNode;
}

export function ReportFooter({ children, note }: ReportFooterProps) {
  return <div className="screen-footer report-footer">{note ? <p className="footer-note">{note}</p> : null}{children}</div>;
}
