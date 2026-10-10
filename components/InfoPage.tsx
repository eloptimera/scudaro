import type { Metadata } from "next";
import LocalLink from "./LocalLink";
import type { CareTable, Cta, SizeTable } from "@/lib/content/info";
import type { Locale } from "@/lib/i18n/config";
import { infoAlternatesFor } from "@/lib/i18n/seo";

export function infoMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  return { title, description, alternates: infoAlternatesFor(locale, path) };
}

export function CtaRow({ ctas }: { ctas: Cta[] }) {
  return (
    <div className="info-cta">
      {ctas.map((c) => (
        <LocalLink key={c.href} href={c.href} className="btn btn--light">{c.label}</LocalLink>
      ))}
    </div>
  );
}

export function SizeTables({ tables }: { tables: SizeTable[] }) {
  return (
    <>
      {tables.map((tb) => (
        <div key={tb.title} className="table-scroll">
          <table>
            <caption>{tb.title}</caption>
            <thead>
              <tr>
                <td />
                {tb.head.map((h) => <th key={h} scope="col">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tb.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {r.cells.map((c, i) => <td key={i}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

export function CareTables({ tables }: { tables: CareTable[] }) {
  return (
    <>
      {tables.map((tb) => (
        <div key={tb.title} className="table-scroll">
          <table style={{ minWidth: 0 }}>
            <caption>{tb.title}</caption>
            <tbody>
              {tb.rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
