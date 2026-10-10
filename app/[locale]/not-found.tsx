"use client";

import LocalLink from "@/components/LocalLink";
import { useI18n } from "@/components/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="about">
      <h2>{t("notfound.title")}</h2>
      <p>{t("notfound.text")}</p>
      <p><LocalLink className="btn btn--light" href="/">{t("notfound.back")}</LocalLink></p>
    </section>
  );
}
