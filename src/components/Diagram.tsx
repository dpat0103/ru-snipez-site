/* Architecture diagram. Inline SVG so it inherits the palette and stays crisp
   at any size. Boxes map one-to-one onto files in the bot repo. */

const B = "#12233a";
const L = "#1c3149";
const ICE = "#4da6ff";
const LOCK = "#3ddc97";
const PAPER = "#e4edf7";
const MUTE = "#7a91ac";
const FAINT = "#4c6382";

type BoxProps = {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub?: string;
  file?: string;
  accent?: string;
};

function Box({
  x,
  y,
  w = 168,
  h = 62,
  title,
  sub,
  file,
  accent = L,
}: BoxProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={B} stroke={accent} />
      <text
        x={x + 12}
        y={y + 24}
        fill={PAPER}
        fontSize="12.5"
        fontFamily="IBM Plex Sans, sans-serif"
        fontWeight="600"
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + 12}
          y={y + 40}
          fill={MUTE}
          fontSize="10.5"
          fontFamily="IBM Plex Sans, sans-serif"
        >
          {sub}
        </text>
      )}
      {file && (
        <text
          x={x + 12}
          y={y + 54}
          fill={FAINT}
          fontSize="9.5"
          fontFamily="IBM Plex Mono, monospace"
        >
          {file}
        </text>
      )}
    </g>
  );
}

function Arrow({
  d,
  label,
  lx,
  ly,
  color = ICE,
  dashed = false,
}: {
  d: string;
  label?: string;
  lx?: number;
  ly?: number;
  color?: string;
  dashed?: boolean;
}) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={dashed ? "4 4" : undefined}
        markerEnd="url(#head)"
      />
      {label && lx !== undefined && ly !== undefined && (
        <text
          x={lx}
          y={ly}
          fill={FAINT}
          fontSize="9.5"
          fontFamily="IBM Plex Mono, monospace"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export default function Diagram() {
  return (
    <svg
      viewBox="0 0 900 430"
      width="100%"
      role="img"
      aria-label="Architecture diagram. Rutgers open sections endpoint is polled once per second. The open set is intersected against every user's watch list in memory, and matches are enriched with course details from an ETL-built index, then delivered as Discord direct messages."
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      <defs>
        <marker
          id="head"
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill={ICE} />
        </marker>
      </defs>

      {/* lane labels */}
      <text
        x="0"
        y="16"
        fill={FAINT}
        fontSize="10"
        fontFamily="IBM Plex Mono, monospace"
        letterSpacing="1.6"
      >
        REAL-TIME LOOP · 1s
      </text>
      <line x1="0" y1="26" x2="900" y2="26" stroke={L} />

      <Box
        x={0}
        y={52}
        title="Rutgers SoC"
        sub="openSections.json"
        file="one request · all open indexes"
        w={186}
      />
      <Arrow d="M186,83 L246,83" label="GET" lx={216} ly={76} />

      <Box
        x={250}
        y={52}
        title="Poll loop"
        sub="Response cast to a set"
        file="check_open_classes()"
        accent={ICE}
      />
      <Arrow d="M418,83 L478,83" />

      <Box
        x={482}
        y={52}
        title="Set intersection"
        sub="watch list ∩ open sections"
        file="per user, in memory"
        w={186}
        accent={ICE}
      />
      <Arrow d="M668,83 L728,83" label="hits" lx={698} ly={76} color={LOCK} />

      <Box
        x={732}
        y={52}
        title="Discord DM"
        sub="Embed + WebReg link"
        file="600s cooldown per pair"
        accent={LOCK}
      />

      {/* watch lists feeding the intersection */}
      <Box
        x={482}
        y={168}
        title="Watch lists"
        sub="Discord user ID → indexes"
        file="dataStorage.py"
        w={186}
      />
      <Arrow d="M575,168 L575,118" />
      <text
        x={585}
        y={146}
        fill={FAINT}
        fontSize="9.5"
        fontFamily="IBM Plex Mono, monospace"
      >
        loaded once
      </text>

      {/* transition log */}
      <Box
        x={250}
        y={168}
        title="Transition log"
        sub="closed → open events"
        file="last_opened.py"
      />
      <Arrow d="M334,118 L334,164" />

      {/* second lane */}
      <text
        x="0"
        y="286"
        fill={FAINT}
        fontSize="10"
        fontFamily="IBM Plex Mono, monospace"
        letterSpacing="1.6"
      >
        DATA LAYER · PER SEMESTER
      </text>
      <line x1="0" y1="296" x2="900" y2="296" stroke={L} />

      <Box
        x={0}
        y={322}
        title="Catalog scrape"
        sub="15 school codes"
        file="Selenium + BeautifulSoup"
        w={186}
      />
      <Arrow d="M186,353 L246,353" />

      <Box
        x={250}
        y={322}
        title="ETL"
        sub="Parse → normalize → CSV"
        file="course_info_generation.py"
      />
      <Arrow d="M418,353 L478,353" />

      <Box
        x={482}
        y={322}
        title="Index → course map"
        sub="title, code, section"
        file="manipulatingdata.py"
        w={186}
        accent={ICE}
      />
      <Arrow d="M668,353 L728,353" />

      <Box
        x={732}
        y={322}
        title="Enrichment"
        sub="Gives 5-digit codes meaning"
        file="validation + embeds"
        accent={ICE}
      />

      {/* the join: data layer feeds the real-time lane */}
      <Arrow
        d="M816,318 L816,240 Q816,230 806,230 L586,230 Q576,230 576,220 L576,118"
        color={ICE}
        dashed
      />
      <text
        x={700}
        y={222}
        fill={FAINT}
        fontSize="9.5"
        fontFamily="IBM Plex Mono, monospace"
        textAnchor="middle"
      >
        resolves index → course at notify time
      </text>
    </svg>
  );
}
