// Everyday Produce Market — tightened logo system
// All logo components as inline SVG. Colors refined for print + screen.

const EP_COLORS = {
  red:      '#B8232A',  // tomato red — refined from original
  redDark:  '#8F1A20',
  green:    '#2F7A3A',  // stripe + tagline green
  greenDark:'#1F5228',
  yellow:   '#F2C438',  // cantaloupe / basket weave
  yellowDk: '#D4A419',
  brown:    '#7A4A28',  // table + basket rim
  brownDk:  '#5A3518',
  cream:    '#F5EDD8',  // tent stripe / background warmth
  ink:      '#2A1A0E',  // near-black outlines, warm
  watermelonDark: '#1F5228',
  watermelonLt:   '#3D8A4A',
};

// ---------- The Tent (produce stand) ----------
// Built on a 200x200 viewBox, centered in x, ground line ~y=180.
// Pure geometric primitives: triangles, rectangles, circles.
function EPTent({ size = 200, mono = false, monoColor = '#2A1A0E' }) {
  const C = mono
    ? { red: monoColor, redDark: monoColor, green: monoColor, greenDark: monoColor,
        yellow: monoColor, yellowDk: monoColor, brown: monoColor, brownDk: monoColor,
        cream: 'none', ink: monoColor, watermelonDark: monoColor, watermelonLt: monoColor }
    : EP_COLORS;
  const stroke = C.ink;
  const sw = 2; // stroke width

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* ---- Tent roof: isoceles triangle with horizontal stripes ---- */}
      {/* Peak at (100, 12), base from (20,80) to (180,80) */}
      <defs>
        <clipPath id="ep-roof-clip">
          <polygon points="100,12 180,80 20,80" />
        </clipPath>
      </defs>
      <g clipPath="url(#ep-roof-clip)">
        {/* Cream base */}
        <rect x="20" y="12" width="160" height="68" fill={mono ? 'none' : C.cream} />
        {/* Tent tarp: 3 green stripes + 2 cream stripes alternating.
            Roof spans y=12 (peak) to y=80 (eave) = 68px.
            Pattern: green, cream, green, cream, green — 5 bands of ~13.6px each.
            Use bands of 14px starting at y=12. */}
        <rect x="20" y="12" width="160" height="14" fill={C.green}/>
        <rect x="20" y="26" width="160" height="14" fill={mono ? '#FFFFFF' : C.cream}/>
        <rect x="20" y="40" width="160" height="14" fill={C.green}/>
        <rect x="20" y="54" width="160" height="14" fill={mono ? '#FFFFFF' : C.cream}/>
        <rect x="20" y="68" width="160" height="12" fill={C.green}/>
      </g>
      {/* Roof outline */}
      <polygon points="100,12 180,80 20,80" fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>

      {/* ---- Tent poles (4 vertical supports from roof edges down to ground) ---- */}
      {/* Outer poles go from roof corners to ground; inner poles flank the table */}
      <line x1="24" y1="80" x2="24" y2="178" stroke={C.brownDk} strokeWidth="3" strokeLinecap="square"/>
      <line x1="176" y1="80" x2="176" y2="178" stroke={C.brownDk} strokeWidth="3" strokeLinecap="square"/>
      <line x1="24" y1="80" x2="24" y2="178" stroke={stroke} strokeWidth="1"/>
      <line x1="176" y1="80" x2="176" y2="178" stroke={stroke} strokeWidth="1"/>
      {/* Small cross-brace under eave */}
      <line x1="24" y1="82" x2="176" y2="82" stroke={C.brownDk} strokeWidth="2"/>
      <line x1="24" y1="82" x2="176" y2="82" stroke={stroke} strokeWidth="0.5"/>

      {/* ---- Hanging flower baskets (3, under roof eave) ---- */}
      {/* Each basket: small trapezoid + string up to eave */}
      {[
        { x: 55, flowerColor: C.red },
        { x: 100, flowerColor: C.yellow },
        { x: 145, flowerColor: C.red },
      ].map((b, i) => (
        <g key={i}>
          {/* string */}
          <line x1={b.x} y1={80} x2={b.x} y2={92} stroke={stroke} strokeWidth="1.2"/>
          {/* basket body — trapezoid */}
          <polygon
            points={`${b.x-10},92 ${b.x+10},92 ${b.x+8},104 ${b.x-8},104`}
            fill={C.brown} stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>
          {/* basket rim */}
          <rect x={b.x-11} y="90" width="22" height="3" fill={C.brownDk} stroke={stroke} strokeWidth={sw}/>
          {/* flower cluster (3 dots) */}
          <circle cx={b.x-4} cy="89" r="2.5" fill={b.flowerColor} stroke={stroke} strokeWidth="1"/>
          <circle cx={b.x+4} cy="89" r="2.5" fill={b.flowerColor} stroke={stroke} strokeWidth="1"/>
          <circle cx={b.x}   cy="86" r="2.5" fill={b.flowerColor} stroke={stroke} strokeWidth="1"/>
        </g>
      ))}

      {/* ---- Table (spans under the tent) ---- */}
      {/* Tabletop */}
      <rect x="24" y="138" width="152" height="8" fill={C.brown} stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>
      {/* Table legs */}
      <rect x="30"  y="146" width="4" height="28" fill={C.brownDk} stroke={stroke} strokeWidth="1.5"/>
      <rect x="166" y="146" width="4" height="28" fill={C.brownDk} stroke={stroke} strokeWidth="1.5"/>
      <rect x="98"  y="146" width="4" height="28" fill={C.brownDk} stroke={stroke} strokeWidth="1.5"/>

      {/* ---- Left basket: tomatoes ---- */}
      {/* Basket (trapezoid) */}
      <polygon points="40,128 82,128 78,138 44,138" fill={C.brown} stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>
      {/* Basket weave lines */}
      <line x1="48" y1="130" x2="46" y2="138" stroke={C.brownDk} strokeWidth="1"/>
      <line x1="56" y1="130" x2="55" y2="138" stroke={C.brownDk} strokeWidth="1"/>
      <line x1="64" y1="130" x2="64" y2="138" stroke={C.brownDk} strokeWidth="1"/>
      <line x1="72" y1="130" x2="73" y2="138" stroke={C.brownDk} strokeWidth="1"/>
      {/* Tomatoes — 3 red circles poking above basket */}
      <circle cx="50" cy="124" r="6" fill={C.red} stroke={stroke} strokeWidth={sw}/>
      <circle cx="61" cy="121" r="6.5" fill={C.red} stroke={stroke} strokeWidth={sw}/>
      <circle cx="72" cy="124" r="6" fill={C.red} stroke={stroke} strokeWidth={sw}/>
      {/* tomato leaves (small green triangles on top) */}
      <polygon points="49,119 51,116 53,119" fill={C.green} stroke={stroke} strokeWidth="1"/>
      <polygon points="60,116 62,113 64,116" fill={C.green} stroke={stroke} strokeWidth="1"/>
      <polygon points="71,119 73,116 75,119" fill={C.green} stroke={stroke} strokeWidth="1"/>

      {/* ---- Right pile: cantaloupes (yellow circles stacked) ---- */}
      {/* Back row */}
      <circle cx="118" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="132" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="146" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="160" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      {/* Front row */}
      <circle cx="125" cy="136" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="139" cy="136" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="153" cy="136" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      {/* Top */}
      <circle cx="132" cy="120" r="6" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="146" cy="120" r="6" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="139" cy="113" r="5.5" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>

      {/* ---- Watermelons on the ground (3 ovals in front of table) ---- */}
      {/* Ground line */}
      <line x1="20" y1="180" x2="180" y2="180" stroke={stroke} strokeWidth="1" opacity="0.3"/>
      {[
        { cx: 70, cy: 178 },
        { cx: 100, cy: 182 },
        { cx: 130, cy: 178 },
      ].map((w, i) => (
        <g key={i}>
          <ellipse cx={w.cx} cy={w.cy} rx="18" ry="8" fill={C.watermelonDark} stroke={stroke} strokeWidth={sw}/>
          {/* stripes */}
          <path d={`M ${w.cx-14},${w.cy-2} Q ${w.cx-10},${w.cy-6} ${w.cx-6},${w.cy-2}`} fill="none" stroke={C.watermelonLt} strokeWidth="1.5"/>
          <path d={`M ${w.cx-4},${w.cy-3} Q ${w.cx},${w.cy-7} ${w.cx+4},${w.cy-3}`} fill="none" stroke={C.watermelonLt} strokeWidth="1.5"/>
          <path d={`M ${w.cx+6},${w.cy-2} Q ${w.cx+10},${w.cy-6} ${w.cx+14},${w.cy-2}`} fill="none" stroke={C.watermelonLt} strokeWidth="1.5"/>
        </g>
      ))}
    </svg>
  );
}

