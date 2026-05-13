// Deliverables: favicon, business card, web banner, social avatar, signage mockup

// ---------- Favicon tiles ----------
// Just the tent peak — simplified further for tiny sizes
function EPFaviconMark({ size = 64, simplified = false }) {
  // At small sizes, show only the roof + 3 hanging elements + table as silhouette
  if (simplified) {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
        <rect width="64" height="64" fill={EP_COLORS.cream} rx="8"/>
        <defs>
          <clipPath id="fav-roof">
            <polygon points="32,8 58,34 6,34"/>
          </clipPath>
        </defs>
        <g clipPath="url(#fav-roof)">
          <rect x="6" y="8" width="52" height="26" fill={EP_COLORS.cream}/>
          <rect x="6" y="12" width="52" height="4" fill={EP_COLORS.green}/>
          <rect x="6" y="20" width="52" height="4" fill={EP_COLORS.green}/>
          <rect x="6" y="28" width="52" height="4" fill={EP_COLORS.green}/>
        </g>
        <polygon points="32,8 58,34 6,34" fill="none" stroke={EP_COLORS.ink} strokeWidth="2"/>
        {/* Single produce element below */}
        <rect x="8" y="46" width="48" height="3" fill={EP_COLORS.brown} stroke={EP_COLORS.ink} strokeWidth="1"/>
        <circle cx="20" cy="41" r="4" fill={EP_COLORS.red} stroke={EP_COLORS.ink} strokeWidth="1.5"/>
        <circle cx="32" cy="41" r="4" fill={EP_COLORS.yellow} stroke={EP_COLORS.ink} strokeWidth="1.5"/>
        <circle cx="44" cy="41" r="4" fill={EP_COLORS.red} stroke={EP_COLORS.ink} strokeWidth="1.5"/>
      </svg>
    );
  }
  // Full tent at favicon scale
  return (
    <div style={{width: size, height: size, background: EP_COLORS.cream, borderRadius: size*0.12, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}}>
      <EPTent size={size * 0.92}/>
    </div>
  );
}

function FaviconSet() {
  return (
    <div style={{display:'flex', gap: 48, alignItems:'flex-end', padding: 32, background:'#FAF7EF'}}>
      {[16, 32, 64].map(s => (
        <div key={s} style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 12}}>
          <div style={{border: '1px dashed #C9C3B3', padding: 8}}>
            <EPFaviconMark size={s} simplified={s <= 32}/>
          </div>
          <div style={{fontFamily:'"Oswald", sans-serif', fontSize: 12, color:'#6B6560', letterSpacing:'0.1em'}}>{s}×{s}</div>
        </div>
      ))}
      {/* Actual-size row */}
      <div style={{marginLeft: 'auto', display:'flex', flexDirection:'column', gap: 8, alignItems:'flex-start'}}>
        <div style={{fontFamily:'"Oswald", sans-serif', fontSize: 11, color:'#6B6560', letterSpacing:'0.12em'}}>BROWSER TAB PREVIEW</div>
        <div style={{display:'flex', alignItems:'center', gap: 8, padding: '8px 14px', background:'#fff', border:'1px solid #DDD', borderRadius: 8, minWidth: 220}}>
          <EPFaviconMark size={16} simplified={true}/>
          <div style={{fontFamily:'Inter, sans-serif', fontSize: 13, color:'#333'}}>Everyday Produce Market</div>
          <div style={{marginLeft:'auto', color:'#999', fontSize: 14}}>×</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Business card ----------
