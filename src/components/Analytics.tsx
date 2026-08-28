import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import stats from "../data/stats.json";

const ICE = "#4da6ff";
const LOCK = "#3ddc97";
const LINE = "#1c3149";
const MUTE = "#7a91ac";

const axis = {
  stroke: "#4c6382",
  fontSize: 11,
  fontFamily: "IBM Plex Mono, monospace",
};

function Tip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tip">
      {label} · <b>{payload[0].value.toLocaleString()}</b> {unit}
    </div>
  );
}

function fmtDuration(seconds: number) {
  if (seconds < 60) return { n: String(seconds), u: "seconds" };
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return { n: `${m}m ${s.toString().padStart(2, "0")}s`, u: "" };
}

export default function Analytics() {
  const med = fmtDuration(stats.openDuration.medianSeconds);
  const p90 = fmtDuration(stats.openDuration.p90Seconds);
  const peak = [...stats.openingsByHour.data].sort(
    (a, b) => b.openings - a.openings,
  )[0];

  return (
    <section className="section" id="data">
      <div className="wrap">
        <div className="eyebrow">Three years of section data</div>
        <h2 className="section-title">What Rutgers doesn't publish</h2>
        <p className="section-lede">
          The Schedule of Classes tells you whether a section is open right now.
          It keeps no history. To notify students accurately, RU SnipeZ had to
          build that history itself, recording every open and close transition
          since December 2023. These are the patterns in it.
        </p>

        <div className="chart-grid">
          <div className="reticle card">
            <div className="card-title">How long a seat lasts</div>
            <p className="card-sub">
              Median time between a section opening and someone taking it. This
              is the number that decides whether polling speed matters.
            </p>
            <div className="card-figure">
              {med.n} {med.u && <small>{med.u}</small>}
            </div>
            <div className="card-foot">
              9 in 10 openings are gone within {p90.n} {p90.u}
            </div>
          </div>

          <div className="reticle card">
            <div className="card-title">Sections that never open</div>
            <p className="card-sub">
              Tracked sections not observed open once across the whole period.
              Waiting on these is not a strategy, and knowing that in advance is
              worth as much as the alert itself.
            </p>
            <div className="card-figure" style={{ color: "#cc0033" }}>
              {stats.neverOpened.share}%
              <small>
                {stats.neverOpened.value.toLocaleString()} of{" "}
                {stats.headline.sections.display} sections
              </small>
            </div>
            <div className="card-foot">
              Two in five sections are effectively locked from day one
            </div>
          </div>

          <div className="reticle card">
            <div className="card-title">Most contested subjects</div>
            <p className="card-sub">
              Openings recorded per subject. High churn means seats move often,
              so waiting is more likely to work.
            </p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={stats.churnBySubject.data}
                layout="vertical"
                margin={{ left: 4, right: 12, top: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={112}
                  tick={{ ...axis, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(77,166,255,0.06)" }}
                  content={<Tip unit="openings" />}
                />
                <Bar dataKey="openings" radius={[0, 2, 2, 0]}>
                  {stats.churnBySubject.data.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? ICE : "#26527f"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="reticle card span2">
            <div className="card-title">When seats actually open</div>
            <p className="card-sub">
              Openings by hour of day, Eastern time. The busiest hour is{" "}
              {peak.hour}:00. Almost a fifth of all openings land outside normal
              waking hours, which is the practical argument for automating this
              at all.
            </p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={stats.openingsByHour.data}
                margin={{ left: -18, right: 8, top: 4, bottom: 0 }}
              >
                <CartesianGrid stroke={LINE} vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={axis}
                  axisLine={{ stroke: LINE }}
                  tickLine={false}
                />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(77,166,255,0.06)" }}
                  content={<Tip unit="openings" />}
                />
                <Bar dataKey="openings" radius={[2, 2, 0, 0]}>
                  {stats.openingsByHour.data.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.hour === peak.hour ? LOCK : "#2f6ba6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="reticle card span2">
            <div className="card-title">One registration cycle</div>
            <p className="card-sub">
              Openings per day through a single semester's registration window.
              The second peak is add/drop, when students finalize schedules and
              release the seats they were holding.
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={stats.cycleTimeline.data}
                margin={{ left: -18, right: 8, top: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ICE} stopOpacity={0.42} />
                    <stop offset="100%" stopColor={ICE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={LINE} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ ...axis, fontSize: 10 }}
                  axisLine={{ stroke: LINE }}
                  tickLine={false}
                />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip unit="openings" />} />
                <Area
                  type="monotone"
                  dataKey="openings"
                  stroke={ICE}
                  strokeWidth={2}
                  fill="url(#fade)"
                  dot={{ r: 2.5, fill: ICE, stroke: "none" }}
                  activeDot={{ r: 4.5, fill: LOCK, stroke: "none" }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="card-foot" style={{ color: MUTE }}>
              Aggregated across all tracked sections. No individual student
              activity is represented in any chart on this page.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
