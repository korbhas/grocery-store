// Variation 03 — Sidebar + utility hero with delivery tracker · Recipe-led discovery
// Hero kept big but split: greeting + delivery tracker (signal-rich) on left,
// trust badges on right. Below: category pills + a "Cook tonight" recipe rail
// that auto-fills cart — a discovery vector for first-timers.

function Variation03({ showSidebar = true }) {
  const railW = showSidebar ? 64 : 0;
  return (
    <div style={{ width: 1180, height: 880, background: W.paper, fontFamily: W.fontUI, color: W.ink, position: 'relative', display: 'flex' }}>
      {showSidebar && (
        <div style={{ width: railW, borderRight: `1.5px solid ${W.lineSoft}`, padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: W.paper2 }}>
          <div style={{ fontFamily: W.font, fontSize: 13, fontWeight: 700, color: W.green, writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 0.5, padding: '4px 0' }}>FreshMart</div>
          <div style={{ width: 28, height: 1, background: W.lineSoft, margin: '6px 0' }} />
          {[['🏠', true],['🔎'],['🥬'],['📋'],['❤'],['🎟']].map((g, i) => (
            <div key={i} style={{ width: 40, height: 40, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              background: g[1] ? W.green : 'transparent', color: g[1] ? '#fff' : W.ink2 }}>{g[0]}</div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ width: 36, height: 36, borderRadius: 18, background: W.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.font, fontSize: 13, color: W.accent, fontWeight: 700 }}>JS</div>
        </div>
      )}

      <div style={{ flex: 1, padding: '20px 28px', overflow: 'hidden' }}>
        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <SBox w={460} h={42} radius={10}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 12px', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔎</span>
              <div style={{ fontFamily: W.fontUI, fontSize: 13, color: W.ink3, flex: 1 }}>Search groceries, brands, recipes…</div>
              <SPill style={{ fontSize: 10, padding: '2px 7px', borderColor: W.lineSoft }}>⌘K</SPill>
            </div>
          </SBox>
          <SPill style={{ background: W.greenSoft, borderColor: W.greenInk, color: W.greenInk }}>📍 221B Baker St</SPill>
          <div style={{ flex: 1 }} />
          <SBox w={86} h={36} radius={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, fontFamily: W.fontUI, fontSize: 13 }}>📋 Orders</div>
          </SBox>
          <SBox w={86} h={36} radius={6} fill={W.green} stroke={W.green}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, fontFamily: W.fontUI, fontSize: 13, color: '#fff' }}>🛒 Cart · 2</div>
          </SBox>
        </div>

        {/* HERO — utility split */}
        {(() => {
          const W_ = 1180 - railW - 56;
          const left = W_ * 0.58;
          const right = W_ - left - 12;
          return (
            <div style={{ display: 'flex', gap: 12 }}>
              <SBox w={left} h={230} radius={12} fill={W.green} stroke={W.green}>
                <div style={{ padding: '20px 24px', color: '#fff', height: '100%' }}>
                  <SPill style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: '#9bd1a3' }} /> Live delivery · 10 mins
                  </SPill>
                  <div style={{ fontFamily: W.font, fontSize: 36, fontWeight: 700, lineHeight: 1.05, marginTop: 10 }}>
                    Hi Jess — your fridge <span style={{ color: '#9bd1a3' }}>is one tap</span> away.
                  </div>
                  {/* delivery tracker */}
                  <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {['Picked','Packed','On the way','Delivered'].map((s, i) => {
                      const done = i <= 2;
                      const active = i === 2;
                      return (
                        <React.Fragment key={i}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${done ? '#9bd1a3' : 'rgba(255,255,255,0.4)'}`,
                              background: done ? '#9bd1a3' : 'transparent', color: done ? W.green : 'rgba(255,255,255,0.6)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.font, fontSize: 12, fontWeight: 700 }}>
                              {done ? '✓' : i + 1}
                            </div>
                            <div style={{ fontFamily: W.fontUI, fontSize: 11, opacity: active ? 1 : 0.7 }}>{s}</div>
                          </div>
                          {i < 3 && <div style={{ flex: 1, height: 1.5, background: i < 2 ? '#9bd1a3' : 'rgba(255,255,255,0.25)', marginTop: -14 }} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div style={{ fontFamily: W.fontUI, fontSize: 12, opacity: 0.85, marginTop: 14 }}>Or order something new — most items arrive in under 10 min.</div>
                </div>
              </SBox>

              {/* RIGHT trust column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: right }}>
                {[
                  ['Picked today','From 14 partner farms within 80km',W.green,W.greenSoft,'🌱'],
                  ['Cold-chain certified','Items kept at 2–4°C end-to-end',W.accent,W.accentSoft,'❄'],
                  ['Refunds, no questions','Bad apple? Tap report, we credit instantly',W.green,W.greenSoft,'↻'],
                ].map((t, i) => (
                  <SBox key={i} w={right} h={(230 - 24) / 3} radius={10} fill={t[3]}>
                    <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: '#fff', border: `1.5px solid ${t[2]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: t[2] }}>{t[4]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: W.font, fontSize: 16, fontWeight: 700, color: t[2] }}>{t[0]}</div>
                        <div style={{ fontFamily: W.fontUI, fontSize: 11, color: W.ink2, marginTop: 2, lineHeight: 1.3 }}>{t[1]}</div>
                      </div>
                    </div>
                  </SBox>
                ))}
              </div>
            </div>
          );
        })()}

        {/* CATEGORY PILLS */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1.5 }}>BROWSE BY CATEGORY</div>
          <SLine w={20} />
          {[['◆','All',true],['🥖','Bakery'],['🥚','Dairy & Eggs'],['🥬','Fruits & Veg'],['🌾','Grains'],['🥤','Snacks'],['🌶','Spices']].map((c, i) => (
            <SPill key={i} active={c[2]}><span>{c[0]}</span><span>{c[1]}</span></SPill>
          ))}
        </div>

        {/* RECIPE RAIL */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <SHeading size={22} underline>Cook tonight</SHeading>
            <div style={{ fontFamily: W.fontUI, fontSize: 12, color: W.ink2, marginTop: 4 }}>Tap a recipe → ingredients drop straight in your cart.</div>
          </div>
          <div style={{ fontFamily: W.fontUI, fontSize: 12, color: W.ink2, display: 'flex', alignItems: 'center', gap: 4 }}>Browse recipes <SArrow size={12} /></div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {[
            ['Paneer Butter Masala','25 min · 8 ingredients','₹284','Veg'],
            ['One-pot Pasta','15 min · 6 ingredients','₹212','Veg'],
            ['Sunday Brunch Box','40 min · 11 ingredients','₹468','Mixed'],
            ['Lemon Dal Tadka','20 min · 7 ingredients','₹176','Vegan'],
          ].map((r, i) => {
            const cw = (1180 - railW - 56 - 3 * 16) / 4;
            return (
              <div key={i} style={{ width: cw }}>
                <SImage w={cw} h={120} label="recipe photo" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <SPill style={{ fontSize: 10, padding: '2px 7px', borderColor: W.green, color: W.green }}>{r[3]}</SPill>
                  <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3 }}>{r[1]}</div>
                </div>
                <div style={{ fontFamily: W.font, fontSize: 16, fontWeight: 700, marginTop: 4 }}>{r[0]}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <div style={{ fontFamily: W.font, fontSize: 14, fontWeight: 700, color: W.green }}>{r[2]}</div>
                  <div style={{ fontFamily: W.fontUI, fontSize: 11, fontWeight: 600, color: W.ink, display: 'flex', alignItems: 'center', gap: 4 }}>
                    + to cart <SArrow size={10} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.Variation03 = Variation03;