// Standard US business card: 3.5" × 2" → at 200dpi = 700 × 400
function BusinessCardFront() {
  return (
    <div style={{
      width: 700, height: 400, background: EP_COLORS.cream,
      position:'relative', overflow:'hidden',
      boxShadow:'0 1px 0 rgba(0,0,0,0.04)',
      border:`1px solid ${EP_COLORS.ink}22`,
    }}>
      {/* Top green stripe band echoing tent roof */}
      <div style={{position:'absolute', top: 0, left: 0, right: 0, height: 12, background: EP_COLORS.green}}/>
      <div style={{position:'absolute', top: 16, left: 0, right: 0, height: 6, background: EP_COLORS.green}}/>
      <div style={{position:'absolute', top: 26, left: 0, right: 0, height: 3, background: EP_COLORS.green}}/>

      {/* Tent mark on right */}
      <div style={{position:'absolute', right: 30, top: 60}}>
        <EPTent size={200}/>
      </div>

      {/* Wordmark on left */}
      <div style={{position:'absolute', left: 40, top: 60, lineHeight: 0.92, fontFamily:'"Oswald", sans-serif', fontWeight: 700}}>
        <div className="ep-outline" style={{fontSize: 34, color: EP_COLORS.red, letterSpacing:'0.01em'}}>EVERYDAY</div>
        <div className="ep-outline" style={{fontSize: 34, color: EP_COLORS.red, letterSpacing:'0.01em'}}>PRODUCE</div>
        <div className="ep-outline" style={{fontSize: 34, color: EP_COLORS.red, letterSpacing:'0.01em'}}>MARKET</div>
        <div style={{marginTop: 10, fontFamily:'"Oswald", sans-serif', fontWeight: 600, fontSize: 10, letterSpacing:'0.18em', color: EP_COLORS.green}}>
          WALDO TRADITION · SINCE 1985
        </div>
      </div>

      {/* Bottom brown strip — table */}
      <div style={{position:'absolute', bottom: 0, left: 0, right: 0, height: 10, background: EP_COLORS.brown}}/>
    </div>
  );
}

function BusinessCardBack() {
  return (
    <div style={{
      width: 700, height: 400, background: EP_COLORS.red,
      position:'relative', overflow:'hidden',
      border:`1px solid ${EP_COLORS.ink}22`,
      color: EP_COLORS.cream,
    }}>
      {/* Cream stripes at top echoing tent */}
      <div style={{position:'absolute', top: 0, left: 0, right: 0, height: 12, background: EP_COLORS.cream}}/>
      <div style={{position:'absolute', top: 16, left: 0, right: 0, height: 6, background: EP_COLORS.cream}}/>
      <div style={{position:'absolute', top: 26, left: 0, right: 0, height: 3, background: EP_COLORS.cream}}/>

      {/* Contact info */}
      <div style={{position:'absolute', left: 40, top: 70, right: 40}}>
        <div className="ep-outline" style={{fontFamily:'"Oswald", sans-serif', fontWeight: 700, fontSize: 28, letterSpacing:'0.01em', lineHeight: 1}}>
          KONRAD<br/>PFEIFAUF
        </div>
        <div style={{marginTop: 10, fontFamily:'"Oswald", sans-serif', fontWeight: 500, fontSize: 11, letterSpacing:'0.2em', color: EP_COLORS.yellow}}>
          PROPRIETOR
        </div>

        <div style={{
          marginTop: 28,
          display:'grid', gridTemplateColumns:'auto 1fr', columnGap: 18, rowGap: 10,
          fontFamily:'Inter, sans-serif', fontSize: 13, alignItems:'center',
        }}>
          <div style={{fontFamily:'"Oswald", sans-serif', fontSize: 10, letterSpacing:'0.2em', color: EP_COLORS.yellow}}>CALL</div>
          <div style={{fontFamily:'"JetBrains Mono", monospace', fontSize: 14, letterSpacing:'0.04em'}}>(816) 942-6344</div>

          <div style={{fontFamily:'"Oswald", sans-serif', fontSize: 10, letterSpacing:'0.2em', color: EP_COLORS.yellow}}>VISIT</div>
          <div style={{fontFamily:'Inter, sans-serif', fontSize: 13}}>7300 Wornall Rd · Kansas City, MO 64114</div>
        </div>
      </div>

      {/* Small tent mark bottom right */}
      <div style={{position:'absolute', right: 24, bottom: 20, opacity: 0.95}}>
        <EPTent size={90}/>
      </div>

      {/* Bottom brown strip */}
      <div style={{position:'absolute', bottom: 0, left: 0, right: 0, height: 10, background: EP_COLORS.brown}}/>
    </div>
  );
}

function BusinessCardSet() {
  return (
    <div style={{display:'flex', gap: 40, padding: 40, background:'#F0EBDF', flexWrap:'wrap'}}>
      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
        <div style={{fontFamily:'"Oswald", sans-serif', fontSize: 11, color:'#6B6560', letterSpacing:'0.14em'}}>FRONT · 3.5" × 2"</div>
        <BusinessCardFront/>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
        <div style={{fontFamily:'"Oswald", sans-serif', fontSize: 11, color:'#6B6560', letterSpacing:'0.14em'}}>BACK</div>
        <BusinessCardBack/>
      </div>
    </div>
  );
}

