// Variation 04 — Magazine layout · Editorial discovery
// Quieter, browsier feel for first-time visitors. Sidebar + a magazine-style
// hero (cover story + small index), then category pills, then a 3-up
// "Departments" feature spread.

function Variation04({ showSidebar = true }) {
  const railW = showSidebar ? 64 : 0;
  return (
    <div style={{ width: 1180, height: 880, background: W.paper, fontFamily: W.fontUI, color: W.ink, display: 'flex' }}>
      {showSidebar && (
        <div style={{ width: railW, borderRight: `1.5px solid ${W.lineSoft}`, padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: W.paper2 }}>
          <div style={{ fontFamily: W.font, fontSize: 13, fontWeight: 700, color: W.green, writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 0.5, padding: '4px 0' }}>FreshMart</div>
          <div style={{ width: 28, height: 1, background: W.lineSoft, margin: '6px 0' }} />
          {[['🏠', true],['🔎'],['🥬'],['📋'],['❤']].map((g, i) => (
            <div key={i} style={{ width: 40, height: 40, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              background: g[1] ? W.green : 'transparent', color: g[1] ? '#fff' : W.ink2 }}>{g[0]}</div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ width: 36, height: 36, borderRadius: 18, background: W.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.font, fontSize: 13, color: W.accent, fontWeight: 700 }}>JS</div>
        </div>
      )}

      <div style={{ flex: 1, padding: '18px 32px', overflow: 'hidden' }}>
        {/* MASTHEAD */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1.5px solid ${W.line}`, paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{ fontFamily: W.font, fontSize: 32, fontWeight: 700, color: W.green, letterSpacing: -0.5 }}>FreshMart</div>
            <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1.5 }}>VOL.IV · APR 28, 2026 · 10 MIN DELIVERY</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <SBox w={300} h={32} radius={4}>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 10px', gap: 8 }}>
                <span style={{ fontSize: 12 }}>🔎</span>
                <div style={{ fontFamily: W.fontUI, fontSize: 12, color: W.ink3, flex: 1 }}>Search…</div>
                <SPill style={{ fontSize: 9, padding: '1px 6px', borderColor: W.lineSoft }}>⌘K</SPill>
              </div>
            </SBox>
            <SPill style={{ fontSize: 12 }}>📋 Orders</SPill>
            <SPill style={{ fontSize: 12, background: W.green, borderColor: W.green, color: '#fff' }}>🛒 Cart · 2</SPill>
          </div>
        </div>

        {/* COVER STORY */}
        {(() => {
          const W_ = 1180 - railW - 64;
          const cover = W_ * 0.62;
          const index = W_ - cover - 16;
          return (
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              {/* COVER */}
              <div style={{ width: cover }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SPill style={{ fontSize: 11, color: W.green, borderColor: W.green }}>FEATURE</SPill>
                  <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1 }}>SEASON · SPRING IN YOUR BASKET</div>
                </div>
                <div style={{ fontFamily: W.font, fontSize: 56, fontWeight: 700, lineHeight: 0.98, marginTop: 8, letterSpacing: -1 }}>
                  Grocery & <span style={{ color: W.green, fontStyle: 'italic' }}>Essentials</span>,
                </div>
                <div style={{ fontFamily: W.font, fontSize: 56, fontWeight: 700, lineHeight: 0.98, letterSpacing: -1 }}>
                  delivered <span style={{ textDecoration: 'underline', textDecorationColor: W.accent, textDecorationThickness: 3, textUnderlineOffset: 6 }}>in ten minutes.</span>
                </div>
                <div style={{ fontFamily: W.fontUI, fontSize: 14, color: W.ink2, marginTop: 12, maxWidth: 520, lineHeight: 1.45 }}>
                  Fresh items picked this morning, packed by hand, and at your door before your kettle whistles. Search anything below — or browse our spring departments.
                </div>
                <SBox w={cover - 40} h={56} radius={10} style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 18px', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>🔎</span>
                    <div style={{ fontFamily: W.font, fontSize: 18, color: W.ink3, flex: 1 }}>Search for groceries, fruits, snacks…</div>
                    <SBox w={88} h={36} radius={6} fill={W.green} stroke={W.green}>
                      <div style={{ color: '#fff', fontFamily: W.fontUI, fontSize: 13, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Search</div>
                    </SBox>
                  </div>
                </SBox>
              </div>

              {/* INDEX */}
              <div style={{ width: index, borderLeft: `1.5px solid ${W.lineSoft}`, paddingLeft: 16 }}>
                <div style={{ fontFamily: W.fontMono, fontSize: 10, letterSpacing: 1.5, color: W.ink3 }}>IN THIS ISSUE</div>
                {[
                  ['01','Heirloom tomatoes are back','p.04'],
                  ['02','New: cold-pressed oils','p.07'],
                  ['03','Snacks for the long weekend','p.12'],
                  ['04','Locally-milled flours','p.15'],
                  ['05','Reader picks of the week','p.21'],
                ].map((it, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '10px 0', borderBottom: `1px dashed ${W.lineSoft}` }}>
                    <div style={{ fontFamily: W.fontMono, fontSize: 11, color: W.accent, fontWeight: 700 }}>{it[0]}</div>
                    <div style={{ fontFamily: W.font, fontSize: 16, fontWeight: 600, flex: 1 }}>{it[1]}</div>
                    <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3 }}>{it[2]}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1.5 }}>FRESHNESS</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <SPill style={{ fontSize: 10, background: W.greenSoft, borderColor: W.greenInk, color: W.greenInk, padding: '2px 8px' }}>● 10 min</SPill>
                  <SPill style={{ fontSize: 10, padding: '2px 8px' }}>14 farms</SPill>
                  <SPill style={{ fontSize: 10, padding: '2px 8px' }}>248 fresh today</SPill>
                </div>
              </div>
            </div>
          );
        })()}

        {/* CATEGORY PILLS */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: `1.5px solid ${W.line}` }}>
          <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1.5 }}>SECTIONS</div>
          {[['◆','All',true],['🥖','Bakery'],['🥚','Dairy & Eggs'],['🥬','Fruits & Veg'],['🌾','Grains'],['🥤','Snacks'],['🌶','Spices']].map((c, i) => (
            <SPill key={i} active={c[2]}><span>{c[0]}</span><span>{c[1]}</span></SPill>
          ))}
        </div>

        {/* DEPARTMENTS — 3 up */}
        <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
          {[
            { tag: 'FLASH SALE', title: 'Fruits & Veggies', sub: 'Up to 30% off · today only', cta: 'Shop now', bg: W.paper2, accent: W.accent },
            { tag: 'FREE DELIVERY', title: 'Orders above ₹299', sub: 'No surprise fees · ever', cta: 'Browse all', bg: W.green, accent: '#9bd1a3', dark: true },
            { tag: 'NEW IN', title: 'Snacks & Drinks', sub: 'Fresh arrivals every Friday', cta: 'Explore', bg: W.accentSoft, accent: W.accent },
          ].map((c, i) => (
            <SBox key={i} w={(1180 - railW - 64 - 28) / 3} h={170} radius={10} fill={c.bg} stroke={c.dark ? W.green : W.line}>
              <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: c.dark ? '#fff' : W.ink, position: 'relative' }}>
                <SPill style={{ fontSize: 10, alignSelf: 'flex-start',
                  background: c.dark ? 'rgba(255,255,255,0.15)' : '#fff',
                  borderColor: c.dark ? 'rgba(255,255,255,0.5)' : c.accent,
                  color: c.dark ? '#fff' : c.accent }}>{c.tag}</SPill>
                <SImage w={64} h={64} label="" style={{ position: 'absolute', top: 10, right: 12, opacity: 0.85 }} />
                <div>
                  <div style={{ fontFamily: W.font, fontSize: 26, fontWeight: 700, lineHeight: 1.05 }}>{c.title}</div>
                  <div style={{ fontFamily: W.fontUI, fontSize: 12, opacity: c.dark ? 0.85 : 0.7, marginTop: 4 }}>{c.sub}</div>
                  <div style={{ fontFamily: W.fontUI, fontSize: 13, fontWeight: 700, marginTop: 10, color: c.dark ? '#9bd1a3' : c.accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {c.cta} <SArrow size={12} color={c.dark ? '#9bd1a3' : c.accent} />
                  </div>
                </div>
              </div>
            </SBox>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Variation04 = Variation04;
