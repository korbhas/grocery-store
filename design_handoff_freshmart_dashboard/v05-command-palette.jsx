// Variation 05 — Command palette-led · Sidebar + minimal hero
// Search-as-conversation: dominant centered command palette as the hero.
// Sidebar has full nav. Below: small trust strip, then category pills,
// then a "Trending right now" rail.

function Variation05({ showSidebar = true }) {
  const railW = showSidebar ? 220 : 0;
  return (
    <div style={{ width: 1180, height: 880, background: W.paper, fontFamily: W.fontUI, color: W.ink, display: 'flex' }}>
      {showSidebar && (
        <div style={{ width: railW, borderRight: `1.5px solid ${W.lineSoft}`, padding: '18px 14px', background: W.paper2, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ fontFamily: W.font, fontSize: 22, color: W.green, fontWeight: 700, letterSpacing: -0.4 }}>FreshMart</div>
          </div>
          <SBox w={railW - 28} h={32} radius={6}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 10px', gap: 6 }}>
              <span style={{ fontSize: 11 }}>🔎</span>
              <div style={{ fontFamily: W.fontUI, fontSize: 12, color: W.ink3, flex: 1 }}>Quick find…</div>
              <SPill style={{ fontSize: 9, padding: '1px 5px', borderColor: W.lineSoft }}>⌘K</SPill>
            </div>
          </SBox>
          <div style={{ fontFamily: W.fontMono, fontSize: 9, color: W.ink3, letterSpacing: 1.5, marginTop: 12 }}>SHOP</div>
          {[['🏠','Home', true],['🆕','New'],['🎟','Offers']].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6,
              background: it[2] ? W.green : 'transparent', color: it[2] ? '#fff' : W.ink, fontFamily: W.fontUI, fontSize: 13 }}>
              <span>{it[0]}</span>{it[1]}
            </div>
          ))}
          <div style={{ fontFamily: W.fontMono, fontSize: 9, color: W.ink3, letterSpacing: 1.5, marginTop: 12 }}>CATEGORIES</div>
          {[['🥬','Fruits & Veg','280'],['🥖','Bakery','64'],['🥚','Dairy & Eggs','110'],['🌾','Grains','92'],['🌶','Spices','58'],['🥤','Snacks','176']].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', fontFamily: W.fontUI, fontSize: 13, color: W.ink2 }}>
              <span>{it[0]}</span><span style={{ flex: 1 }}>{it[1]}</span><span style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3 }}>{it[2]}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderTop: `1px dashed ${W.lineSoft}`, marginTop: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: W.accentSoft, color: W.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: W.font, fontSize: 11, fontWeight: 700 }}>JS</div>
            <div style={{ fontFamily: W.fontUI, fontSize: 12 }}>Jess Singh</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: '20px 32px', display: 'flex', flexDirection: 'column' }}>
        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SPill style={{ background: W.greenSoft, borderColor: W.greenInk, color: W.greenInk }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: W.greenInk }} /> Delivering in 10 min · 221B Baker
          </SPill>
          <div style={{ flex: 1 }} />
          <SBox w={92} h={36} radius={6}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, fontFamily: W.fontUI, fontSize: 13 }}>📋 Orders</div></SBox>
          <SBox w={92} h={36} radius={6} fill={W.green} stroke={W.green}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, fontFamily: W.fontUI, fontSize: 13, color: '#fff' }}>🛒 Cart · 2</div></SBox>
        </div>

        {/* BIG CENTER COMMAND PALETTE */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <SHeading size={20} style={{ color: W.ink2 }}>Hi Jess — what do you need?</SHeading>
          <div style={{ fontFamily: W.font, fontSize: 56, fontWeight: 700, marginTop: 6, lineHeight: 1, letterSpacing: -1 }}>
            Just <span style={{ color: W.green }}>type it.</span>
          </div>
          <div style={{ fontFamily: W.fontUI, fontSize: 14, color: W.ink2, marginTop: 8 }}>An ingredient, a dish, "weekly basics", or even paste a recipe URL.</div>

          {/* PALETTE */}
          <SBox w={720} h={64} radius={14} style={{ marginTop: 20, boxShadow: '0 6px 0 rgba(31,77,52,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 20px', gap: 14 }}>
              <span style={{ fontSize: 20 }}>🔎</span>
              <div style={{ fontFamily: W.font, fontSize: 20, color: W.ink3, flex: 1, textAlign: 'left' }}>Search for groceries, fruits, snacks…</div>
              <SPill style={{ fontSize: 11, padding: '3px 9px', borderColor: W.lineSoft }}>⌘K</SPill>
              <SBox w={86} h={40} radius={8} fill={W.green} stroke={W.green}>
                <div style={{ color: '#fff', fontFamily: W.fontUI, fontSize: 14, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Search</div>
              </SBox>
            </div>
          </SBox>

          {/* PALETTE PEEK — preview of dropdown */}
          <SBox w={720} h={172} radius={14} style={{ marginTop: 6 }}>
            <div style={{ padding: '10px 14px', textAlign: 'left' }}>
              <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1.5 }}>SUGGESTIONS</div>
              {[
                ['🥬','Spinach · 500g','₹40','Picked today'],
                ['📋','Reorder last week’s basics','12 items','one tap'],
                ['🍝','Recipe: One-pot Pasta','15 min','+8 ingredients to cart'],
                ['🌶','Chilli powder · 100g','₹35','Ground in-house'],
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 6px', borderRadius: 6,
                  background: i === 0 ? W.greenSoft : 'transparent' }}>
                  <span style={{ fontSize: 16 }}>{s[0]}</span>
                  <div style={{ fontFamily: W.fontUI, fontSize: 14, fontWeight: i === 0 ? 700 : 500, flex: 1 }}>{s[1]}</div>
                  <div style={{ fontFamily: W.fontMono, fontSize: 11, color: W.ink2 }}>{s[2]}</div>
                  <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, width: 130, textAlign: 'right' }}>{s[3]}</div>
                </div>
              ))}
            </div>
          </SBox>
        </div>

        {/* CATEGORY PILLS + TRENDING */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: W.fontMono, fontSize: 10, color: W.ink3, letterSpacing: 1.5 }}>OR JUST BROWSE</div>
          <SLine w={20} />
          {[['◆','All',true],['🥖','Bakery'],['🥚','Dairy'],['🥬','Fruits & Veg'],['🥤','Snacks'],['🌶','Spices']].map((c, i) => (
            <SPill key={i} active={c[2]}><span>{c[0]}</span><span>{c[1]}</span></SPill>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Variation05 = Variation05;