// ---------- Wordmark ----------
// Vintage American farmstand signage: condensed slab/western feel.
// We use "Alfa Slab One" (bold slab, confident, farmstand market signage vibe)
// with tagline in a western/ornate script-adjacent condensed font.
// Primary: "EVERYDAY PRODUCE MARKET" in a stacked 3-line or single-line.

function EPWordmark({ color = EP_COLORS.red, taglineColor = EP_COLORS.green, layout = 'stacked', showTagline = true }) {
  if (layout === 'stacked') {
    return (
      <div style={{textAlign:'left', lineHeight: 0.92, fontFamily:'"Oswald", sans-serif', fontWeight: 700}}>
        <div className="ep-outline" style={{fontSize: 68, color, letterSpacing:'0.01em'}}>EVERYDAY</div>
        <div className="ep-outline" style={{fontSize: 68, color, letterSpacing:'0.01em'}}>PRODUCE</div>
        <div className="ep-outline" style={{fontSize: 68, color, letterSpacing:'0.01em'}}>MARKET</div>
        {showTagline && (
          <div style={{marginTop: 14, fontFamily:'"Oswald", sans-serif', fontWeight:500, fontSize: 20, letterSpacing:'0.18em', color: taglineColor}}>
            WALDO TRADITION SINCE 1985
          </div>
        )}
      </div>
    );
  }
  // single-line
  return (
    <div style={{textAlign:'left', lineHeight: 1, fontFamily:'"Oswald", sans-serif', fontWeight: 700}}>
      <div className="ep-outline" style={{fontSize: 44, color, letterSpacing:'0.02em'}}>EVERYDAY PRODUCE MARKET</div>
      {showTagline && (
        <div style={{marginTop: 8, fontFamily:'"Oswald", sans-serif', fontWeight:500, fontSize: 14, letterSpacing:'0.18em', color: taglineColor}}>
          WALDO TRADITION SINCE 1985
        </div>
      )}
    </div>
  );
}

