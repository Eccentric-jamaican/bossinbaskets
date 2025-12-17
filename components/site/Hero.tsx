"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Hero() {
  return (
    <section className="w-full bg-[#f7f4ee]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex flex-col items-center gap-8 py-10 md:py-16">
          <h1 className="text-h1 font-serif text-5xl md:text-6xl text-center text-[#1a1a1a]">
            Meet the <span className="italic">new</span> BossinBaskets
          </h1>

          <Button asChild className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-10 text-lg font-semibold text-white hover:bg-[#1d4ed8]/90">
            <Link href="#">Shop now</Link>
          </Button>

          <div className="w-full overflow-hidden rounded-2xl bg-black/5 shadow-sm">
            <div className="aspect-[16/9] w-full">
              <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm-fluid text-muted-foreground">
                Hero media
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
