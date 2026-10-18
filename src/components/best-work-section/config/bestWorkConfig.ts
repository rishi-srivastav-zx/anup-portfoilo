/**
 * Central configuration file for Section 04 — Best Work (Delhi Metro Career Transit System).
 * Extracted 1:1 from https://bajkamalsingh.me/ without changing any design or copy.
 */

export interface OriginInstructionItem {
  badgeBg: string;
  badgeText: string;
  titleColor: string;
  descColor: string;
  titleFont: string;
  titleSize: string;
  descSize: string;
  title: string;
  description: string;
  iconSvgPath: string;
}

export interface ProjectConfig {
  id: string;
  client: string;
  name: string;
  stationName: string;
  tags: string[];
  stat: string;
  bg: string;
  text: string;
  sysId: string;
  summary: string;
  points: string[];
  metrics: [string, string, string];
  metricLabels: [string, string, string];
  keyword: string;
  customHTML: string;
  logo?: string;
  logoClass?: string;
}

export interface TransitStationConfig {
  isOrigin?: boolean;
  id?: string;
  client?: string;
  name: string;
  stationName: string;
  tags?: string[];
  stat: string;
  bg?: string;
  text?: string;
  sysId?: string;
  summary: string;
  points: string[];
  metrics: [string, string, string];
  metricLabels: [string, string, string];
  keyword: string;
  customHTML?: string;
}

