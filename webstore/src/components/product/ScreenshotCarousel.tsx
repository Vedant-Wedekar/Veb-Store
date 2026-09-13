import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export default function ScreenshotCarousel({ screenshots }: { screenshots: string[] }) {
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);

  if (screenshots.length === 0) return null;

  const scrollTo = (i: number) => {
    const clamped = (i + screenshots.length) % screenshots.length;
    setIndex(clamped);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * clamped, behavior: "smooth" });
  };

  const go = (dir: 1 | -1) => scrollTo(index + dir);

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-line bg-ink/[0.02]">
        <div ref={trackRef} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto">
          {screenshots.map((src, i) => (
            <div key={i} className="w-full shrink-0 snap-center">
              {broken[i] ? (
                <div className="flex aspect-video items-center justify-center bg-ink/5 text-ink/30">
                  <ImageOff size={28} />
                </div>
              ) : (
                <img
                  src={src}
                  alt={`Screenshot ${i + 1}`}
                  className="aspect-video w-full object-cover"
                  onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                />
              )}
            </div>
          ))}
        </div>
        {screenshots.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-soft hover:bg-white sm:flex"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-soft hover:bg-white sm:flex"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {screenshots.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to screenshot ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-brand-purple" : "w-1.5 bg-ink/15"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