// ---------- Web banner (homepage hero strip) ----------
function WebBanner() {
  const W = 1200, H = 360;
  return (
    <div style={{
      width: W, height: H, background: EP_COLORS.cream,
      position:'relative', overflow:'hidden',
      border:`1px solid ${EP_COLORS.ink}22`,
    }}>
      {/* Decorative stripe band left */}
      <div style={{position:'absolute', top:0, bottom:0, left: 0, width: 14, background: EP_COLORS.red}}/>
      <div style={{position:'absolute', top:0, bottom:0, left: 18, width: 6, background: EP_COLORS.green}}/>

      {/* Content grid */}
      <div style={{position:'absolute', inset: 0, paddingLeft: 60, display:'flex', alignItems:'center', justifyContent:'space-between', paddingRight: 48}}>
        <div style={{maxWidth: 620}}>
          <div style={{fontFamily:'"Oswald", sans-serif', fontWeight:600, fontSize: 14, letterSpacing:'0.22em', color: EP_COLORS.green, marginBottom: 14}}>
            WALDO · KANSAS CITY · SINCE 1985
          </div>
          <div className="ep-outline" style={{fontFamily:'"Oswald", sans-serif', fontWeight: 700, fontSize: 72, color: EP_COLORS.red, lineHeight: 0.92, letterSpacing:'0.005em'}}>
            FRESH TODAY,<br/>PICKED YESTERDAY.
          </div>
          <div style={{marginTop: 22, display:'flex', gap: 12, alignItems:'center'}}>
            <div style={{
              padding:'14px 24px', background: EP_COLORS.red, color: EP_COLORS.cream,
              fontFamily:'"Oswald", sans-serif', fontWeight: 700, fontSize: 16, letterSpacing:'0.08em', borderRadius: 2,
            }}>SEE THIS WEEK'S PRODUCE</div>
            <div style={{fontFamily:'"Oswald", sans-serif', fontWeight:500, fontSize: 13, color: EP_COLORS.ink, letterSpacing:'0.14em'}}>
              OPEN DAILY · 8AM–7PM
            </div>
          </div>
        </div>
        <div style={{flex:'0 0 auto'}}>
          <EPTent size={280}/>
        </div>
      </div>

      {/* Bottom stripe */}
      <div style={{position:'absolute', bottom: 0, left: 0, right: 0, height: 8, background: EP_COLORS.brown}}/>
    </div>
  );
}

// ---------- Social avatar (square, 512) ----------
function SocialAvatar({ size = 400 }) {
  return (
    <div style={{
      width: size, height: size, background: EP_COLORS.red,
      position:'relative', overflow:'hidden', borderRadius: 8,
    }}>
      {/* Cream circle center */}
      <div style={{
        position:'absolute', inset: size*0.08, background: EP_COLORS.cream,
        borderRadius:'50%', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap: size*0.01,
      }}>
        <EPTent size={size*0.5}/>
        <div className="ep-outline" style={{fontFamily:'"Oswald", sans-serif', fontWeight: 700, fontSize: size*0.085, color: EP_COLORS.red, lineHeight: 1, letterSpacing:'0.02em'}}>
          EVERYDAY
        </div>
        <div style={{fontFamily:'"Oswald", sans-serif', fontWeight: 700, fontSize: size*0.055, color: EP_COLORS.green, lineHeight: 1, letterSpacing:'0.05em'}}>
          PRODUCE · MARKET
        </div>
      </div>
    </div>
  );
}