export interface BestWorkConfig {
  theme: {
    beige: string;
    blue: string;
    navy: string;
  };
  sectionHeader: {
    badge: string;
    titleFirstWord: string;
    titleSecondWord: string;
  };
  routeBoard: {
    boardBg: string;
    dmrcStations: string[];
    dummyStationsList: string[];
    originLabel: string;
  };
  welcomeDoors: {
    hindiHeadingLine1: string;
    hindiHeadingLine2: string;
    englishSubtitle: string;
    enterButtonText: string;
  };
  originStation: TransitStationConfig & {
    instructions: OriginInstructionItem[];
  };
  train: {
    graffitiText: string;
    bodyLabel: string;
    secondaryAnnouncements: string[];
    stepOutLine1: string;
    stepOutLine2: string;
    returnButtonText: string;
  };
  platform: {
    leftPrimary: string;
    leftSeparator: string;
    leftSecondary: string;
    rightCautionPrefix: string;
    rightCautionHighlight: string;
  };
  projects: ProjectConfig[];
}

        function buildFlow() {
          const N: Record<string, any> = {
            nc: { cx: 450, y: 40, w: 220, h: 44, t: 'start', lb: ['NEW CUSTOMER'] },
            reg: { cx: 450, y: 120, w: 240, h: 44, t: 'main', lb: ['Registration / Sign-up'] },
            welc: { cx: 450, y: 200, w: 560, h: 70, t: 'email', lb: ['T+0 (Immediate)', 'Welcome Email + Brand Story + Most Loved Products'], nt: 'Carousel of models wearing SINS drips & short tagline. Based on Gender & Age.' },
            left: { cx: 160, y: 340, w: 240, h: 46, t: 'branch', lb: ['Customer left the site'] },
            expl: { cx: 620, y: 340, w: 280, h: 46, t: 'main', lb: ['Explored Pages / Products'] },
            l_24: { cx: 160, y: 440, w: 280, h: 70, t: 'email', lb: ['T+24H', '"Someone in your city just bought X product"'], nt: 'Location-based trigger' },
            l_end: { cx: 160, y: 560, w: 280, h: 30, t: 'exit2', lb: ['→ Move to Old Customer sequence'] },
            noadd: { cx: 440, y: 440, w: 160, h: 46, t: 'branch', lb: ["Didn't add"] },
            cart: { cx: 820, y: 440, w: 180, h: 46, t: 'branch', lb: ['Added to Cart'] },
            b2h: { cx: 380, y: 560, w: 340, h: 90, t: 'email', lb: ['B + 2H', '"You forgot me, but I am still', 'thinking about you" + Moodboard'], nt: 'Moodboard: Ways to style with clothes they likely own' },
            b24h: { cx: 380, y: 720, w: 340, h: 70, t: 'email', lb: ['B + 24H', 'Hot selling/Vibe based creative', 'Free delivery for next 24H'], nt: 'Based on product browsed' },
            bend: { cx: 380, y: 840, w: 160, h: 40, t: 'exit', lb: ['Campaign Exits'] },
            cout: { cx: 680, y: 560, w: 180, h: 46, t: 'branch', lb: ['Checked Out'] },
            ncout: { cx: 960, y: 560, w: 220, h: 46, t: 'branch', lb: ["Didn't check out"] },
            d0: { cx: 680, y: 660, w: 280, h: 70, t: 'email', lb: ['D + 0', 'Elite taste validation + Receipt', '+ Tracking information'] },
            deliv: { cx: 680, y: 770, w: 140, h: 44, t: 'main', lb: ['Delivery'] },
            e48: { cx: 680, y: 860, w: 280, h: 70, t: 'email', lb: ['E + 48H', 'Fit Check + Feedback', '+ Instagram Story push'] },
            e20: { cx: 680, y: 970, w: 280, h: 60, t: 'email', lb: ['E + 20 Days', 'Product recommendation matching item'] },
            e25: { cx: 680, y: 1070, w: 280, h: 70, t: 'email', lb: ['E + 25 Days', '"10% Off + 50+20 Credits" combo', 'with a 12-hour countdown'] },
            eend: { cx: 680, y: 1180, w: 280, h: 30, t: 'exit2', lb: ['→ Move to Old Customer sequence'] },
            c1h: { cx: 980, y: 660, w: 320, h: 70, t: 'email', lb: ['C + 1H', '"I guess your crush texted you,', 'that\'s why you left me on seen"'] },
            c24: { cx: 980, y: 770, w: 320, h: 70, t: 'email', lb: ['C + 24H', '"10% Off + 50 Credits" combo', 'with a 12-hour countdown'] },
            c48: { cx: 980, y: 880, w: 320, h: 70, t: 'email', lb: ['C + 48H', '"Your bag is about to be stolen"', 'in next 2 hours.'] },
            ccout: { cx: 860, y: 1000, w: 160, h: 46, t: 'branch', lb: ['Checked out'] },
            ccout_n: { cx: 860, y: 1070, w: 260, h: 30, t: 'exit2', lb: ['→ Move to Checked out sequence'] },
            cnc: { cx: 1100, y: 1000, w: 200, h: 46, t: 'branch', lb: ["Didn't check out"] },
            cnc_end: { cx: 1100, y: 1080, w: 180, h: 40, t: 'exit', lb: ['Campaign Exits'] }
          };

          const E=[
            ['nc', 'reg'], ['reg', 'welc'], 
            ['welc', 'left'], ['welc', 'expl'],
            ['left', 'l_24'], ['l_24', 'l_end'],
            ['expl', 'noadd'], ['expl', 'cart'],
            ['noadd', 'b2h'], ['b2h', 'b24h'], ['b24h', 'bend'],
            ['cart', 'cout'], ['cart', 'ncout'],
            ['cout', 'd0'], ['d0', 'deliv'], ['deliv', 'e48'], ['e48', 'e20'], ['e20', 'e25'], ['e25', 'eend'],
            ['ncout', 'c1h'], ['c1h', 'c24'], ['c24', 'c48'],
            ['c48', 'ccout'], ['c48', 'cnc'],
            ['ccout', 'ccout_n'], ['cnc', 'cnc_end']
          ];

          const TC: Record<string, any> = {
            start: {f:'var(--text-color)', s:'var(--text-color)', c:'var(--bg-color)', fw:'900', fs:'14'},
            main:  {f:'transparent', s:'var(--text-color)', c:'var(--text-color)', fw:'900', fs:'13'},
            email: {f:'var(--bg-color)', s:'var(--text-color)', c:'var(--text-color)', fw:'800', fs:'12'},
            branch:{f:'var(--text-color)', s:'var(--text-color)', c:'var(--bg-color)', fw:'900', fs:'13'},
            exit:  {f:'transparent', s:'var(--text-color)', c:'var(--text-color)', fw:'900', fs:'12', d:'8,4'},
            exit2: {f:'transparent', s:'transparent', c:'var(--text-color)', fw:'900', fs:'12'},
          };

          let eS='', nS='';

          for(const[a,b] of E){
            const na = N[a], nb = N[b];
            const x1 = na.cx, y1 = na.y + na.h, x2 = nb.cx, y2 = nb.y;
            const my = (y1 + y2) / 2;
            
            eS += `<path d="M${x1},${y1} L${x1},${my} L${x2},${my} L${x2},${y2}" fill="none" stroke="var(--text-color)" stroke-width="4" stroke-linejoin="round" marker-end="url(#fa)"/>`;
          }

          for(const[id,n] of Object.entries(N)){
            const c = TC[n.t];
            const lh = 18; 
            const lines = n.lb;
            const totalH = (lines.length - 1) * lh;
            const firstY = n.y + (n.h / 2) - (totalH / 2) + 5;

            const rx = n.cx - (n.w / 2);
            
            nS += `<rect x="${rx}" y="${n.y}" width="${n.w}" height="${n.h}" fill="${c.f}" stroke="${c.s}" stroke-width="4"${c.d ? ` stroke-dasharray="${c.d}"` : ''}/>`;
            
            nS += `<text text-anchor="middle" font-family="DM Sans, sans-serif" font-size="${c.fs}" font-weight="${c.fw}" fill="${c.c}">`;
            lines.forEach((l: string, i: number) => {
                nS += `<tspan x="${n.cx}" y="${firstY + i * lh}">${l}</tspan>`;
            });
            nS += `</text>`;
            
            if (n.nt) {
                nS += `<text x="${n.cx}" y="${n.y + n.h + 18}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="10" font-weight="700" fill="var(--text-color)" opacity="0.6">${n.nt}</text>`;
            }
          }

          return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1250 1250" width="100%" height="auto" style="display:block; min-width:850px;">
            <defs>
              <marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-color)"/>
              </marker>
            </defs>
            ${eS}${nS}
          </svg>`;
        }

        const cachedFlowSVG = buildFlow();

        const inventoryData: any[] = [
            { 
                id: 'Krishna Shukla', client: 'Krishna Shukla', tags: ['Identity Content', 'Comedy Business'], stat: '₹4.4L Revenue', bg: '#F4EFE6', text: '#051024', sysId: '01',
                customHTML: `
                <div class="brutal-wrap" style="--bg-color: #F4EFE6; --text-color: #051024;">
                    <div class="reveal-blur">
                        <span class="brutal-overline">Freelance · Brand & Business Manager</span>
                        <h1 class="brutal-title">KRISHNA SHUKLA</h1>
                        <div class="brutal-sub">Stand-up artist, Delhi · 130K+ Instagram followers</div>
                        <div class="brutal-tags">
                            <span class="brutal-tag">Content Strategy</span>
                            <span class="brutal-tag">Creator Economy</span>
                            <span class="brutal-tag">Touring Business</span>
                        </div>
                    </div>

                    <div class="brutal-hook reveal-text">
                        <span class="brutal-overline mb-3 block" style="font-size: 0.85rem; letter-spacing: 0.1em; opacity: 0.8;">THE PROBLEM</span>
                        186M views. Zero revenue infrastructure.<br/>
                        <span class="font-['DM_Sans'] font-[400] text-xl md:text-3xl tracking-tight mt-2 inline-block mb-4">The attention existed. The business didn't.</span>
                        <div class="font-['Schoolbell'] text-xs uppercase tracking-widest opacity-80 space-y-1">
                            <div>— Trapped in a local echo chamber</div>
                            <div>— Passive viewers who rarely shared</div>
                            <div>— Limited to unscalable, ad-hoc college gigs</div>
                        </div>
                    </div>

                    <div class="brutal-grid-3 reveal-blur" style="transition-delay: 0.2s;">
                        <div class="brutal-grid-item">
                            <div class="brutal-num">01</div>
                            <div class="brutal-item-title text-xl">Identity based Content</div>
                            <div class="brutal-item-desc">Shifted to highly relatable, POV-driven identity content to acquire cold audiences aggressively.</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-num">02</div>
                            <div class="brutal-item-title text-xl">Virality Engine</div>
                            <div class="brutal-item-desc">Achieved <strong class="text-[var(--text-color)] font-bold">3x Loop Rate</strong> & <strong class="text-[var(--text-color)] font-bold">1:3 Share-to-Like</strong> - turning viewers into distributors.</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-num">03</div>
                            <div class="brutal-item-title text-xl">Touring IP</div>
                            <div class="brutal-item-desc">Operationalized <strong class="text-[var(--text-color)] font-bold">40+ shows</strong> across Delhi, Jaipur, Lucknow & Goa with repeatable logistics.</div>
                        </div>
                    </div>

                    <!-- Enhanced Editorial Phone Ecosystem Section -->
                    <div class="relative w-full mt-24 mb-32 py-16 flex flex-col items-center justify-center overflow-visible reveal-blur">
                        
                        <!-- Giant background text to kill negative space -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden mix-blend-color-burn">
                            <span class="font-['Bebas_Neue'] text-[35vw] text-[#051024] leading-none whitespace-nowrap tracking-tighter">ECOSYSTEM</span>
                        </div>

                        <!-- Central staging platform/grid for the phones -->
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-[80%] h-[90%] border-2 border-[#051024]/10 bg-[rgba(5,16,36,0.015)] z-0 rounded-3xl overflow-hidden" style="background-image: radial-gradient(rgba(5,16,36,0.1) 1px, transparent 1px); background-size: 24px 24px;">
                            <!-- Accent crosshairs -->
                            <div class="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#051024]/30"></div>
                            <div class="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#051024]/30"></div>
                            <div class="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#051024]/30"></div>
                            <div class="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#051024]/30"></div>
                        </div>

                        <!-- Repositioned brutalist header -->
                        <div class="absolute -top-6 left-4 md:left-[10%] z-30 bg-[#F4EFE6] px-5 py-3 border-4 border-[#051024] shadow-[6px_6px_0_#051024] transform -rotate-2 hover:rotate-0 transition-transform">
                            <div aria-hidden="true" class="font-['Schoolbell'] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#051024]">Visual Evidence // Platform Ecosystem</div>
                        </div>

                        <!-- Left Context Sticker & Arrow -->
                        <div class="hidden xl:flex absolute left-[6%] top-[30%] flex-col items-start z-30 transform -rotate-3">
                            <div aria-hidden="true" class="bg-[#051024] text-[#F4EFE6] font-['Schoolbell'] text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest border border-[#051024] shadow-[4px_4px_0_rgba(0,0,0,0.2)]">Data Node 01</div>
                            <div class="font-['Bebas_Neue'] text-7xl text-[#051024] leading-[0.8] mt-4 tracking-tight drop-shadow-sm">186.3M</div>
                            <div class="font-['DM_Sans'] text-xs font-bold text-[#051024]/60 uppercase tracking-widest mt-2">Total Views Generated</div>
                            <!-- Hand drawn arrow pointing to center screen -->
                            <svg class="w-20 h-20 text-[#FF3333] mt-2 opacity-80 rotate-[15deg] transform translate-x-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 12H2"/><path d="M14 20l8-8-8-8"/></svg>
                        </div>

                        <!-- Right Context Handwritten Note -->
                        <div class="hidden xl:block absolute right-[5%] bottom-[25%] font-['Gloria_Hallelujah'] text-[20px] text-[#051024] rotate-3 z-30 leading-[1.3]">
                            <svg class="absolute -left-16 -top-2 w-16 h-16 text-[#051024] -rotate-[160deg] opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 12H2"/><path d="M14 20l8-8-8-8"/></svg>
                            <span class="bg-yellow-200/60 mix-blend-multiply px-2 py-1">Engagement shifted.</span><br>
                            Followers went from <br>passive to active distributors.
                        </div>

                        <!-- Interactive Phone Scene -->
                        <div class="mockup-scene !m-0 z-20 w-full max-w-[1000px]">
                            <div class="mockup-phone mockup-left">
                                <img loading="lazy" src="./ksm3.png" alt="Reach Analytics" class="w-full h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(5,16,36,0.35)]" />
                            </div>
                            <div class="mockup-phone mockup-center z-30">
                                <img loading="lazy" src="./ksm1.png" alt="Dashboard Analytics" class="w-full h-auto object-contain filter drop-shadow-[0_30px_60px_rgba(5,16,36,0.45)]" />
                            </div>
                            <div class="mockup-phone mockup-right">
                                <img loading="lazy" src="./ksm2.png" alt="Profile View" class="w-full h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(5,16,36,0.35)]" />
                            </div>
                        </div>
                    </div>

                    <div class="brutal-overline mt-12 w-max reveal-text">Impact Verification // Metrics</div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[3rem] my-16 reveal-blur" style="transition-delay: 0.4s;">
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">100K+</div>
                            <div class="brutal-stat-sub">Followers</div>
                            <div class="brutal-stat-label">115% Growth in 3 Months</div>
                        </div>
                        <div class="brutal-stat-card relative">
                            <!-- Arrow pointing down (B -> E) -->
                            <div class="absolute hidden md:block" style="right: 15%; top: calc(100% - 15px); height: calc(3rem + 30px); width: 10px; background-color: #FF3333; opacity: 1; z-index: 50;">
                                <div aria-hidden="true" class="absolute top-1/2 left-6 -translate-y-1/2 whitespace-nowrap text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-white bg-[#FF3333] px-3 py-1.5 border-2 border-[#111] shadow-[4px_4px_0_#111]">Reinforces Loop</div>
                                <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[22px] border-transparent" style="border-top-color: #FF3333;"></div>
                            </div>
                            <div class="brutal-stat-big">46%</div>
                            <div class="brutal-stat-sub">Engagement Rate</div>
                            <div class="brutal-stat-label">30% More Than Industry Avg</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">₹4L+</div>
                            <div class="brutal-stat-sub">Standup Revenue</div>
                            <div class="brutal-stat-label">₹40K+ Worth Brand Partnerships</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">186M+</div>
                            <div class="brutal-stat-sub">Views</div>
                            <div class="brutal-stat-label">54M+ Accounts Reached</div>
                        </div>
                        <div class="brutal-stat-card relative">
                            <!-- Arrow pointing up (E -> B) -->
                            <div class="absolute hidden md:block" style="left: 15%; bottom: calc(100% - 15px); height: calc(3rem + 30px); width: 10px; background-color: #FF3333; opacity: 1; z-index: 50;">
                                <div aria-hidden="true" class="absolute top-1/2 right-6 -translate-y-1/2 whitespace-nowrap text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-white bg-[#FF3333] px-3 py-1.5 border-2 border-[#111] shadow-[4px_4px_0_#111]">Causes High Engagement</div>
                                <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[22px] border-transparent" style="border-bottom-color: #FF3333;"></div>
                            </div>
                            <div class="brutal-stat-big">3X</div>
                            <div class="brutal-stat-sub">Loop Rate</div>
                            <div class="brutal-stat-label">1:3 Shares to Likes Ratio</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">40+</div>
                            <div class="brutal-stat-sub">Shows Pan-India</div>
                            <div class="brutal-stat-label">Jaipur, Kanpur, Lucknow, Gurugram</div>
                        </div>
                    </div>
                </div>`
            },
            { 
                id: 'RNTL.', client: 'RNTL.', tags: ['Trust Engineering', 'Paid Social'], stat: '4.6X Lift', bg: '#8A9ED8', text: '#051024', sysId: '02', logo: 'rntllogo.svg', logoClass: 'mix-blend-multiply',
                customHTML: `
                <div class="brutal-wrap" style="--bg-color: #8A9ED8; --text-color: #051024;">
                    <div class="reveal-blur">
                        <span class="brutal-overline">Founding Marketer · Core Team</span>
                        <div class="flex items-center justify-between gap-4 w-full mb-4 md:mb-6">
                            <h1 class="brutal-title !mb-0">RNTL.</h1>
                            <img loading="lazy" src="./rntllogo.svg" class="h-[clamp(40px,8vw,90px)] w-auto object-contain shrink-0 mix-blend-multiply" alt="RNTL." />
                        </div>
                        <div class="brutal-sub">Fashion rental marketplace for Gen-Z</div>
                        <div class="brutal-tags mb-8">
                            <span class="brutal-tag">Meta Ads</span>
                            <span class="brutal-tag">Consumer Psychology</span>
                            <span class="brutal-tag">Brand Launch</span>
                        </div>

                    </div>

                    <div class="brutal-split reveal-blur" style="transition-delay: 0.1s;">
                        <div class="brutal-split-left">
                            <div class="brutal-split-title">Consumer Fear</div>
                            <div class="brutal-split-body mb-4 uppercase">"Why rent when I can own?"</div>
                            <div class="font-['DM_Sans'] font-[600] text-sm leading-relaxed uppercase mt-auto border-t-4 border-current pt-4">Renting felt like a sunk cost. No social proof, no category trust, zero brand history. The "is this brand real?" question came before any purchase intent.</div>
                        </div>
                        <div class="brutal-split-right">
                            <div class="brutal-split-title">Our Answer</div>
                            <div class="brutal-split-body mb-4 uppercase">Borrowed equity. Sell the lifestyle, not the product.</div>
                            <div class="font-['DM_Sans'] font-[600] text-sm leading-relaxed uppercase mt-auto border-t-4 border-current pt-4">Made credible people endorse renting as a lifestyle - removing the trust deficit before it was even asked.</div>
                        </div>
                    </div>


                    <div class="mt-24 mb-16 flex flex-col items-center justify-center reveal-blur" style="transition-delay: 0.3s;">
                        <img loading="lazy" src="./rntlspotlightseries.png" alt="RNTL Spotlight Series" class="w-full max-w-4xl h-auto object-contain filter drop-shadow-[8px_8px_0_rgba(0,0,0,0.8)] mix-blend-color-burn" />
                        <div class="brutal-overline !mt-6 text-center tracking-widest text-lg md:text-xl">5 Industry Voices • 2M+ Combined Network</div>
                    </div>
                    
                    <div class="relative w-full max-w-4xl mx-auto mt-32 mb-40 reveal-blur" style="transition-delay: 0.4s;">
                        <!-- Top Left Annotation (Points to Card 1) -->
                        <div class="hidden lg:flex absolute -top-24 left-0 w-48 flex-col items-center gap-1 z-40 transform -translate-x-8">
                            <p class="font-['Gloria_Hallelujah'] text-sm text-[#051024] leading-[1.25] text-center font-semibold">Positioned RNTL as a legitimate industry player from Day 1.</p>
                            <svg class="w-8 h-10 text-[#051024] mt-1" viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 C 8 12, 16 22, 12 30" /><path d="M6 24 L 12 30 L 18 24" /></svg>
                        </div>
                        
                        <!-- Top Right Annotation (Points to Card 5) -->
                        <div class="hidden lg:flex absolute -top-24 right-0 w-48 flex-col items-center gap-1 z-40 transform translate-x-8">
                            <p class="font-['Gloria_Hallelujah'] text-sm text-[#051024] leading-[1.25] text-center font-semibold">Defined flow & interaction convo for narrative consistency.</p>
                            <svg class="w-8 h-10 text-[#051024] mt-1" viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 C 16 12, 8 22, 12 30" /><path d="M6 24 L 12 30 L 18 24" /></svg>
                        </div>

                        <!-- Bottom Left Annotation (Points to Card 2) -->
                        <div class="hidden lg:flex absolute -bottom-28 left-[20%] w-56 flex-col items-center gap-1 z-40 transform -translate-x-4">
                            <svg class="w-8 h-10 text-[#051024] mb-1" viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 30 C 8 20, 16 10, 12 2" /><path d="M6 8 L 12 2 L 18 8" /></svg>
                            <p class="font-['Gloria_Hallelujah'] text-sm text-[#051024] leading-[1.25] text-center font-semibold">Removed consumer fear of "is this brand trustable?" via borrowed equity.</p>
                        </div>

                        <!-- Bottom Right Annotation (Points to Card 4) -->
                        <div class="hidden lg:flex absolute -bottom-28 right-[20%] w-56 flex-col items-center gap-1 z-40 transform translate-x-4">
                            <svg class="w-8 h-10 text-[#051024] mb-1" viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 30 C 16 20, 8 10, 12 2" /><path d="M6 8 L 12 2 L 18 8" /></svg>
                            <p class="font-['Gloria_Hallelujah'] text-sm text-[#051024] leading-[1.25] text-center font-semibold">Planned Q&A and SKU integration to endorse renting.</p>
                        </div>

                        <!-- Interactive Circle on the right (from screenshot) -->
                        <div class="hidden lg:flex absolute -right-[15%] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-[1.5px] border-[#6a5e3e] items-center justify-center opacity-80 pointer-events-none">
                            <div class="w-2 h-2 rounded-full bg-[#6a5e3e]"></div>
                        </div>

                        <div class="flex flex-col md:flex-row w-full h-[600px] md:h-[450px] gap-2 md:gap-3 overflow-hidden group/accordion relative z-20 px-4 md:px-0">
                            <!-- EP 1 -->
                            <a href="https://instagram.com/reel/DPQl2kmE-qq/" target="_blank" rel="noopener noreferrer" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] relative flex-1 md:hover:!flex-[4_4_0%] hover:!flex-[3_3_0%] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-xl overflow-hidden border-2 border-[#051024] cursor-pointer group/card shadow-[0_10px_20px_rgba(0,0,0,0.3)] bg-[#010204]">
                                <img loading="lazy" src="./ep1.jpg" alt="Episode 1" class="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
                                <div class="absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-[#051024]/90 via-[#051024]/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 flex flex-col justify-end h-[70%] z-20">
                                    <div class="bg-[#F4EFE6] border border-[#051024] p-2 text-center transform translate-y-8 group-hover/card:translate-y-0 transition-transform duration-700">
                                        <div class="font-['Bebas_Neue'] text-[#051024] text-xl md:text-2xl leading-none tracking-wide uppercase truncate">Nikita Luther</div>
                                        <div aria-hidden="true" class="font-['Schoolbell'] text-[#051024] text-[8px] font-bold uppercase tracking-widest mt-1 truncate">95K+ • Winner – Traitors</div>
                                    </div>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center opacity-100 group-hover/card:opacity-0 transition-opacity duration-700 z-10">
                                   <div class="md:rotate-[-90deg] font-['Bebas_Neue'] text-[#F4EFE6] text-3xl md:text-4xl tracking-widest whitespace-nowrap drop-shadow-md">EP. 1</div>
                                </div>
                            </a>
                            <!-- EP 2 -->
                            <a href="https://instagram.com/reel/DPatQBiEzfe/" target="_blank" rel="noopener noreferrer" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] relative flex-1 md:hover:!flex-[4_4_0%] hover:!flex-[3_3_0%] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-xl overflow-hidden border-2 border-[#051024] cursor-pointer group/card shadow-[0_10px_20px_rgba(0,0,0,0.3)] bg-[#010204]">
                                <img loading="lazy" src="./ep2.jpg" alt="Episode 2" class="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
                                <div class="absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-[#051024]/90 via-[#051024]/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 flex flex-col justify-end h-[70%] z-20">
                                    <div class="bg-[#F4EFE6] border border-[#051024] p-2 text-center transform translate-y-8 group-hover/card:translate-y-0 transition-transform duration-700">
                                        <div class="font-['Bebas_Neue'] text-[#051024] text-xl md:text-2xl leading-none tracking-wide uppercase truncate">Harpriya Bains</div>
                                        <div aria-hidden="true" class="font-['Schoolbell'] text-[#051024] text-[8px] font-bold uppercase tracking-widest mt-1 truncate">215K+ • Stand-up Comedian</div>
                                    </div>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center opacity-100 group-hover/card:opacity-0 transition-opacity duration-700 z-10">
                                   <div class="md:rotate-[-90deg] font-['Bebas_Neue'] text-[#F4EFE6] text-3xl md:text-4xl tracking-widest whitespace-nowrap drop-shadow-md">EP. 2</div>
                                </div>
                            </a>
                            <!-- EP 3 -->
                            <a href="https://instagram.com/reel/DPflCywE3rh/" target="_blank" rel="noopener noreferrer" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] relative flex-1 md:hover:!flex-[4_4_0%] hover:!flex-[3_3_0%] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-xl overflow-hidden border-2 border-[#051024] cursor-pointer group/card shadow-[0_10px_20px_rgba(0,0,0,0.3)] bg-[#010204]">
                                <img loading="lazy" src="./ep3.jpg" alt="Episode 3" class="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
                                <div class="absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-[#051024]/90 via-[#051024]/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 flex flex-col justify-end h-[70%] z-20">
                                    <div class="bg-[#F4EFE6] border border-[#051024] p-2 text-center transform translate-y-8 group-hover/card:translate-y-0 transition-transform duration-700">
                                        <div class="font-['Bebas_Neue'] text-[#051024] text-xl md:text-2xl leading-none tracking-wide uppercase truncate">Anya Singh</div>
                                        <div aria-hidden="true" class="font-['Schoolbell'] text-[#051024] text-[8px] font-bold uppercase tracking-widest mt-1 truncate">496K+ • Actress, Stree 2</div>
                                    </div>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center opacity-100 group-hover/card:opacity-0 transition-opacity duration-700 z-10">
                                   <div class="md:rotate-[-90deg] font-['Bebas_Neue'] text-[#F4EFE6] text-3xl md:text-4xl tracking-widest whitespace-nowrap drop-shadow-md">EP. 3</div>
                                </div>
                            </a>
                            <!-- EP 4 -->
                            <a href="https://instagram.com/reel/DP3Td-Nk63U/" target="_blank" rel="noopener noreferrer" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] relative flex-1 md:hover:!flex-[4_4_0%] hover:!flex-[3_3_0%] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-xl overflow-hidden border-2 border-[#051024] cursor-pointer group/card shadow-[0_10px_20px_rgba(0,0,0,0.3)] bg-[#010204]">
                                <img loading="lazy" src="./ep4.jpg" alt="Episode 4" class="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
                                <div class="absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-[#051024]/90 via-[#051024]/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 flex flex-col justify-end h-[70%] z-20">
                                    <div class="bg-[#F4EFE6] border border-[#051024] p-2 text-center transform translate-y-8 group-hover/card:translate-y-0 transition-transform duration-700">
                                        <div class="font-['Bebas_Neue'] text-[#051024] text-xl md:text-2xl leading-none tracking-wide uppercase truncate">Ranjit Bajaj</div>
                                        <div aria-hidden="true" class="font-['Schoolbell'] text-[#051024] text-[8px] font-bold uppercase tracking-widest mt-1 truncate">1.1M+ • Owner, Minerva FC</div>
                                    </div>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center opacity-100 group-hover/card:opacity-0 transition-opacity duration-700 z-10">
                                   <div class="md:rotate-[-90deg] font-['Bebas_Neue'] text-[#F4EFE6] text-3xl md:text-4xl tracking-widest whitespace-nowrap drop-shadow-md">EP. 4</div>
                                </div>
                            </a>
                            <!-- EP 5 -->
                            <a href="https://instagram.com/reel/DRY7Y8rkzaH/" target="_blank" rel="noopener noreferrer" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] relative flex-1 md:hover:!flex-[4_4_0%] hover:!flex-[3_3_0%] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-xl overflow-hidden border-2 border-[#051024] cursor-pointer group/card shadow-[0_10px_20px_rgba(0,0,0,0.3)] bg-[#010204]">
                                <img loading="lazy" src="./ep5.jpg" alt="Episode 5" class="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
                                <div class="absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-[#051024]/90 via-[#051024]/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 flex flex-col justify-end h-[70%] z-20">
                                    <div class="bg-[#F4EFE6] border border-[#051024] p-2 text-center transform translate-y-8 group-hover/card:translate-y-0 transition-transform duration-700">
                                        <div class="font-['Bebas_Neue'] text-[#051024] text-xl md:text-2xl leading-none tracking-wide uppercase truncate">Rajat Barmecha</div>
                                        <div aria-hidden="true" class="font-['Schoolbell'] text-[#051024] text-[8px] font-bold uppercase tracking-widest mt-1 truncate">87K+ • Actor, Udaan</div>
                                    </div>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center opacity-100 group-hover/card:opacity-0 transition-opacity duration-700 z-10">
                                   <div class="md:rotate-[-90deg] font-['Bebas_Neue'] text-[#F4EFE6] text-3xl md:text-4xl tracking-widest whitespace-nowrap drop-shadow-md">EP. 5</div>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div class="brutal-hook reveal-text" style="transition-delay: 0.3s;">
                        Meta Pilot Run - Catalog + Personality Led Brand Launch Ad Campaign. <br/>
                        <span class="font-[400] text-xl">Executed a micro-budget pilot to validate acquisition channels for Gen Z fashion rentals. Identified "Social Proof" as the core trust lever, achieving a 4.6x Efficiency Lift by pivoting from only catalog ads to +personality-led Reels.</span>
                    </div>

                    <div class="mt-12 mb-20 reveal-blur" style="transition-delay: 0.4s;">
                        <span aria-hidden="true" class="brutal-overline mb-4 block text-[10px]">Platforms Stack</span>
                        <img loading="lazy" src="./metachart.png" alt="Platforms" class="w-[560px] max-w-full md:w-[800px] h-auto object-contain mix-blend-color-burn opacity-90 filter drop-shadow-sm" />
                    </div>

                    <div class="brutal-stats-grid reveal-blur" style="transition-delay: 0.4s;">
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">35+%</div>
                            <div class="brutal-stat-sub">Hook Rate</div>
                            <div class="brutal-stat-label">Industry Benchmark: 20-25%</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">₹18.4</div>
                            <div class="brutal-stat-sub">Cost per Messaging Conversation</div>
                            <div class="brutal-stat-label">@4k Impressions</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big"><₹0.9</div>
                            <div class="brutal-stat-sub">Cost Per Click (CPC)</div>
                            <div class="brutal-stat-label">25-50% Less than Industry Avg</div>
                        </div>
                    </div>

                    <!-- Award-winning Overlapping Comparison Block -->
                    <!-- Full-bleed Formula Section to kill negative space -->
                    <div class="relative w-full mt-32 mb-40 py-16 md:py-24 flex flex-col items-center justify-center overflow-visible reveal-blur">
                        
                        <!-- Dynamic Background Band breaking out of standard padding -->
                        <div class="absolute inset-x-[-10vw] top-1/2 -translate-y-1/2 h-[80%] md:h-[95%] bg-[#051024] shadow-[inset_0_20px_60px_rgba(0,0,0,0.8)] transform -skew-y-3 border-y-[8px] border-[#F4EFE6] overflow-hidden flex items-center z-0">
                            <!-- Infinite Ticker text -->
                            <div class="whitespace-nowrap flex font-['Bebas_Neue'] text-[150px] md:text-[250px] text-[#F4EFE6]/5 uppercase tracking-tighter leading-none select-none" style="animation: ticker 40s linear infinite;">
                                THE WINNING FORMULA // THE WINNING FORMULA // THE WINNING FORMULA // THE WINNING FORMULA // THE WINNING FORMULA // 
                            </div>
                        </div>

                        <div class="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-[1200px] mx-auto px-4 md:px-0 gap-16 md:gap-0">
                            
                            <!-- Catalog Grid (Left) -->
                            <div class="w-[95%] md:w-[52%] z-10 transform md:rotate-[-5deg] md:-translate-y-16 hover:!rotate-[-1deg] hover:!z-50 transition-all duration-500 hover:scale-[1.04] shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative group">
                                <!-- Realistic Tape -->
                                <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 border border-white/20 transform -rotate-[4deg] shadow-sm z-30 mix-blend-overlay" style="backdrop-filter: blur(3px);"></div>
                                <!-- Badge -->
                                <div class="bg-[#F4EFE6] text-[#051024] font-bold uppercase text-[11px] md:text-[14px] px-5 py-2.5 absolute -left-4 md:-left-8 top-12 border-4 border-[#051024] shadow-[6px_6px_0_#051024] z-20 whitespace-nowrap -rotate-3 group-hover:rotate-0 transition-transform">
                                    Catalog Ad Set <span class="font-normal opacity-60 ml-2">Phase 01</span>
                                </div>
                                <img loading="lazy" src="./catalog_grid.jpg" alt="Catalog Grid" class="w-full border-4 md:border-8 border-[#051024] filter saturate-[0.85] contrast-[1.05]" />
                            </div>

                            <!-- Center Connector / + Sign -->
                            <div class="hidden md:flex z-40 flex-col items-center justify-center transform hover:scale-110 pointer-events-none transition-transform duration-300 md:-mx-16 lg:-mx-20 mt-16 shadow-2xl rounded-full">
                                <div class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#F4EFE6] border-[6px] border-[#051024] shadow-[8px_8px_0_#051024] flex items-center justify-center text-[#051024] text-6xl md:text-8xl font-black relative overflow-hidden">
                                    <div class="absolute inset-2 rounded-full border-[3px] border-dashed border-[#051024]/40 animate-[spin_12s_linear_infinite]"></div>
                                    <span class="relative z-10 drop-shadow-md">+</span>
                                </div>
                            </div>
                            
                            <!-- Personality Grid (Right) -->
                            <div class="w-[95%] md:w-[52%] z-20 transform md:rotate-[5deg] md:translate-y-20 hover:!rotate-[1deg] hover:!z-50 transition-all duration-500 hover:scale-[1.04] shadow-[0_35px_70px_rgba(0,0,0,0.8)] relative group">
                                <!-- Realistic Tape -->
                                <div class="absolute -top-4 right-16 w-20 h-8 bg-white/40 border border-white/20 transform rotate-[6deg] shadow-sm z-30 mix-blend-overlay" style="backdrop-filter: blur(3px);"></div>
                                <!-- Badge -->
                                <div class="bg-[#051024] text-[#F4EFE6] font-bold uppercase text-[11px] md:text-[14px] px-5 py-2.5 absolute -right-4 md:-right-8 bottom-12 border-4 border-[#051024] shadow-[6px_6px_0_#F4EFE6] z-20 whitespace-nowrap rotate-3 group-hover:rotate-0 transition-transform">
                                    Personality-Led <span class="font-normal opacity-60 ml-2">Phase 02</span>
                                </div>
                                <a href="https://linkedin.com/posts/bajkamalsingh_marketing-strategy-consumerbehaviour-activity-7419962873264734208-qPWS" target="_blank" rel="noopener noreferrer" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] block group/link">
                                    <img loading="lazy" src="./personality_grid.jpg" alt="Personality Grid" class="w-full border-4 md:border-8 border-[#051024] filter saturate-[1.1] contrast-[1.1]" />
                                    <div class="absolute inset-0 bg-[#051024]/60 opacity-0 group-hover/link:opacity-100 transition-opacity duration-400 flex items-center justify-center pointer-events-none z-40 border-4 border-transparent backdrop-blur-[3px]">
                                        <span class="bg-[#F4EFE6] text-[#051024] text-[12px] md:text-[16px] font-black uppercase tracking-widest px-8 py-4 shadow-[8px_8px_0_#051024] transform scale-90 group-hover/link:scale-100 transition-transform duration-400 ease-out">Dissect on LinkedIn ↗</span>
                                    </div>
                                </a>
                            </div>
                            
                        </div>
                        
                        <!-- Handwritten Annotation floating outside -->
                        <div class="absolute bottom-8 left-[10%] hidden xl:block font-['Gloria_Hallelujah'] font-medium text-[20px] text-[#F4EFE6] -rotate-6 z-30 opacity-90 drop-shadow-lg pointer-events-none leading-[1.3]">
                            Social proof scaled the conversion.
                            <svg class="absolute -top-8 right-[-50px] w-16 h-16 text-[#F4EFE6] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                        </div>
                    </div>

                    <!-- Expanded Brutalist Ad Breakup Analysis -->
                    <div class="relative w-full mt-24 mb-10 reveal-blur flex flex-col items-center">
                        <!-- Giant background text to kill negative space -->
                        <div class="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.05] z-0 mix-blend-color-burn">
                            <span class="font-['Bebas_Neue'] text-[35vw] text-[#051024] leading-none whitespace-nowrap">TEARDOWN</span>
                        </div>

                        <div class="relative w-full max-w-[1200px] z-10 px-4 md:px-0">
                            <!-- Brutalist Header overlapping the frame -->
                            <div class="absolute -top-10 md:-top-16 left-2 md:left-12 z-30 bg-[#F4EFE6] border-4 border-[#051024] p-4 md:p-6 shadow-[8px_8px_0_#051024] transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                                <div aria-hidden="true" class="font-['Schoolbell'] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#051024]/70 mb-2 border-b-2 border-[#051024]/20 pb-2">Phase 03 // Deep Dive</div>
                                <h3 class="font-['Bebas_Neue'] text-4xl md:text-6xl text-[#051024] leading-[0.85] tracking-wide">AD BREAKUP <br/>ANALYSIS</h3>
                            </div>

                            <!-- Main Image Frame -->
                            <div class="w-full bg-[#051024] p-3 md:p-8 pt-20 md:pt-28 border-4 border-[#051024] shadow-[16px_16px_0_rgba(5,16,36,0.4)] group/frame relative transition-all duration-500 hover:shadow-[24px_24px_0_rgba(5,16,36,0.5)] hover:-translate-y-2">
                                
                                <!-- Top Right Context -->
                                <div aria-hidden="true" class="absolute top-4 right-4 md:top-8 md:right-8 text-[#F4EFE6]/60 font-['Schoolbell'] text-[9px] md:text-xs uppercase tracking-widest text-right max-w-[200px] md:max-w-[300px]">
                                    Detailed teardown of the winning creative asset structure.
                                </div>
                                
                                <a href="https://linkedin.com/posts/bajkamalsingh_marketing-strategy-consumerbehaviour-activity-7419962873264734208-qPWS" target="_blank" rel="noopener noreferrer" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] block relative border-2 border-[#333] overflow-hidden bg-[#F4EFE6]">
                                    <!-- The Image -->
                                    <img loading="lazy" src="./ad_breakup.jpg" alt="Ad Breakup" class="w-full object-cover filter saturate-[0.95] contrast-[1.05] transition-transform duration-700 group-hover/frame:scale-[1.03]" />
                                    
                                    <!-- Dynamic Hover State -->
                                    <div class="absolute inset-0 bg-[#051024]/70 opacity-0 group-hover/frame:opacity-100 transition-opacity duration-400 flex items-center justify-center pointer-events-none z-40 backdrop-blur-[3px]">
                                        <div class="bg-[#F4EFE6] border-4 border-[#051024] text-[#051024] flex flex-col items-center p-6 md:p-10 shadow-[12px_12px_0_#051024] transform scale-90 group-hover/frame:scale-100 transition-transform duration-400 ease-out">
                                            <span class="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-widest leading-none mb-1 text-center">DISSECT ON LINKEDIN</span>
                                            <span aria-hidden="true" class="font-['Schoolbell'] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-3 bg-[#051024] text-[#F4EFE6] px-4 py-2 border border-[#051024] shadow-[4px_4px_0_#F4EFE6]">↗ Open Full Teardown</span>
                                        </div>
                                    </div>
                                </a>
                                
                                <!-- Bottom Decorative Bar -->
                                <div aria-hidden="true" class="mt-4 md:mt-6 flex justify-between items-center border-t border-[#F4EFE6]/10 pt-4 font-['Schoolbell'] text-[9px] md:text-[10px] text-[#F4EFE6]/50 uppercase tracking-widest">
                                    <span>Fig. 1 — Creative Anatomy</span>
                                    <span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-[#8DE254] shadow-[0_0_8px_#8DE254] animate-pulse"></div> Verified Strategy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
            },
            { 
                id: 'Sins Crew', client: 'Sinskari', tags: ['Email Funnel', 'D2C Strategy'], stat: '25+ Carts Recovered', bg: '#012CEB', text: '#F4EFE6', sysId: '03', logo: 'sinskarilogo.svg', logoClass: 'invert brightness-0',
                customHTML: `
                <div class="brutal-wrap" style="--bg-color: #012CEB; --text-color: #F4EFE6;">
                    <div class="reveal-blur">
                        <span class="brutal-overline">Strategy Intern · 4 Weeks</span>
                        <div class="flex items-center justify-between gap-4 w-full mb-4 md:mb-6">
                            <h1 class="brutal-title !mb-0">SINS CREW</h1>
                            <img loading="lazy" src="./sinskarilogo.svg" class="h-[clamp(40px,8vw,90px)] w-auto object-contain shrink-0 invert brightness-0" alt="Sinskari" />
                        </div>
                        <div class="brutal-sub">Sinskari - Growing D2C streetwear brand for Gen-Z India</div>
                        <div class="brutal-tags">
                            <span class="brutal-tag">Email Automation</span>
                            <span class="brutal-tag">CX Journey</span>
                            <span class="brutal-tag">Retention</span>
                        </div>
                    </div>

                    <div class="brutal-hook reveal-text" style="transition-delay: 0.1s;">
                        No behavioral triggers. No segment logic. No recovery sequences.<br/>
                        <span class="font-['DM_Sans'] font-[400] text-xl tracking-tight">Revenue was bleeding through abandoned carts daily - with zero infrastructure to catch it.</span>
                    </div>

                    <div class="brutal-overline w-max mt-8 reveal-text" style="transition-delay: 0.2s;">Automated Email Funnel Architecture - Designed from scratch</div>
                    <div class="brutal-flow-container reveal-blur" style="transition-delay: 0.3s;">
                        ${cachedFlowSVG}
                    </div>

                    <div class="brutal-overline mt-12 w-max reveal-text" style="transition-delay: 0.4s;">Impact Validation</div>

                    <div class="brutal-stats-grid reveal-blur" style="transition-delay: 0.5s;">
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">25+</div>
                            <div class="brutal-stat-sub">Carts Recovered</div>
                            <div class="brutal-stat-label">Direct Revenue Save</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">10%</div>
                            <div class="brutal-stat-sub">Conversion Boost</div>
                            <div class="brutal-stat-label">Site-wide Lift</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">15%</div>
                            <div class="brutal-stat-sub">Traffic Increase</div>
                            <div class="brutal-stat-label">Return Sessions</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">10%</div>
                            <div class="brutal-stat-sub">Drop-off Reduced</div>
                            <div class="brutal-stat-label">Funnel Optimization</div>
                        </div>
                    </div>
                </div>`
            },
            { 
                id: 'Histrionica', client: 'Dramsoc SRCC', tags: ['Brand Growth', 'Sponsorships'], stat: '₹55L+ Secured', bg: '#111111', text: '#F4EFE6', sysId: '04', logo: 'dramlogo.svg', logoClass: '',
                customHTML: `
                <div class="brutal-wrap" style="--bg-color: #111111; --text-color: #F4EFE6;">
                    <div class="reveal-blur">
                        <span class="brutal-overline">Vice President · The Dramatics Society, SRCC</span>
                        <div class="flex items-center justify-between gap-4 w-full mb-4 md:mb-6">
                            <h1 class="brutal-title !mb-0">HISTRIONICA</h1>
                            <img loading="lazy" src="./dramlogo.svg" class="h-[clamp(80px,14vw,140px)] w-auto object-contain shrink-0" alt="Dramsoc" />
                        </div>
                        <div class="brutal-sub">DU's most-followed college society · Tier-1 flagship annual festival</div>
                        <div class="brutal-tags">
                            <span class="brutal-tag">Sponsorships</span>
                            <span class="brutal-tag">Performance Mktg</span>
                            <span class="brutal-tag">Creative Direction</span>
                        </div>
                    </div>

                    <div class="brutal-hook reveal-text">
                        One of DU's oldest societies had no systematic growth engine.<br/>
                        <span class="font-['DM_Sans'] font-[400] text-xl md:text-3xl tracking-tight">Sponsorships were ad-hoc. Digital presence minimal. No playbook for brand partnerships or content at scale.</span>
                    </div>

                    <div class="brutal-stats-grid mt-12 reveal-blur" style="transition-delay: 0.1s;">
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">₹55L+</div>
                            <div class="brutal-stat-label">Sponsorship Value Secured</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">33M+</div>
                            <div class="brutal-stat-label">Total Campaign Reach</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">234%</div>
                            <div class="brutal-stat-label">Year over Year Growth</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">12K+</div>
                            <div class="brutal-stat-label">Total Event Footfall</div>
                        </div>
                    </div>

                    <div class="brutal-grid-2 reveal-blur" style="transition-delay: 0.2s;">
                        <div class="brutal-grid-item">
                            <div class="brutal-item-title">Sponsorship Strategy</div>
                            <div class="brutal-item-desc">Swiggy, Rapido, McDonald's, Redtape, Zebronics. Negotiated & closed ₹55L+ in brand deals. Managed 30+ sponsors for JFL.</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-item-title">Performance Marketing</div>
                            <div class="brutal-item-desc">2.2M+ reach in under 3 days. 837K incremental boost. 96.4% ↑ in unique visitors. 283K interactions via adspend.</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-item-title">Creative Direction</div>
                            <div class="brutal-item-desc">A/B tested across 6+ locations. All visual assets directed to create FOMO and drive engagement at scale.</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-item-title">Social Growth</div>
                            <div class="brutal-item-desc">Most-followed college club, DU. Grew to 10K+ followers in 6 months. 270%+ engagement boost via data-driven optimization.</div>
                        </div>
                    </div>

                    <div class="brutal-overline mt-16 w-max reveal-text">Executive Roles // Breakout</div>
                    
                    <div class="brutal-grid-3 reveal-blur" style="transition-delay: 0.3s; border-top: none;">
                        <div class="brutal-grid-item" style="border-top: 8px solid var(--text-color);">
                            <div class="brutal-item-title text-xl">Growth Strategy</div>
                            <div class="brutal-item-desc">Grew Account to 10K+ Followers (6 months): Achieved most-followed college club status in Delhi University.</div>
                        </div>
                        <div class="brutal-grid-item" style="border-top: 8px solid var(--text-color);">
                            <div class="brutal-item-title text-xl">Social Media Mgmt</div>
                            <div class="brutal-item-desc">Conceptualised, designed and executed campaigns for celebrity events, sponsored collaborations, and high-engagement content.</div>
                        </div>
                        <div class="brutal-grid-item" style="border-top: 8px solid var(--text-color);">
                            <div class="brutal-item-title text-xl">Creative Direction</div>
                            <div class="brutal-item-desc">Led Creative Direction for all visual assets (static, reels) to drive buzz, create FOMO and leverage emerging trends.</div>
                        </div>
                    </div>

                    <div class="brutal-overline mt-16 mb-8 text-center text-[#F4EFE6] opacity-50">Visual Archives // Static Campaigns</div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl mx-auto mb-16 px-4 reveal-blur" style="transition-delay: 0.3s;">
                        <!-- Asset 1: Audition Workshop -->
                        <div class="relative group aspect-[4/5] bg-[#0a0a0a] p-3 shadow-[8px_8px_0_rgba(244,239,230,0.05)] border-2 border-[#333] transition-all duration-500 hover:border-[var(--blue)] hover:shadow-[12px_12px_0_var(--blue)] hover:-translate-y-2">
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-white/10 backdrop-blur-sm border border-white/20 transform rotate-2 z-20 mix-blend-overlay"></div>
                            <div class="w-full h-full overflow-hidden border border-[#222] relative rounded-sm">
                                <img alt="Dramsoc Tds1" loading="lazy" src="./tds1.png" class="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#000]/90 via-[#000]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                                <div class="absolute bottom-5 left-5 right-5 flex flex-col justify-end items-start">
                                    <div aria-hidden="true" class="bg-[#F4EFE6] text-[#051024] text-[9px] font-bold px-2 py-1 rounded-sm w-max mb-2 uppercase tracking-widest shadow-sm">Tier 1 Post</div>
                                    <div class="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#F4EFE6] tracking-wide leading-none">Audition Workshop</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Asset 2: MostlySane -->
                        <div class="relative group aspect-[4/5] bg-[#0a0a0a] p-3 shadow-[8px_8px_0_rgba(244,239,230,0.05)] border-2 border-[#333] transition-all duration-500 hover:border-[#e53935] hover:shadow-[12px_12px_0_#e53935] hover:-translate-y-2">
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-white/10 backdrop-blur-sm border border-white/20 transform -rotate-2 z-20 mix-blend-overlay"></div>
                            <div class="w-full h-full overflow-hidden border border-[#222] relative rounded-sm">
                                <img alt="Dramsoc Tds2" loading="lazy" src="./tds2.png" class="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#000]/90 via-[#000]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                                <div class="absolute bottom-5 left-5 right-5 flex flex-col justify-end items-start">
                                    <div aria-hidden="true" class="bg-[#F4EFE6] text-[#051024] text-[9px] font-bold px-2 py-1 rounded-sm w-max mb-2 uppercase tracking-widest shadow-sm">Creator Collab</div>
                                    <div class="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#F4EFE6] tracking-wide leading-none">MostlySane</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Asset 3: Open Mic -->
                        <div class="relative group aspect-[4/5] bg-[#0a0a0a] p-3 shadow-[8px_8px_0_rgba(244,239,230,0.05)] border-2 border-[#333] transition-all duration-500 hover:border-[#f9ce34] hover:shadow-[12px_12px_0_#f9ce34] hover:-translate-y-2">
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-white/10 backdrop-blur-sm border border-white/20 transform rotate-1 z-20 mix-blend-overlay"></div>
                            <div class="w-full h-full overflow-hidden border border-[#222] relative rounded-sm">
                                <img alt="Dramsoc Tds3" loading="lazy" src="./tds3.png" class="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#000]/90 via-[#000]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                                <div class="absolute bottom-5 left-5 right-5 flex flex-col justify-end items-start">
                                    <div aria-hidden="true" class="bg-[#F4EFE6] text-[#051024] text-[9px] font-bold px-2 py-1 rounded-sm w-max mb-2 uppercase tracking-widest shadow-sm">Flagship Event</div>
                                    <div class="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#F4EFE6] tracking-wide leading-none">The Grand Open Mic</div>
                                </div>
                            </div>
                        </div>

                        <!-- Asset 4: Judges -->
                        <div class="relative group aspect-[4/5] bg-[#0a0a0a] p-3 shadow-[8px_8px_0_rgba(244,239,230,0.05)] border-2 border-[#333] transition-all duration-500 hover:border-[#8e24aa] hover:shadow-[12px_12px_0_#8e24aa] hover:-translate-y-2">
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-white/10 backdrop-blur-sm border border-white/20 transform -rotate-1 z-20 mix-blend-overlay"></div>
                            <div class="w-full h-full overflow-hidden border border-[#222] relative rounded-sm">
                                <img alt="Dramsoc Tds4" loading="lazy" src="./tds4.png" class="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#000]/90 via-[#000]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                                <div class="absolute bottom-5 left-5 right-5 flex flex-col justify-end items-start">
                                    <div aria-hidden="true" class="bg-[#F4EFE6] text-[#051024] text-[9px] font-bold px-2 py-1 rounded-sm w-max mb-2 uppercase tracking-widest shadow-sm">Panel Reveal</div>
                                    <div class="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#F4EFE6] tracking-wide leading-none">Judges Panel</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="brutal-overline mt-24 w-max mx-auto text-[#F4EFE6] opacity-50 reveal-text">Video Campaigns // Archive</div>

                    <!-- Award-Winning Hover Reveal List -->
                    <div class="w-full max-w-5xl mx-auto flex flex-col mt-8 md:mt-12 mb-24 reveal-blur relative z-20 border-t border-[#333]" style="transition-delay: 0.4s;">
                        
                        <!-- Reel 1 -->
                        <div class="group/row relative flex items-center justify-between border-b border-[#333] py-5 md:py-8 cursor-pointer hover:z-40">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 -z-10"></div>
                            
                            <div class="flex items-center md:items-baseline gap-4 md:gap-12 relative z-10 w-[60%] md:w-auto">
                                <span class="font-['Schoolbell'] text-[#f4efe6]/30 text-xs md:text-sm font-bold transition-colors duration-500 group-hover/row:text-[#f4efe6]">01</span>
                                <h3 class="font-['Bebas_Neue'] text-2xl md:text-7xl text-[#f4efe6]/60 md:text-[#f4efe6]/40 group-hover/row:text-[#f4efe6] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2 md:group-hover/row:translate-x-8 tracking-wide truncate md:overflow-visible">Event Pre-Buzz</h3>
                            </div>
                            
                            <div class="flex items-center gap-3 md:gap-8 relative z-10 w-[40%] md:w-auto justify-end">
                                <div class="flex flex-col items-end opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transform md:translate-x-4 md:group-hover/row:translate-x-0 transition-all duration-500 ease-out">
                                    <span class="font-['Schoolbell'] text-white md:text-[#f4efe6] text-xs md:text-xl font-bold tracking-widest flex items-center gap-1 md:gap-2">
                                        <svg class="w-3 h-3 md:w-4 md:h-4 text-[var(--blue)] md:text-current opacity-90 md:opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                        28.2K
                                    </span>
                                    <span aria-hidden="true" class="font-['DM_Sans'] text-[#f4efe6]/50 text-[8px] md:text-[10px] uppercase tracking-widest mt-1 hidden md:block">Views Captured</span>
                                </div>
                                <div class="block md:hidden w-10 h-14 rounded overflow-hidden shrink-0 border border-[#333]">
                                    <img alt="Dramsoc Tdsr1" loading="lazy" src="./tdsr1.png" class="w-full h-full object-cover grayscale" />
                                </div>
                            </div>

                            <!-- Desktop Hover Image -->
                            <div class="absolute left-[45%] top-1/2 -translate-y-1/2 w-48 h-72 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover/row:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-90 group-hover/row:scale-100 group-hover/row:-rotate-6 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 hidden md:block">
                                <img alt="Dramsoc Tdsr1" loading="lazy" src="./tdsr1.png" class="w-full h-full object-cover scale-110 group-hover/row:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                        </div>

                        <!-- Reel 2 -->
                        <div class="group/row relative flex items-center justify-between border-b border-[#333] py-5 md:py-8 cursor-pointer hover:z-40">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 -z-10"></div>
                            <div class="flex items-center md:items-baseline gap-4 md:gap-12 relative z-10 w-[60%] md:w-auto">
                                <span class="font-['Schoolbell'] text-[#f4efe6]/30 text-xs md:text-sm font-bold transition-colors duration-500 group-hover/row:text-[#f4efe6]">02</span>
                                <h3 class="font-['Bebas_Neue'] text-2xl md:text-7xl text-[#f4efe6]/60 md:text-[#f4efe6]/40 group-hover/row:text-[#f4efe6] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2 md:group-hover/row:translate-x-8 tracking-wide truncate md:overflow-visible">Freshers' Welcome</h3>
                            </div>
                            <div class="flex items-center gap-3 md:gap-8 relative z-10 w-[40%] md:w-auto justify-end">
                                <div class="flex flex-col items-end opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transform md:translate-x-4 md:group-hover/row:translate-x-0 transition-all duration-500 ease-out">
                                    <span class="font-['Schoolbell'] text-white md:text-[#f4efe6] text-xs md:text-xl font-bold tracking-widest flex items-center gap-1 md:gap-2">
                                        <svg class="w-3 h-3 md:w-4 md:h-4 text-[var(--blue)] md:text-current opacity-90 md:opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                        25.4K
                                    </span>
                                    <span aria-hidden="true" class="font-['DM_Sans'] text-[#f4efe6]/50 text-[8px] md:text-[10px] uppercase tracking-widest mt-1 hidden md:block">Views Captured</span>
                                </div>
                                <div class="block md:hidden w-10 h-14 rounded overflow-hidden shrink-0 border border-[#333]">
                                    <img alt="Dramsoc Tdsr2" loading="lazy" src="./tdsr2.png" class="w-full h-full object-cover grayscale" />
                                </div>
                            </div>
                            <div class="absolute left-[55%] top-1/2 -translate-y-1/2 w-48 h-72 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover/row:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-90 group-hover/row:scale-100 group-hover/row:rotate-3 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 hidden md:block">
                                <img alt="Dramsoc Tdsr2" loading="lazy" src="./tdsr2.png" class="w-full h-full object-cover scale-110 group-hover/row:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                        </div>

                        <!-- Reel 3 -->
                        <div class="group/row relative flex items-center justify-between border-b border-[#333] py-5 md:py-8 cursor-pointer hover:z-40">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 -z-10"></div>
                            <div class="flex items-center md:items-baseline gap-4 md:gap-12 relative z-10 w-[60%] md:w-auto">
                                <span class="font-['Schoolbell'] text-[#f4efe6]/30 text-xs md:text-sm font-bold transition-colors duration-500 group-hover/row:text-[#f4efe6]">03</span>
                                <h3 class="font-['Bebas_Neue'] text-2xl md:text-7xl text-[#f4efe6]/60 md:text-[#f4efe6]/40 group-hover/row:text-[#f4efe6] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2 md:group-hover/row:translate-x-8 tracking-wide truncate md:overflow-visible">30-Year Legacy</h3>
                            </div>
                            <div class="flex items-center gap-3 md:gap-8 relative z-10 w-[40%] md:w-auto justify-end">
                                <div class="flex flex-col items-end opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transform md:translate-x-4 md:group-hover/row:translate-x-0 transition-all duration-500 ease-out">
                                    <span class="font-['Schoolbell'] text-white md:text-[#f4efe6] text-xs md:text-xl font-bold tracking-widest flex items-center gap-1 md:gap-2">
                                        <svg class="w-3 h-3 md:w-4 md:h-4 text-[var(--blue)] md:text-current opacity-90 md:opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                        30.4K
                                    </span>
                                    <span aria-hidden="true" class="font-['DM_Sans'] text-[#f4efe6]/50 text-[8px] md:text-[10px] uppercase tracking-widest mt-1 hidden md:block">Views Captured</span>
                                </div>
                                <div class="block md:hidden w-10 h-14 rounded overflow-hidden shrink-0 border border-[#333]">
                                    <img alt="Dramsoc Tdsr3" loading="lazy" src="./tdsr3.png" class="w-full h-full object-cover grayscale" />
                                </div>
                            </div>
                            <div class="absolute left-[50%] top-1/2 -translate-y-1/2 w-48 h-72 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover/row:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-90 group-hover/row:scale-100 group-hover/row:-rotate-2 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 hidden md:block">
                                <img alt="Dramsoc Tdsr3" loading="lazy" src="./tdsr3.png" class="w-full h-full object-cover scale-110 group-hover/row:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                        </div>

                        <!-- Reel 4 -->
                        <div class="group/row relative flex items-center justify-between border-b border-[#333] py-5 md:py-8 cursor-pointer hover:z-40">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 -z-10"></div>
                            <div class="flex items-center md:items-baseline gap-4 md:gap-12 relative z-10 w-[60%] md:w-auto">
                                <span class="font-['Schoolbell'] text-[#f4efe6]/30 text-xs md:text-sm font-bold transition-colors duration-500 group-hover/row:text-[#f4efe6]">04</span>
                                <h3 class="font-['Bebas_Neue'] text-2xl md:text-7xl text-[#f4efe6]/60 md:text-[#f4efe6]/40 group-hover/row:text-[#f4efe6] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2 md:group-hover/row:translate-x-8 tracking-wide truncate md:overflow-visible">Celebrity Collab</h3>
                            </div>
                            <div class="flex items-center gap-3 md:gap-8 relative z-10 w-[40%] md:w-auto justify-end">
                                <div class="flex flex-col items-end opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transform md:translate-x-4 md:group-hover/row:translate-x-0 transition-all duration-500 ease-out">
                                    <span class="font-['Schoolbell'] text-white md:text-[#f4efe6] text-xs md:text-xl font-bold tracking-widest flex items-center gap-1 md:gap-2">
                                        <svg class="w-3 h-3 md:w-4 md:h-4 text-[var(--blue)] md:text-current opacity-90 md:opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                        30.2K
                                    </span>
                                    <span aria-hidden="true" class="font-['DM_Sans'] text-[#f4efe6]/50 text-[8px] md:text-[10px] uppercase tracking-widest mt-1 hidden md:block">Views Captured</span>
                                </div>
                                <div class="block md:hidden w-10 h-14 rounded overflow-hidden shrink-0 border border-[#333]">
                                    <img alt="Dramsoc Tdsr4" loading="lazy" src="./tdsr4.png" class="w-full h-full object-cover grayscale" />
                                </div>
                            </div>
                            <div class="absolute left-[60%] top-1/2 -translate-y-1/2 w-48 h-72 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover/row:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-90 group-hover/row:scale-100 group-hover/row:rotate-6 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 hidden md:block">
                                <img alt="Dramsoc Tdsr4" loading="lazy" src="./tdsr4.png" class="w-full h-full object-cover scale-110 group-hover/row:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                        </div>

                        <!-- Reel 5 -->
                        <div class="group/row relative flex items-center justify-between border-b border-[#333] py-5 md:py-8 cursor-pointer hover:z-40">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 -z-10"></div>
                            <div class="flex items-center md:items-baseline gap-4 md:gap-12 relative z-10 w-[60%] md:w-auto">
                                <span class="font-['Schoolbell'] text-[#f4efe6]/30 text-xs md:text-sm font-bold transition-colors duration-500 group-hover/row:text-[#f4efe6]">05</span>
                                <h3 class="font-['Bebas_Neue'] text-2xl md:text-7xl text-[#f4efe6]/60 md:text-[#f4efe6]/40 group-hover/row:text-[#f4efe6] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2 md:group-hover/row:translate-x-8 tracking-wide truncate md:overflow-visible">Viral Sketch</h3>
                            </div>
                            <div class="flex items-center gap-3 md:gap-8 relative z-10 w-[40%] md:w-auto justify-end">
                                <div class="flex flex-col items-end opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transform md:translate-x-4 md:group-hover/row:translate-x-0 transition-all duration-500 ease-out">
                                    <span class="font-['Schoolbell'] text-[#f9ce34] md:text-[#f4efe6] text-xs md:text-xl font-bold tracking-widest flex items-center gap-1 md:gap-2 drop-shadow-[0_0_8px_rgba(249,206,52,0.4)]">
                                        <svg class="w-3 h-3 md:w-4 md:h-4 text-current opacity-90 md:opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                        471K
                                    </span>
                                    <span aria-hidden="true" class="font-['DM_Sans'] text-[#f4efe6]/50 text-[8px] md:text-[10px] uppercase tracking-widest mt-1 hidden md:block">Views Captured</span>
                                </div>
                                <div class="block md:hidden w-10 h-14 rounded overflow-hidden shrink-0 border border-[#333]">
                                    <img alt="Dramsoc Tdsr5" loading="lazy" src="./tdsr5.png" class="w-full h-full object-cover grayscale" />
                                </div>
                            </div>
                            <div class="absolute left-[40%] top-1/2 -translate-y-1/2 w-48 h-72 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover/row:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-90 group-hover/row:scale-100 group-hover/row:-rotate-4 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 hidden md:block">
                                <img alt="Dramsoc Tdsr5" loading="lazy" src="./tdsr5.png" class="w-full h-full object-cover scale-110 group-hover/row:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                        </div>

                        <!-- Reel 6 -->
                        <div class="group/row relative flex items-center justify-between border-b border-[#333] py-5 md:py-8 cursor-pointer hover:z-40">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 -z-10"></div>
                            <div class="flex items-center md:items-baseline gap-4 md:gap-12 relative z-10 w-[60%] md:w-auto">
                                <span class="font-['Schoolbell'] text-[#f4efe6]/30 text-xs md:text-sm font-bold transition-colors duration-500 group-hover/row:text-[#f4efe6]">06</span>
                                <h3 class="font-['Bebas_Neue'] text-2xl md:text-7xl text-[#f4efe6]/60 md:text-[#f4efe6]/40 group-hover/row:text-[#f4efe6] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2 md:group-hover/row:translate-x-8 tracking-wide truncate md:overflow-visible">Artist Reveal</h3>
                            </div>
                            <div class="flex items-center gap-3 md:gap-8 relative z-10 w-[40%] md:w-auto justify-end">
                                <div class="flex flex-col items-end opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transform md:translate-x-4 md:group-hover/row:translate-x-0 transition-all duration-500 ease-out">
                                    <span class="font-['Schoolbell'] text-[#f9ce34] md:text-[#f4efe6] text-xs md:text-xl font-bold tracking-widest flex items-center gap-1 md:gap-2 drop-shadow-[0_0_8px_rgba(249,206,52,0.4)]">
                                        <svg class="w-3 h-3 md:w-4 md:h-4 text-current opacity-90 md:opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                        451K
                                    </span>
                                    <span aria-hidden="true" class="font-['DM_Sans'] text-[#f4efe6]/50 text-[8px] md:text-[10px] uppercase tracking-widest mt-1 hidden md:block">Views Captured</span>
                                </div>
                                <div class="block md:hidden w-10 h-14 rounded overflow-hidden shrink-0 border border-[#333]">
                                    <img alt="Dramsoc Tdsr6" loading="lazy" src="./tdsr6.png" class="w-full h-full object-cover grayscale" />
                                </div>
                            </div>
                            <div class="absolute left-[50%] top-1/2 -translate-y-1/2 w-48 h-72 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover/row:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-90 group-hover/row:scale-100 group-hover/row:rotate-2 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 hidden md:block">
                                <img alt="Dramsoc Tdsr6" loading="lazy" src="./tdsr6.png" class="w-full h-full object-cover scale-110 group-hover/row:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>`
            },
            { 
                id: 'Signal', client: 'Jio Hotstar', tags: ['GTM Strategy', 'Campus Marketing'], stat: '7L+ Impressions', bg: '#D8E0E8', text: '#012CEB', sysId: '05', logo: 'hotstarlogo.svg', logoClass: 'mix-blend-multiply',
                customHTML: `
                <div class="brutal-wrap" style="--bg-color: #D8E0E8; --text-color: #012CEB;">
                    <div class="reveal-blur">
                        <span class="brutal-overline">Marketing & GTM Strategy Lead</span>
                        <div class="flex items-center justify-between gap-4 w-full mb-4 md:mb-6">
                            <h1 class="brutal-title !mb-0">SIGNAL</h1>
                            <img loading="lazy" src="./hotstarlogo.svg" class="h-[clamp(40px,8vw,90px)] w-auto object-contain shrink-0 mix-blend-multiply" alt="Hotstar" />
                        </div>
                        <div class="brutal-sub">Jio Hotstar show launch · 5–7 college campuses · 30,000+ Gen-Z target</div>
                        <div class="brutal-tags">
                            <span class="brutal-tag">GTM</span>
                            <span class="brutal-tag">Campus Activation</span>
                            <span class="brutal-tag">Influencer Network</span>
                            <span class="brutal-tag">OTT</span>
                        </div>
                    </div>

                    <div class="brutal-hook reveal-text">
                        Gen-Z doesn't show up for ads. They show up for culture.<br/>
                        <span class="font-['DM_Sans'] font-[400] text-xl md:text-3xl tracking-tight">The challenge: make a streaming show launch feel like a campus moment - and then convert it.</span>
                    </div>

                    <div class="brutal-overline mt-12 w-max reveal-text">GTM Execution Phases</div>

                    <div class="brutal-grid-2 reveal-blur" style="transition-delay: 0.1s;">
                        <div class="brutal-grid-item">
                            <div class="brutal-num">01</div>
                            <div class="brutal-item-title">Audience Architecture</div>
                            <div class="brutal-item-desc">Tiered segmentation across 5–7 campuses with hyper-personalized messaging at each touchpoint. (30,000+ students reached).</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-num">02</div>
                            <div class="brutal-item-title">Micro-Influencer Network</div>
                            <div class="brutal-item-desc">Built and scaled 25–40 campus influencers to unlock organic reach and compress cost-per-reach vs paid channels. (45,000+ organic reach).</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-num">03</div>
                            <div class="brutal-item-title">Celebrity Amplification</div>
                            <div class="brutal-item-desc">Orchestrated campaigns featuring Abhishek Malhan & Khushboo Patani to spike live engagement and drive cultural credibility.</div>
                        </div>
                        <div class="brutal-grid-item">
                            <div class="brutal-num">04</div>
                            <div class="brutal-item-title">UGC Conversion Engine</div>
                            <div class="brutal-item-desc">Converted on-ground attendees into content distributors - turning footfall into organic amplification. (8,000+ peer-to-peer shares).</div>
                        </div>
                    </div>

                    <div class="brutal-overline mt-16 w-max reveal-text">Visual Evidence // Live Activation</div>
                    <div class="brutal-contact-sheet reveal-blur" style="transition-delay: 0.3s;">
                        <div class="brutal-img-wrap" style="min-height: 350px;">
                            <div class="brutal-img-meta">ARCHIVE 01 // STAGE</div>
                            <img loading="lazy" src="./hs6.PNG" alt="Stage Moment" />
                        </div>
                        <div class="brutal-img-wrap" style="min-height: 350px;">
                            <div class="brutal-img-meta">ARCHIVE 02 // PANEL</div>
                            <img loading="lazy" src="./hs3.PNG" alt="Panel Discussion" />
                        </div>
                        <div class="brutal-img-wrap" style="min-height: 350px;">
                            <div class="brutal-img-meta">ARCHIVE 03 // CROWD</div>
                            <img loading="lazy" src="./hs5.PNG" alt="Crowd Engagement" />
                        </div>
                    </div>

                    <div class="brutal-overline mt-16 w-max reveal-text">Digital & Physical Scale</div>
                    <div class="brutal-split mt-4 reveal-blur" style="transition-delay: 0.4s;">
                        <div class="brutal-split-left">
                            <div class="brutal-split-title">Pre-Buzz Artifacts</div>
                            <div class="font-['DM_Sans'] font-[600] text-sm mb-6 uppercase">Distributed via Micro-influencer network to 45,000+ students.</div>
                            <div class="brutal-img-wrap mb-6" style="min-height: 120px;">
                                <div class="brutal-img-meta">BANNER // A</div>
                                <img loading="lazy" src="./hs1.jpg" alt="Campaign Banner A" />
                            </div>
                            <div class="brutal-img-wrap" style="min-height: 120px;">
                                <div class="brutal-img-meta">BANNER // B</div>
                                <img loading="lazy" src="./hs2.jpg" alt="Campaign Banner B" />
                            </div>
                        </div>
                        <div class="brutal-split-right" style="background: transparent; color: var(--text-color);">
                            <div class="brutal-split-title">On-Ground Translation</div>
                            <div class="font-['DM_Sans'] font-[600] text-sm mb-6 uppercase">Turning digital hype into physical presence.</div>
                            <div class="brutal-img-wrap h-full" style="min-height: 250px;">
                                <div class="brutal-img-meta">EVIDENCE // SCREENING</div>
                                <img loading="lazy" src="./hs4.PNG" alt="Screening Event" />
                            </div>
                        </div>
                    </div>

                    <div class="brutal-overline mt-16 w-max reveal-text">Campaign Impact</div>

                    <div class="brutal-stats-grid reveal-blur" style="transition-delay: 0.5s;">
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">7L+</div>
                            <div class="brutal-stat-label">Impressions in 72hrs</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">15%</div>
                            <div class="brutal-stat-label">Conversion Rate Peak</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">40K+</div>
                            <div class="brutal-stat-label">Total Engagements</div>
                        </div>
                        <div class="brutal-stat-card">
                            <div class="brutal-stat-big">1.3K+</div>
                            <div class="brutal-stat-label">Attendees Converted</div>
                        </div>
                    </div>
                </div>`
            }
        ];
        
        // --- 4. CAREER TRANSIT SYSTEM LOGIC ---
        // Dynamically add summaries and properties to the inventoryData array to avoid touching existing customHTML
        if (inventoryData[0]) { inventoryData[0].summary = "Engineered creator growth systems capturing massive reach & brand revenue."; inventoryData[0].points = ["Created relatable POV content to acquire cold audiences", "Turned passive viewers into active distributors with 3x Loop Rate", "Operationalized & scaled a 40+ show touring business"]; inventoryData[0].name = "Krishna Shukla"; inventoryData[0].metrics = ["186M+", "₹4.4L", "32X"]; inventoryData[0].metricLabels = ["REACH", "REVENUE", "ROI"]; inventoryData[0].keyword = "Growth"; }
        if (inventoryData[1]) { inventoryData[1].summary = "Validated acquisition channels for Gen Z sustainable fashion rentals."; inventoryData[1].points = ["Used borrowed equity to remove consumer trust deficit", "Positioned brand as a legitimate player from Day 1", "Made credible industry voices endorse renting as a lifestyle"]; inventoryData[1].name = "Rntl."; inventoryData[1].metrics = ["ACQ", "500+", "4X"]; inventoryData[1].metricLabels = ["FOCUS", "BETA USERS", "GROWTH"]; inventoryData[1].keyword = "Acquisition"; }
        if (inventoryData[2]) { inventoryData[2].summary = "Architected automated email flows to dramatically lift retention."; inventoryData[2].points = ["Built automated email funnel architecture from scratch", "Plugged revenue bleeding from daily abandoned carts", "Recovered 25+ carts & boosted conversion by 10%"]; inventoryData[2].name = "Sinkari"; inventoryData[2].metrics = ["10%", "90%", "30D"]; inventoryData[2].metricLabels = ["REV LIFT", "RETENTION", "WINDOW"]; inventoryData[2].keyword = "Retention"; }
        if (inventoryData[3]) { inventoryData[3].summary = "Secured brand sponsorships and scaled digital presence for flagship fest."; inventoryData[3].points = ["Closed ₹55L+ in brand sponsorships with 30+ brands", "Grew Instagram to 10K+ followers as DU's #1 club", "Generated 33M+ total campaign reach for flagship events"]; inventoryData[3].name = "Dramsoc"; inventoryData[3].metrics = ["₹55L+", "40K", "72H"]; inventoryData[3].metricLabels = ["SPONSORSHIP", "FOOTFALL", "DURATION"]; inventoryData[3].keyword = "Scale"; }
        if (inventoryData[4]) { inventoryData[4].summary = "Orchestrated hyper-localized campus launch generating massive organic reach."; inventoryData[4].points = ["Turned a streaming show launch into an organic campus moment", "Scaled 25-40 micro-influencers to reach 30,000+ students", "Converted event footfall into 8,000+ organic peer-to-peer shares"]; inventoryData[4].name = "Jio Hotstar"; inventoryData[4].metrics = ["7L+", "15%", "40K+"]; inventoryData[4].metricLabels = ["IMPRESSIONS", "CONVERSION", "SIGNUPS"]; inventoryData[4].keyword = "Launch"; }


