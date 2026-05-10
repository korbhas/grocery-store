// Variation 02 — Compact sidebar · Bento hero with split panels
// More dashboard-like: utility hero broken into a 2x2 bento — search,
// next delivery slot, fresh-this-hour, free-delivery progress. Categories
// row, then a "Pick your aisle" tiled grid for first-time discovery.

function Variation02({ showSidebar = true }) {
  const railW = showSidebar ? 200 : 0;
  return (
    <div style={{ width: 1180, height: 880, background: W.paper, fontFamily: W.fontUI, color: W.ink, position: 'relative', display: 'flex' }}>
      {/* WIDE SIDEBAR */}
      {showSidebar && (
        <div style={{ width: railW, borderRight: `1.5px solid ${W.lineSoft}`, padding: '18px 14px', background: W.paper2, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontFamily: W.font, fontSize: 22, color: W.green, fontWeight: 700, letterSpacing: -0.4 }}>FreshMart</div>
          </div>
          <div style={{ fontFamily: W.fontMono, fontSize: 9, color: W.ink3, letterSpacing: 1.5, marginTop: 6 }}>SHOP</div>
          {[['🏠','Home', true],['🆕','New arrivals'],['💚','Favorites'],['🎟','Offers']].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6,
              background: it[2] ? W.green : 'transparent', color: it[2] ? '#fff' : W.ink, fontFamily: W.fontUI, fontSize: 14 }}>
              <span style={{ fontSize: 14 }}>{it[0]}</span>{it[1]}
            </div>
          ))}
          <div style={{ fontFamily: W.fontMono, fontSize: 9, color: W.ink3, letterSpacing: 1.5, marginTop: 12 }}>YOU</div>
          {[['📋','Orders'],['🔁','Reorder'],['📅','Schedule'],['👤','Account']].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', fontFamily: W.fontUI, fontSize: 14, color: W.ink2 }}>
              <span style={{ fontSize: 14 }}>{it[0]}</span>{it[1]}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <SBox w={railW - 28} h={84} radius={8} fill={W.accentSoft} stroke={W.accent}>
            <div style={{ padding: 10 }}>
              <div style={{ fontFamily: W.font, fontSize: 14, fontWeight: 700, color: W.accent }}>Refer a friend</div>
              <div style={{ fontFamily: W.fontUI, fontSize: 11, color: W.ink2, marginTop: 4, lineHeight: 1.3 }}>Both get ₹100 off your next order.</div>
              <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.accent, marginTop: 6, fontWeight: 700 }}>SHARE LINK →</div>
            </div>
          </SBox>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, padding: '18px 24px', overflow: 'hidden' }}>
        {/* TOP BAR — slim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <SHeading size={26}>Good evening, Jess <span style={{ color: W.accent }}>·</span></SHeading>
          <SPill style={{ background: W.greenSoft, borderColor: W.greenInk, color: W.greenInk }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: W.greenInk }} /> 10 min to your door
          </SPill>
          <div style={{ flex: 1 }} />
          <SBox w={36} h={36} radius={18}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>📋</div></SBox>
          <div style={{ position: 'relative' }}>
            <SBox w={36} h={36} radius={18}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🛒</div></SBox>
            <div style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: 8, background: W.accent, color: '#fff', fontFamily: W.font, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
          </div>
        </div>

        {/* BENTO HERO 2x2 */}
        {(() => {
          const W_ = 1180 - railW - 48;
          const big = W_ * 0.62;
          const small = W_ - big - 12;
          return (
            <div style={{ display: 'flex', gap: 12 }}>
              {/* LEFT: big search panel */}
              <SBox w={big} h={250} radius={12} fill={W.green} stroke={W.green}>
                <div style={{ padding: '20px 24px', color: '#fff', height: '100%' }}>
                  <div style={{ fontFamily: W.fontMono, fontSize: 10, opacity: 0.7, letterSpacing: 1.5 }}>SEARCH ANYTHING</div>
                  <div style={{ fontFamily: W.font, fontSize: 38, fontWeight: 700, lineHeight: 1.05, marginTop: 4 }}>
                    Type it. <span style={{ color: '#9bd1a3' }}>Get it.</span>
                  </div>
                  <div style={{ fontFamily: W.fontUI, fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    "milk", "weekend basics", or even a recipe link.
                  </div>
                  <SBox w={big - 48} h={50} radius={10} fill="#fff" stroke="#fff" style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 14px', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>🔎</span>
                      <div style={{ fontFamily: W.fontUI, fontSize: 14, color: W.ink3, flex: 1 }}>Search groceries, brands, recipes…</div>
                      <SPill style={{ fontSize: 10, padding: '3px 8px', borderColor: W.lineSoft }}>⌘K</SPill>
                    </div>
                  </SBox>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, alignItems: 'center' }}>
                    <span style={{ fontFamily: W.fontUI, fontSize: 11, opacity: 0.7 }}>Popular:</span>
                    {['bananas','greek yogurt','olive oil','dosa batter'].map((t) => (
                      <SPill key={t} style={{ fontSize: 11, color: '#fff', borderColor: 'rgba(255,255,255,0.45)' }}>{t}</SPill>
                    ))}
                  </div>
                </div>
              </SBox>

              {/* RIGHT: 2 stacked panels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* fresh-this-hour */}
                <SBox w={small} h={119} radius={12}>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: W.green }} />
                      <div style={{ fontFamily: W.fontMono, fontSize: 9, letterSpacing: 1.5, color: W.green }}>FRESH THIS HOUR</div>
                    </div>
                    <div style={{ fontFamily: W.font, fontSize: 24, fontWeight: 700, marginTop: 4, lineHeight: 1 }}>248 items just in</div>
                    <div style={{ fontFamily: W.fontUI, fontSize: 12, color: W.ink2, marginTop: 4 }}>From 14 local farms · arrived 6:42am</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {['🍅','🥬','🥕','🥒','🌶','🥔'].map((e, i) => (
                        <div key={i} style={{ width: 24, height: 24, borderRadius: 12, background: W.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{e}</div>
                      ))}
                    </div>
                  </div>
                </SBox>
                {/* free delivery progress */}
                <SBox w={small} h={119} radius={12} fill={W.accentSoft} stroke={W.accent}>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontFamily: W.fontMono, fontSize: 9, letterSpacing: 1.5, color: W.accent }}>FREE DELIVERY AT ₹299</div>
                    <div style={{ fontFamily: W.font, fontSize: 22, fontWeight: 700, marginTop: 4 }}>You're ₹84 away 🚀</div>
                    <SBox w={small - 28} h={10} radius={5} style={{ marginTop: 10 }} fill="#fff">
                      <div style={{ position: 'absolute', inset: 1, borderRadius: 4, background: `linear-gradient(90deg, ${W.accent} 0%, ${W.accent} 72%, transparent 72%)`, opacity: 0.85 }} />
                    </SBox>
                    <div style={{ fontFamily: W.fontUI, fontSize: 11, color: W.ink2, marginTop: 6 }}>₹215 / ₹299 · 3 items in cart</div>
                  </div>
                </SBox>
              </div>
            </div>
          );
        })()}

        {/* CATEGORY PILLS */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[['◆','All',true],['🥖','Bakery'],['🥚','Dairy & Eggs'],['🥬','Fruits & Veg'],['🌾','Grains & Staples'],['🥤','Snacks'],['🌶','Spices'],['🧴','Household'],['🍫','Sweets']].map((c, i) => (
            <SPill key={i} active={c[2]}><span>{c[0]}</span><span>{c[1]}</span></SPill>
          ))}
        </div>

        {/* AISLE TILES */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <SHeading size={20} underline>Pick your aisle</SHeading>
          <div style={{ fontFamily: W.fontUI, fontSize: 12, color: W.ink3 }}>· 9 sections, 1,200+ items</div>
        </div>
        {(() => {
          const cols = 6;
          const W_ = 1180 - railW - 48;
          const tw = (W_ - (cols - 1) * 10) / cols;
          const tiles = [
            ['🥬','Fruits & Veg','280+ items', W.greenSoft],
            ['🥖','Bakery','fresh @5am', W.accentSoft],
            ['🥚','Dairy & Eggs','farm direct', W.greenSoft],
            ['🌾','Grains','staples', '#f0e9da'],
            ['🌶','Spices','whole / ground', W.accentSoft],
            ['🥤','Snacks','new every wk', W.greenSoft],
          ];
          return (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {tiles.map((t, i) => (
                <SBox key={i} w={tw} h={120} radius={10} fill={t[3]}>
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div style={{ fontSize: 28 }}>{t[0]}</div>
                    <div>
                      <div style={{ fontFamily: W.font, fontSize: 16, fontWeight: 700 }}>{t[1]}</div>
                      <div style={{ fontFamily: W.fontMono, fontSize: 9, color: W.ink2, marginTop: 2 }}>{t[2]}</div>
                    </div>
                  </div>
                </SBox>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

window.Variation02 = Variation02;