// ---------- Signage / storefront mockup ----------
function SignageMockup() {
  const W = 1100, H = 620;
  return (
    <div style={{width: W, height: H, position:'relative', overflow:'hidden', background:'#D6E4E0'}}>
      {/* Sky */}
      <div style={{position:'absolute', inset: 0, background:'linear-gradient(#CCDCE0, #E5E2D4)'}}/>
      {/* Ground */}
      <div style={{position:'absolute', left:0, right:0, bottom: 0, height: 180, background:'#8A7F6C'}}/>
      {/* Storefront wall */}
      <div style={{
        position:'absolute', left: 80, right: 80, bottom: 160, height: 280,
        background: '#EFEAD8', border: `6px solid ${EP_COLORS.brown}`,
        boxShadow:'inset 0 0 0 2px rgba(0,0,0,0.06)',
      }}>
        {/* Awning: green + cream scalloped (use simple stripes) */}
        <div style={{position:'absolute', top: -40, left: -10, right: -10, height: 40, overflow:'hidden'}}>
          <div style={{height:'100%', background: `repeating-linear-gradient(90deg, ${EP_COLORS.green} 0 28px, ${EP_COLORS.cream} 28px 56px)`, borderBottom: `3px solid ${EP_COLORS.brown}`}}/>
        </div>
        {/* Big sign */}
        <div style={{
          position:'absolute', inset: 18,
          background: EP_COLORS.cream,
          border: `4px solid ${EP_COLORS.brown}`,
          display:'flex', alignItems:'center', justifyContent:'center', padding: 18, gap: 20,
        }}>
          <EPTent size={160}/>
          <div style={{textAlign:'left', lineHeight: 0.92, fontFamily:'"Oswald", sans-serif', fontWeight: 700}}>
            <div className="ep-outline" style={{fontSize: 48, color: EP_COLORS.red, letterSpacing:'0.01em'}}>EVERYDAY</div>
            <div className="ep-outline" style={{fontSize: 48, color: EP_COLORS.red, letterSpacing:'0.01em'}}>PRODUCE</div>
            <div className="ep-outline" style={{fontSize: 48, color: EP_COLORS.red, letterSpacing:'0.01em'}}>MARKET</div>
            <div style={{marginTop: 10, fontFamily:'"Oswald", sans-serif', fontWeight:600, fontSize: 14, letterSpacing:'0.18em', color: EP_COLORS.green}}>
              WALDO TRADITION · SINCE 1985
            </div>
          </div>
        </div>
      </div>

      {/* A-frame sidewalk sign */}
      <div style={{
        position:'absolute', bottom: 40, left: 120, width: 150, height: 180,
        background: EP_COLORS.cream, border: `4px solid ${EP_COLORS.brown}`,
        transform: 'perspective(600px) rotateY(-10deg)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 6, padding: 10,
      }}>
        <div className="ep-outline" style={{fontFamily:'"Oswald", sans-serif', fontWeight: 700, fontSize: 22, color: EP_COLORS.red, lineHeight: 0.95, textAlign:'center'}}>
          SWEET<br/>CORN<br/>TODAY
        </div>
        <div style={{fontFamily:'"Oswald", sans-serif', fontWeight:600, fontSize: 11, letterSpacing:'0.18em', color: EP_COLORS.green}}>
          $4 / DOZEN
        </div>
      </div>

      {/* Crates of produce on sidewalk right */}
      <div style={{position:'absolute', bottom: 40, right: 100, display:'flex', gap: 14, alignItems:'flex-end'}}>
        <div style={{width: 90, height: 80, background: EP_COLORS.brown, position:'relative', border:`2px solid ${EP_COLORS.ink}`}}>
          <div style={{position:'absolute', top: -14, left: 8, display:'flex', gap: 4}}>
            {[0,1,2].map(i => <div key={i} style={{width: 22, height: 22, borderRadius:'50%', background: EP_COLORS.red, border:`2px solid ${EP_COLORS.ink}`}}/>)}
          </div>
        </div>
        <div style={{width: 90, height: 90, background: EP_COLORS.brown, position:'relative', border:`2px solid ${EP_COLORS.ink}`}}>
          <div style={{position:'absolute', top: -14, left: 6, display:'flex', gap: 4}}>
            {[0,1,2].map(i => <div key={i} style={{width: 24, height: 24, borderRadius:'50%', background: EP_COLORS.yellow, border:`2px solid ${EP_COLORS.ink}`}}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Circle badge ----------
// Classic farmstand medallion — tent centered, wordmark curving around top,
// tagline curving around bottom, stripe ring frame.
function CircleBadge({ size = 500, mono = false, monoColor = EP_COLORS.ink }) {
  const cx = 250, cy = 250;
  const rOuter = 240;   // outer red edge
  const rRing  = 230;   // inner edge of red ring (cream band starts here — narrow ring)
  const rInner = 158;   // inner disc (tent zone)

  // Text sits in the cream band — pulled well inward, away from outer ring
  const topTextR = 200;
  const botTextR = 200;

  const bg  = mono ? '#FFFFFF' : EP_COLORS.cream;
  const red = mono ? monoColor : EP_COLORS.red;
  const grn = mono ? monoColor : EP_COLORS.green;
  const ink = mono ? monoColor : EP_COLORS.ink;

  const arcPath = (a0Deg, a1Deg, r, sweep = 1) => {
    const a0 = (a0Deg * Math.PI) / 180;
    const a1 = (a1Deg * Math.PI) / 180;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const largeArc = Math.abs(a1Deg - a0Deg) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} ${sweep} ${x1} ${y1}`;
  };

  // Curved-text stroke (matches .ep-outline rule)
  const strokeProps = mono ? {} : { stroke: ink, strokeWidth: 2, paintOrder: 'stroke fill' };

  return (
    <svg viewBox="0 0 500 500" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      <defs>
        {/* Top arc spans 200° → 340° (clockwise over the top) — gives the wordmark a wide upper sweep */}
        <path id="cb-top-arc" d={arcPath(-160, -20, topTextR, 1)} fill="none"/>
        {/* Bottom arc spans 160° → 20° going through 90° (bottom), reading upright */}
        <path id="cb-bot-arc" d={arcPath(160, 20, botTextR, 0)} fill="none"/>
      </defs>

      {/* Outer red ring */}
      <circle cx={cx} cy={cy} r={rOuter} fill={red}/>
      {/* Cream band */}
      <circle cx={cx} cy={cy} r={rRing} fill={bg}/>
      {/* Decorative rules at edges of text band */}
      <circle cx={cx} cy={cy} r={rRing - 4} fill="none" stroke={ink} strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r={rInner + 6} fill="none" stroke={ink} strokeWidth="1.5"/>
      {/* Inner disc where tent lives */}
      <circle cx={cx} cy={cy} r={rInner} fill={bg}/>

      {/* Curved wordmark — top, bigger */}
      <text fill={red} fontFamily='"Oswald", sans-serif' fontWeight="700" fontSize="32" letterSpacing="2.5" {...strokeProps}>
        <textPath href="#cb-top-arc" startOffset="50%" textAnchor="middle">
          EVERYDAY PRODUCE MARKET
        </textPath>
      </text>

      {/* Curved tagline — bottom */}
      <text fill={grn} fontFamily='"Oswald", sans-serif' fontWeight="700" fontSize="20" letterSpacing="3.5" {...strokeProps}>
        <textPath href="#cb-bot-arc" startOffset="50%" textAnchor="middle">
          WALDO TRADITION · SINCE 1985
        </textPath>
      </text>

      {/* Star separators at the sides between top/bottom text */}
      {[-1, 1].map(dir => {
        // Place at 0° (right) and 180° (left) along text radius
        const x = cx + dir * topTextR;
        const y = cy;
        return (
          <g key={dir} transform={`translate(${x}, ${y})`}>
            <polygon
              points="0,-9 2.7,-2.8 9,-2.8 4,1.1 5.9,7.7 0,3.8 -5.9,7.7 -4,1.1 -9,-2.8 -2.7,-2.8"
              fill={red} stroke={ink} strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Tent centered in inner disc — viewBox 200, scale 0.95, centered */}
      <g transform={`translate(${cx - 95}, ${cy - 95}) scale(0.95)`}>
        <EPTentInline mono={mono} monoColor={monoColor}/>
      </g>
    </svg>
  );
}

// Helper: render EPTent's SVG innards inline (same code as EPTent but returns group for nesting)
function EPTentInline({ mono = false, monoColor = EP_COLORS.ink }) {
  const C = mono
    ? { red: monoColor, redDark: monoColor, green: monoColor, greenDark: monoColor,
        yellow: monoColor, yellowDk: monoColor, brown: monoColor, brownDk: monoColor,
        cream: 'none', ink: monoColor, watermelonDark: monoColor, watermelonLt: monoColor }
    : EP_COLORS;
  const stroke = C.ink;
  const sw = 2;
  const clipId = 'cb-roof-clip-' + Math.random().toString(36).slice(2, 8);
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <polygon points="100,12 180,80 20,80"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="20" y="12" width="160" height="68" fill={mono ? 'none' : C.cream}/>
        <rect x="20" y="12" width="160" height="14" fill={C.green}/>
        <rect x="20" y="26" width="160" height="14" fill={mono ? '#FFFFFF' : C.cream}/>
        <rect x="20" y="40" width="160" height="14" fill={C.green}/>
        <rect x="20" y="54" width="160" height="14" fill={mono ? '#FFFFFF' : C.cream}/>
        <rect x="20" y="68" width="160" height="12" fill={C.green}/>
      </g>
      <polygon points="100,12 180,80 20,80" fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>

      <line x1="24" y1="80" x2="24" y2="178" stroke={C.brownDk} strokeWidth="3"/>
      <line x1="176" y1="80" x2="176" y2="178" stroke={C.brownDk} strokeWidth="3"/>
      <line x1="24" y1="80" x2="24" y2="178" stroke={stroke} strokeWidth="1"/>
      <line x1="176" y1="80" x2="176" y2="178" stroke={stroke} strokeWidth="1"/>
      <line x1="24" y1="82" x2="176" y2="82" stroke={C.brownDk} strokeWidth="2"/>

      {[
        { x: 55,  f: C.red },
        { x: 100, f: C.yellow },
        { x: 145, f: C.red },
      ].map((b, i) => (
        <g key={i}>
          <line x1={b.x} y1={80} x2={b.x} y2={92} stroke={stroke} strokeWidth="1.2"/>
          <polygon points={`${b.x-10},92 ${b.x+10},92 ${b.x+8},104 ${b.x-8},104`} fill={C.brown} stroke={stroke} strokeWidth={sw}/>
          <rect x={b.x-11} y="90" width="22" height="3" fill={C.brownDk} stroke={stroke} strokeWidth={sw}/>
          <circle cx={b.x-4} cy="89" r="2.5" fill={b.f} stroke={stroke} strokeWidth="1"/>
          <circle cx={b.x+4} cy="89" r="2.5" fill={b.f} stroke={stroke} strokeWidth="1"/>
          <circle cx={b.x}   cy="86" r="2.5" fill={b.f} stroke={stroke} strokeWidth="1"/>
        </g>
      ))}

      <rect x="24" y="138" width="152" height="8" fill={C.brown} stroke={stroke} strokeWidth={sw}/>
      <rect x="30" y="146" width="4" height="28" fill={C.brownDk} stroke={stroke} strokeWidth="1.5"/>
      <rect x="166" y="146" width="4" height="28" fill={C.brownDk} stroke={stroke} strokeWidth="1.5"/>
      <rect x="98" y="146" width="4" height="28" fill={C.brownDk} stroke={stroke} strokeWidth="1.5"/>

      <polygon points="40,128 82,128 78,138 44,138" fill={C.brown} stroke={stroke} strokeWidth={sw}/>
      <circle cx="50" cy="124" r="6" fill={C.red} stroke={stroke} strokeWidth={sw}/>
      <circle cx="61" cy="121" r="6.5" fill={C.red} stroke={stroke} strokeWidth={sw}/>
      <circle cx="72" cy="124" r="6" fill={C.red} stroke={stroke} strokeWidth={sw}/>
      <polygon points="49,119 51,116 53,119" fill={C.green} stroke={stroke} strokeWidth="1"/>
      <polygon points="60,116 62,113 64,116" fill={C.green} stroke={stroke} strokeWidth="1"/>
      <polygon points="71,119 73,116 75,119" fill={C.green} stroke={stroke} strokeWidth="1"/>

      <circle cx="118" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="132" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="146" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="160" cy="128" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="125" cy="136" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="139" cy="136" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="153" cy="136" r="7" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="132" cy="120" r="6" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="146" cy="120" r="6" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>
      <circle cx="139" cy="113" r="5.5" fill={C.yellow} stroke={stroke} strokeWidth={sw}/>

      {[{cx:70,cy:178},{cx:100,cy:182},{cx:130,cy:178}].map((w,i)=>(
        <g key={i}>
          <ellipse cx={w.cx} cy={w.cy} rx="18" ry="8" fill={C.watermelonDark} stroke={stroke} strokeWidth={sw}/>
          <path d={`M ${w.cx-14},${w.cy-2} Q ${w.cx-10},${w.cy-6} ${w.cx-6},${w.cy-2}`} fill="none" stroke={C.watermelonLt} strokeWidth="1.5"/>
          <path d={`M ${w.cx-4},${w.cy-3} Q ${w.cx},${w.cy-7} ${w.cx+4},${w.cy-3}`} fill="none" stroke={C.watermelonLt} strokeWidth="1.5"/>
          <path d={`M ${w.cx+6},${w.cy-2} Q ${w.cx+10},${w.cy-6} ${w.cx+14},${w.cy-2}`} fill="none" stroke={C.watermelonLt} strokeWidth="1.5"/>
        </g>
      ))}
    </g>
  );
}

Object.assign(window, {
  EPFaviconMark, FaviconSet, BusinessCardFront, BusinessCardBack, BusinessCardSet,
  WebBanner, SocialAvatar, SignageMockup, CircleBadge,
});