const dmrcStations = [
  "NORTH CAMPUS",
  "GTB NAGAR",
  "VISHWAVIDYALAYA",
  "KASHMERE GATE",
  "RAJIV CHOWK",
  "RNTL TERMINAL",
];

const dummyStationsList = [
  "VISHWAVIDYALAYA",
  "GTB NAGAR",
  "KASHMERE GATE",
  "RAJIV CHOWK",
  "MANDI HOUSE",
];

const enrichedProjects: ProjectConfig[] = inventoryData.map((d: any, i: number) => ({
  ...d,
  stationName: dmrcStations[i + 1] || `STATION ${i + 2}`,
}));

export const BEST_WORK_CONFIG: BestWorkConfig = {
  theme: {
    beige: "#ECE8E1",
    blue: "#0F35FF",
    navy: "#0B0B0B",
  },
  sectionHeader: {
    badge: "Section 04",
    titleFirstWord: "Best",
    titleSecondWord: "Work",
  },
  routeBoard: {
    boardBg: "#d9d9d9",
    dmrcStations,
    dummyStationsList,
    originLabel: "ORIGIN",
  },
  welcomeDoors: {
    hindiHeadingLine1: "दिल्ली मेट्रो में",
    hindiHeadingLine2: "आपका स्वागत है",
    englishSubtitle: "Welcome to Delhi Metro",
    enterButtonText: "ENTER METRO",
  },
  originStation: {
    isOrigin: true,
    name: "NORTH CAMPUS",
    stationName: dmrcStations[0],
    stat: "Origin",
    summary: "INSTRUCTION MANUAL",
    points: [
      `<svg class="w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg> SWIPE L/R`,
      `<svg class="w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> STEP OUT`,
      `<svg class="w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> MIND GAP`,
    ],
    metricLabels: ["SYSTEM", "MODE", "STATUS"],
    metrics: ["ACTIVE", "MANUAL", "READY"],
    keyword: "Terminal",
    instructions: [
      {
        badgeBg: "#D4A017",
        badgeText: "#0B0B0B",
        titleColor: "#D4A017",
        descColor: "#A0A0A0",
        titleFont: "font-['DM_Mono']",
        titleSize: "text-[9px] md:text-[10px]",
        descSize: "text-[9px] md:text-[10px]",
        title: "Navigate",
        description: "Arrow keys to browse projects.",
        iconSvgPath: "M5 12h14M12 5l7 7-7 7",
      },
      {
        badgeBg: "#0F35FF",
        badgeText: "#FFFFFF",
        titleColor: "#FFFFFF",
        descColor: "rgba(255,255,255,0.55)",
        titleFont: "font-['Inter']",
        titleSize: "text-[10px] md:text-[11px]",
        descSize: "text-[10px] md:text-[11px]",
        title: "Step Out",
        description: "Yellow button → deep-dive the project.",
        iconSvgPath: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
      },
    ],
  },
  train: {
    graffitiText: "driven by a self proclaimed artist",
    bodyLabel: "BLUE LINE // DELHI METRO",
    secondaryAnnouncements: [
      "kripya darwazo se duri banaye rakhein",
      "apni zaruri vastuon ka dhyan rakhein",
      "darwaze bayin aur khulenge",
    ],
    stepOutLine1: "STEP OUT FOR",
    stepOutLine2: "DISSECTION",
    returnButtonText: "Return to Platform",
  },
  platform: {
    leftPrimary: "built in new delhi",
    leftSeparator: "///",
    leftSecondary: "powered by caffeine",
    rightCautionPrefix: "caution:",
    rightCautionHighlight: "can run even after 11pm due to late night designing hobby",
  },
  projects: enrichedProjects,
};
