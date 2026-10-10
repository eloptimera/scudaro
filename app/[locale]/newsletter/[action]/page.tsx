import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalLink from "@/components/LocalLink";
import { isLocale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";
import { TOKEN_RE } from "@/lib/newsletter";

type Props = {
  params: Promise<{ locale: string; action: string }>;
  searchParams: Promise<{ token?: string }>;
};

const ACTIONS = ["confirm", "unsubscribe", "done", "unsubscribed", "invalid"] as const;
type Action = (typeof ACTIONS)[number];
const isAction = (v: string): v is Action => (ACTIONS as readonly string[]).includes(v);

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Landing pages for the newsletter emails. Confirming and unsubscribing need a button press (a POST), never a plain link visit. */
export default async function NewsletterPage({ params, searchParams }: Props) {
  const { locale, action } = await params;
  if (!isLocale(locale) || !isAction(action)) notFound();
  const { token = "" } = await searchParams;
  const t = await getT(locale);

  const needsToken = action === "confirm" || action === "unsubscribe";
  const valid = !needsToken || TOKEN_RE.test(token);
  const shown: Action = valid ? action : "invalid";

  const title = {
    confirm: t("newsletter.confirm.title"),
    unsubscribe: t("newsletter.unsub.title"),
    done: t("newsletter.done.title"),
    unsubscribed: t("newsletter.unsub.title"),
    invalid: t("newsletter.invalid.title"),
  }[shown];
  const text = {
    confirm: t("newsletter.confirm.text"),
    unsubscribe: t("newsletter.unsub.text"),
    done: t("newsletter.done.text"),
    unsubscribed: t("newsletter.unsub.done"),
    invalid: t("newsletter.invalid"),
  }[shown];

  return (
    <article className="policy">
      <h1>{title}</h1>
      <div className="prose">
        <p>{text}</p>
        {(shown === "confirm" || shown === "unsubscribe") && (
          <form method="post" action={shown === "confirm" ? "/api/newsletter/confirm" : "/api/newsletter/unsubscribe"}>
            <input type="hidden" name="token" value={token} />
            <button type="submit" className="btn btn--light">
              {shown === "confirm" ? t("email.confirm.button") : t("newsletter.unsub.button")}
            </button>
          </form>
        )}
      </div>
      <p>
        <LocalLink href="/" className="pdp__crumbs"><span className="dir-arrow" aria-hidden="true">&larr;</span> {t("policy.back")}</LocalLink>
      </p>
    </article>
  );
}
