// Variation 01 — Sidebar app shell · Hero search-first
// Sticky icon-rail sidebar (collapsible), dominant search hero, kept utility
// hero with delivery + freshness signals, horizontal category pills, then a
// "Discover" rail of products for first-time browsers.

function Variation01({ showSidebar = true }) {
  const railW = showSidebar ? 56 : 0;
  return (
    <div style={{ width: 1180, height: 880, background: W.paper, fontFamily: W.fontUI, color: W.ink, position: 'relative', display: 'flex' }}>
      {/* SIDEBAR RAIL */}
      {showSidebar && (
        <div style={{ width: railW, borderRight: `1.5px solid ${W.lineSoft}`, padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, background: W.paper2 }}>
          <div style={{ fontFamily: W.font, fontSize: 13, fontWeight: 700, color: W.green, writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 0.5, padding: '4px 0' }}>FreshMart</div>
          <div style={{ width: 24, height: 1, background: W.lineSoft, margin: '4px 0' }} />
          {['🏠','🔎','❤','📋','🎟','⚙'].map((g, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i === 0 ? W.green : 'transparent', color: i === 0 ? '#fff' : W.ink2, fontSize: 13, fontFamily: W.fontMono }}>{g}</div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: W.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.font, fontSize: 12, color: W.accent, fontWeight: 700 }}>JS</div>
        </div>
      )}

      {/* MAIN COLUMN */}
      <div style={{ flex: 1, padding: '20px 28px', overflow: 'hidden' }}>
        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <SBox w={220} h={36} radius={6}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 12px', gap: 8 }}>
              <span style={{ fontSize: 12 }}>📍</span>
              <div>
                <div style={{ fontSize: 10, color: W.ink3, fontFamily: W.fontMono, lineHeight: 1 }}>DELIVER TO</div>
                <div style={{ fontSize: 13, color: W.ink, fontFamily: W.fontUI, marginTop: 2 }}>221B Baker St · 10 min</div>
              </div>
            </div>
          </SBox>
          <div style={{ flex: 1 }} />
          <SPill style={{ background: W.greenSoft, borderColor: W.greenInk, color: W.greenInk }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: W.greenInk }} /> Live · 10 min
          </SPill>
          <SBox w={88} h={36} radius={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, fontFamily: W.fontUI, fontSize: 13 }}>
              <span>📦</span> Orders
            </div>
          </SBox>
          <div style={{ position: 'relative' }}>
            <SBox w={88} h={36} radius={6} fill={W.green} stroke={W.green}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, fontFamily: W.fontUI, fontSize: 13, color: '#fff' }}>
                <span>🛒</span> Cart
              </div>
            </SBox>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, background: W.accent, color: '#fff', fontFamily: W.font, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
          </div>
        </div>

        {/* HERO — search-led */}
        <SBox w={1100 - railW} h={210} radius={10} fill={W.green} stroke={W.green}>
          <div style={{ padding: '22px 28px', color: '#fff', height: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: W.fontUI, fontSize: 13, opacity: 0.9 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9bd1a3' }} />
              Fresh today · 248 items added this morning
            </div>
            <div style={{ fontFamily: W.font, fontSize: 44, fontWeight: 700, marginTop: 6, lineHeight: 1.05 }}>
              What are you cooking <span style={{ color: '#9bd1a3' }}>tonight?</span>
            </div>
            <div style={{ fontFamily: W.fontUI, fontSize: 14, opacity: 0.85, marginTop: 4 }}>
              Search anything — ingredient, recipe, or "weekly groceries"
            </div>

            {/* BIG SEARCH */}
            <SBox w={1100 - railW - 56} h={56} radius={10} fill="#fff" stroke="#fff" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 18px', gap: 12 }}>
                <span style={{ fontSize: 18 }}>🔎</span>
                <div style={{ fontFamily: W.fontUI, fontSize: 16, color: W.ink3 }}>Search "tomatoes", "weekend brunch", or paste a recipe…</div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <SPill style={{ fontSize: 11, padding: '3px 9px', borderColor: W.lineSoft }}>⌘K</SPill>
                </div>
                <SBox w={92} h={36} radius={6} fill={W.ink} stroke={W.ink}>
                  <div style={{ color: '#fff', fontFamily: W.fontUI, fontSize: 13, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Search</div>
                </SBox>
              </div>
            </SBox>

            {/* quick suggestions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span style={{ fontFamily: W.fontUI, fontSize: 12, opacity: 0.7, alignSelf: 'center' }}>Try:</span>
              {['milk','eggs','weekly basics','iftar essentials','party snacks'].map((t) => (
                <SPill key={t} style={{ fontSize: 12, color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>{t}</SPill>
              ))}
            </div>
          </div>
        </SBox>

        {/* TRUST STRIP */}
        <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
          {[
            { k: '10 min', v: 'avg delivery', dot: W.green },
            { k: 'Picked today', v: 'fruit & veg from local farms', dot: W.accent },
            { k: 'Free over ₹299', v: 'no surprise fees', dot: W.green },
            { k: '4.8 ★', v: '12k reviews', dot: W.accent },
          ].map((t, i) => (
            <SBox key={i} w={(1100 - railW - 36) / 4} h={56} radius={6}>
              <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: t.dot }} />
                <div>
                  <div style={{ fontFamily: W.font, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{t.k}</div>
                  <div style={{ fontFamily: W.fontUI, fontSize: 11, color: W.ink2, marginTop: 2 }}>{t.v}</div>
                </div>
              </div>
            </SBox>
          ))}
        </div>

        {/* CATEGORY PILLS */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1.5 }}>BROWSE</div>
          <SLine w={20} />
          {[
            ['◆','All', true], ['🥖','Bakery'], ['🥚','Dairy & Eggs'], ['🥬','Fruits & Veg'], ['🌾','Grains'], ['🥤','Snacks'], ['🌶','Spices'],
          ].map((c, i) => (
            <SPill key={i} active={c[2]}>
              <span>{c[0]}</span><span>{c[1]}</span>
            </SPill>
          ))}
        </div>

        {/* DISCOVER RAIL */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <SHeading size={22} underline>New this week</SHeading>
          <div style={{ fontFamily: W.fontUI, fontSize: 12, color: W.ink2, display: 'flex', alignItems: 'center', gap: 4 }}>
            See all <SArrow size={12} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
          {[
            ['Heirloom tomatoes','₹89 / 500g','Local farm'],
            ['Sourdough loaf','₹140','Baked at 5am'],
            ['Greek yogurt','₹110','Made in-house'],
            ['Cold-pressed oil','₹420','Single origin'],
            ['Mixed greens','₹70','Picked today'],
          ].map((p, i) => {
            const cw = (1100 - railW - 4 * 18) / 5;
            return (
              <div key={i} style={{ width: cw }}>
                <SImage w={cw} h={110} label="product photo" />
                <div style={{ fontFamily: W.fontUI, fontSize: 13, fontWeight: 600, marginTop: 8 }}>{p[0]}</div>
                <div style={{ fontFamily: W.fontMono, fontSize: 9, color: W.ink3, marginTop: 2 }}>{p[2]}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <div style={{ fontFamily: W.font, fontSize: 16, fontWeight: 700, color: W.green }}>{p[1]}</div>
                  <div style={{ width: 24, height: 24, borderRadius: 12, border: `1.5px solid ${W.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.font, fontWeight: 700, fontSize: 14, lineHeight: 1 }}>+</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.Variation01 = Variation01;
