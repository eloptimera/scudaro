"use client";

import { REVIEWS, SOCIAL } from "@/lib/config";
import { useI18n } from "./I18nProvider";

/** Collapsible list of customer reviews. Used on the shop page and on every product page. */
export default function Reviews({ className = "" }: { className?: string }) {
  const { t, locale } = useI18n();
  const sv = locale === "sv";

  return (
    <details className={`pdp__details reviews ${className}`.trim()}>
      <summary>
        {t("shop.reviews.title")} <span className="reviews__count">({REVIEWS.length})</span>
      </summary>
      <div className="reviews__body">
        <ul className="reviews__list">
          {REVIEWS.map((r) => (
            <li key={r.name} className="review">
              <blockquote className="review__quote" lang={sv ? "sv" : "en"}>
                <p>&ldquo;{sv ? r.quote : r.en}&rdquo;</p>
              </blockquote>
              <p className="review__by">
                <span className="review__name">{r.name}</span>
                <span className="review__meta">
                  {t("shop.reviews.verified")}
                  {r.product ? ` · ${r.product}` : ""}
                </span>
              </p>
            </li>
          ))}
        </ul>
        <a className="reviews__more" href={SOCIAL[0].href} target="_blank" rel="noopener noreferrer">
          {t("shop.reviews.more")} <span className="dir-arrow" aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </details>
  );
}
