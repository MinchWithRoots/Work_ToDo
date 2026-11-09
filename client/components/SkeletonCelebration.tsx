import { useEffect, useState } from "react";
import { CelebrationCanvas } from "@/components/CelebrationCanvas";

const GIFS = Array.from({ length: 9 }, (_, index) => `/skeletons/${index + 1}.gif`);
const OVERLAY_DURATION_MS = 2500;

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function SkeletonCelebration() {
  const [bannerGif] = useState(() => pickRandom(GIFS));
  const [overlayGif] = useState(() => pickRandom(GIFS));
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setOverlayVisible(false), OVERLAY_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {overlayVisible && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <img
            src={overlayGif}
            alt=""
            aria-hidden="true"
            className="h-80 w-80 max-w-[80vw] object-contain animate-in zoom-in duration-300"
          />
          <CelebrationCanvas />
        </div>
      )}
      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-success/10 px-4 py-3">
        <img
          src={bannerGif}
          alt=""
          aria-hidden="true"
          className="h-16 w-auto shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="font-bold text-success">Все задачи на день выполнены!</p>
          <p className="text-sm text-muted-foreground">
            Скелет танцует от радости. Заслуженно.
          </p>
        </div>
      </div>
    </>
  );
}
