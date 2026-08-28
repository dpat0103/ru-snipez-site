import { useEffect, useRef, useState } from "react";
import stats from "../data/stats.json";

type Metric = {
  value: number;
  display: string;
  label: string;
  note: string;
  source: string;
};

const ORDER: Metric[] = [
  stats.headline.students,
  stats.headline.sections,
  stats.headline.semesters,
  stats.headline.notifications,
];

function useSeen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

/* Counts up to the real value, then swaps in the formatted display string so
   the "+" and thousands separators come from the data file, not from here. */
function Counter({ metric, go }: { metric: Metric; go: boolean }) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!go) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDone(true);
      return;
    }
    const dur = 1100;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(metric.value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, metric.value]);

  return <div className="band-num">{done ? metric.display : n.toLocaleString()}</div>;
}

export default function StatBand() {
  const { ref, seen } = useSeen<HTMLDivElement>();
  return (
    <section className="band" id="numbers" ref={ref}>
      <div className="wrap" style={{ paddingInline: 0 }}>
        <div className="band-grid">
          {ORDER.map((m) => (
            <div className="band-cell" key={m.label}>
              <Counter metric={m} go={seen} />
              <div className="band-label">{m.label}</div>
              <div className="band-note">{m.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
