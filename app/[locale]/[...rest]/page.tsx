import { notFound } from "next/navigation";

// Any unknown address under a language renders that language's 404 page (inside the normal layout).
export default function CatchAll() {
  notFound();
}
