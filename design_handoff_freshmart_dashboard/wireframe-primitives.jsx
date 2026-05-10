// Wireframe primitives — sketchy/hand-drawn look helpers
// Used across all artboards for a consistent low-fi vibe.

const W = {
  ink: '#1f2520',
  ink2: '#4a544c',
  ink3: '#8a948c',
  paper: '#fafaf6',
  paper2: '#f1f1ea',
  green: '#1f4d34',
  greenSoft: '#e6efe6',
  greenInk: '#2a6a47',
  accent: '#d3893a',
  accentSoft: '#fbeed8',
  line: '#2a2f2c',
  lineSoft: 'rgba(31,37,32,0.18)',
  font: '"Satoshi", "Inter", system-ui, sans-serif',
  fontUI: '"DM Sans", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',
};

// Sketchy box — rough rectangle using SVG with slightly wobbly path
function SBox({ children, w, h, fill = 'transparent', stroke = W.line, strokeWidth = 1.5, radius = 4, style = {}, dashed = false, onClick }) {
  // tiny pseudo-random offsets to fake hand-drawn jitter
  const r = radius;
  const j = 1.2; // jitter px
  const path = `
    M ${r + rand(j)} ${rand(j)}
    L ${w - r + rand(j)} ${rand(j)}
    Q ${w + rand(j)} ${rand(j)} ${w + rand(j)} ${r + rand(j)}
    L ${w + rand(j)} ${h - r + rand(j)}
    Q ${w + rand(j)} ${h + rand(j)} ${w - r + rand(j)} ${h + rand(j)}
    L ${r + rand(j)} ${h + rand(j)}
    Q ${rand(j)} ${h + rand(j)} ${rand(j)} ${h - r + rand(j)}
    L ${rand(j)} ${r + rand(j)}
    Q ${rand(j)} ${rand(j)} ${r + rand(j)} ${rand(j)}
    Z
  `;
  return (
    <div onClick={onClick} style={{ position: 'relative', width: w, height: h, ...style }}>
      <svg width={w + 4} height={h + 4} style={{ position: 'absolute', top: -2, left: -2, overflow: 'visible', pointerEvents: 'none' }}>
        <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '4 3' : 'none'} />
      </svg>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
}

// deterministic-ish jitter (keeps re-renders stable per call site)
let _seed = 1;
function rand(amt = 1) {
  _seed = (_seed * 9301 + 49297) % 233280;
  const r = _seed / 233280;
  return (r - 0.5) * 2 * amt;
}

// Sketchy line — wobbly horizontal/vertical separator
function SLine({ w = 100, h = 0, vertical = false, stroke = W.lineSoft, strokeWidth = 1.5, style = {}, dashed = false }) {
  const len = vertical ? h : w;
  const segs = 3;
  let d = `M 0 0`;
  for (let i = 1; i <= segs; i++) {
    const x = vertical ? rand(0.8) : (len * i) / segs;
    const y = vertical ? (len * i) / segs : rand(0.8);
    d += ` L ${x} ${y}`;
  }
  return (
    <svg width={vertical ? 4 : w} height={vertical ? h : 4} style={{ overflow: 'visible', ...style }}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={dashed ? '4 3' : 'none'} />
    </svg>
  );
}

// Squiggle underline accent
function SUnderline({ w = 60, color = W.green, style = {} }) {
  const d = `M 0 3 Q ${w * 0.25} 0, ${w * 0.5} 3 T ${w} 3`;
  return (
    <svg width={w} height={6} style={{ display: 'block', ...style }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Placeholder text bar (for body copy areas)
function SText({ w = 60, color = W.ink3, h = 6, style = {} }) {
  return <div style={{ width: w, height: h, background: color, borderRadius: 2, opacity: 0.45, ...style }} />;
}

// Image / product placeholder — diagonal-stripe square
function SImage({ w = 60, h = 60, label, color = W.ink3, fill = '#ecebe3', style = {}, radius = 4 }) {
  const stripeId = `stripe-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div style={{ position: 'relative', width: w, height: h, ...style }}>
      <svg width={w} height={h} style={{ display: 'block' }}>
        <defs>
          <pattern id={stripeId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={fill} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="0.6" opacity="0.35" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${stripeId})`} stroke={color} strokeWidth="1" rx={radius} opacity="0.9" />
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: W.fontMono, fontSize: 9, color: W.ink2, textAlign: 'center', padding: 4, lineHeight: 1.2 }}>
          {label}
        </div>
      )}
    </div>
  );
}

// Sketchy pill / chip
function SPill({ children, active = false, accent = W.green, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 11px', borderRadius: 999,
      border: `1.5px solid ${active ? accent : W.line}`,
      background: active ? accent : 'transparent',
      color: active ? '#fff' : W.ink,
      fontFamily: W.fontUI, fontSize: 13,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

// Hand-drawn arrow
function SArrow({ size = 14, color = W.ink, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={style}>
      <path d="M 1 7 Q 7 6.5, 12 7 M 9 4 L 12 7 L 9 10" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Star / sparkle accent
function SStar({ size = 10, color = W.accent, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={style}>
      <path d="M 5 0 L 5 10 M 0 5 L 10 5 M 1.5 1.5 L 8.5 8.5 M 8.5 1.5 L 1.5 8.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// Section header with squiggle underline
function SHeading({ children, size = 16, color = W.ink, underline = false, accent = W.green, style = {} }) {
  return (
    <div style={{ display: 'inline-block', ...style }}>
      <div style={{ fontFamily: W.font, fontSize: size, fontWeight: 700, color, lineHeight: 1.1 }}>{children}</div>
      {underline && <SUnderline w={Math.min(80, String(children).length * 7)} color={accent} style={{ marginTop: 2 }} />}
    </div>
  );
}

// Annotation note — for marker labels
function SNote({ children, color = W.accent, style = {} }) {
  return (
    <div style={{
      fontFamily: W.font, fontSize: 13, color,
      fontWeight: 600, letterSpacing: 0.2,
      ...style,
    }}>{children}</div>
  );
}

Object.assign(window, { W, SBox, SLine, SUnderline, SText, SImage, SPill, SArrow, SStar, SHeading, SNote });