// ---------- Horizontal primary lockup ----------
function EPLogoHorizontal({ width = 800, showTagline = true, mono = false, monoColor = EP_COLORS.ink, bg = 'transparent' }) {
  const h = width * 0.5;
  const tentSize = h * 0.85;
  return (
    <div style={{
      width, height: h, background: bg,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: `${h*0.06}px ${h*0.08}px`, boxSizing:'border-box', gap: h*0.06,
    }}>
      <div style={{flex:'1 1 auto'}}>
        <EPWordmark
          color={mono ? monoColor : EP_COLORS.red}
          taglineColor={mono ? monoColor : EP_COLORS.green}
          layout="stacked"
          showTagline={showTagline}
        />
      </div>
      <div style={{flex:'0 0 auto'}}>
        <EPTent size={tentSize} mono={mono} monoColor={monoColor}/>
      </div>
    </div>
  );
}

// ---------- Stacked / compact lockup ----------
function EPLogoStacked({ width = 400, showTagline = true, mono = false, monoColor = EP_COLORS.ink, bg = 'transparent' }) {
  return (
    <div style={{
      width, background: bg,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding: 24, boxSizing:'border-box', gap: 16,
    }}>
      <EPTent size={width * 0.5} mono={mono} monoColor={monoColor}/>
      <div style={{textAlign:'center', lineHeight: 0.95, fontFamily:'"Oswald", sans-serif', fontWeight: 700}}>
        <div className="ep-outline" style={{fontSize: width*0.115, color: mono ? monoColor : EP_COLORS.red, letterSpacing:'0.02em'}}>EVERYDAY</div>
        <div className="ep-outline" style={{fontSize: width*0.115, color: mono ? monoColor : EP_COLORS.red, letterSpacing:'0.02em'}}>PRODUCE MARKET</div>
        {showTagline && (
          <div style={{marginTop: 10, fontFamily:'"Oswald", sans-serif', fontWeight:500, fontSize: width*0.035, letterSpacing:'0.18em', color: mono ? monoColor : EP_COLORS.green}}>
            WALDO TRADITION SINCE 1985
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  EP_COLORS, EPTent, EPWordmark, EPLogoHorizontal, EPLogoStacked,
});
