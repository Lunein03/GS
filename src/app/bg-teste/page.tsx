import Link from "next/link";

import BackgroundSnippetsNoiseEffect from "@/components/ui/background-snippets-noise-effect11";

export default function Page() {
  return (
    <main className="relative z-0 min-h-screen overflow-hidden bg-transparent">
      <BackgroundSnippetsNoiseEffect />
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <Link
          href={HOME_LINK_HREF}
          aria-label={HOME_LINK_ARIA_LABEL}
          className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {HOME_LINK_LABEL}
        </Link>
      </div>
    </main>
  );
}

const HOME_LINK_HREF = "/";
const HOME_LINK_LABEL = "Voltar para o site principal";
const HOME_LINK_ARIA_LABEL = "Voltar para o site principal";
