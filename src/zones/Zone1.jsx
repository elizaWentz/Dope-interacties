/* Zone 1 – Welke behoefte zie jij?
   Overgenomen uit het bestaande prototype. Aangepast is alleen wat nodig was
   om binnen de gezamenlijke website te werken: imports/export, de CSS
   in zone1.css (onder .z1) en de knop "Terug naar startscherm" in de header. */
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import './zone1.css';

/* ------------------------------------------------------------------ */
/* Inhoud en fictieve demonstratiedata                                 */
/* ------------------------------------------------------------------ */
const NEEDS = [
  { id: 'ontspanning', label: 'Ontspanning', color: '#6F8F77' },
  { id: 'verbinding',  label: 'Verbinding',  color: '#B9694A' },
  { id: 'ontsnapping', label: 'Ontsnapping', color: '#58708F' },
  { id: 'plezier',     label: 'Plezier',     color: '#B88D33' },
  { id: 'erbij',       label: 'Erbij horen', color: '#86648A' },
];
const NEED = Object.fromEntries(NEEDS.map(n => [n.id, n]));

const SCENES = [
  { id: 'kroeg', title: 'In de kroeg' },
  { id: 'thuis', title: 'Alleen thuis' },
  { id: 'feest', title: 'Op een feestje' },
];

const GROUPS = [
  { id: 'avontuurlijk', label: 'Avontuurlijk', desc: 'Staat relatief open tegenover middelengebruik.', n: 412 },
  { id: 'zoekend',      label: 'Zoekend',      desc: 'Twijfelt, onderzoekt en stelt vragen.',          n: 538 },
  { id: 'voorzichtig',  label: 'Voorzichtig',  desc: 'Kijkt relatief kritisch naar middelengebruik.',  n: 351 },
];
const TOTAL = GROUPS.reduce((a, g) => a + g.n, 0);

// Percentage bezoekers per groep [avontuurlijk, zoekend, voorzichtig] dat de behoefte koos. FICTIEF.
const DATA = {
  kroeg: { ontspanning: [22, 18, 14], verbinding: [71, 66, 63], ontsnapping: [6, 11, 17], plezier: [64, 52, 48], erbij: [24, 33, 41] },
  thuis: { ontspanning: [58, 61, 44], verbinding: [9, 7, 12],   ontsnapping: [31, 44, 39], plezier: [27, 14, 11], erbij: [4, 6, 3] },
  feest: { ontspanning: [8, 6, 10],   verbinding: [21, 18, 26], ontsnapping: [38, 27, 22], plezier: [19, 12, 15], erbij: [69, 74, 71] },
};
const pct = (scene, need) => Math.round(DATA[scene][need].reduce((a, v, i) => a + v * GROUPS[i].n, 0) / TOTAL);
const joinNL = arr => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' en ' + arr[arr.length - 1];

/* ------------------------------------------------------------------ */
/* Bewegende scènes (tijdelijke videoplaceholders)                     */
/* ------------------------------------------------------------------ */
const o = (x, y, anim, delay) => ({
  transformBox: 'view-box', transformOrigin: `${x}px ${y}px`,
  animation: anim, animationDelay: delay != null ? `${delay}s` : undefined,
});
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}

function Hair({ type, color }) {
  const short = <path d="M-28 -164 C-32 -200 32 -200 28 -164 C24 -182 -22 -184 -28 -164Z" fill={color} />;
  if (type === 'long') return <path d="M-31 -160 C-36 -204 36 -204 31 -160 L33 -122 L21 -124 L23 -168 C10 -182 -12 -182 -23 -168 L-21 -124 L-33 -122Z" fill={color} />;
  if (type === 'bun') return <g><circle cx="0" cy="-198" r="13" fill={color} />{short}</g>;
  if (type === 'curly') return <g fill={color}>{[[-22, -180], [-9, -192], [7, -194], [21, -184], [27, -168], [-28, -167]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="12" />)}</g>;
  return short;
}
function Face({ type }) {
  if (type === 'none') return null;
  const ink = '#2A1E18';
  const eyes = type === 'laugh'
    ? <g stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round"><path d="M-13 -165 Q-9 -171 -5 -165" /><path d="M5 -165 Q9 -171 13 -165" /></g>
    : <g fill={ink}><circle cx="-9" cy="-166" r="3.2" /><circle cx="9" cy="-166" r="3.2" /></g>;
  const mouths = {
    smile: <path d="M-9 -150 Q0 -142 9 -150" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />,
    laugh: <path d="M-10 -152 Q0 -136 10 -152 Z" fill="#5A2320" />,
    neutral: <path d="M-7 -149 L7 -149" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />,
    calm: <path d="M-7 -150 Q0 -146 7 -150" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />,
    unsure: <path d="M-8 -148 Q0 -150 8 -147" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />,
  };
  return <g>{eyes}{mouths[type] || mouths.smile}</g>;
}
function Hold({ type, x, y }) {
  if (type === 'beer') return <g><rect x={x - 11} y={y - 40} width="22" height="42" rx="3" fill="#D99A2B" opacity=".93" /><rect x={x - 11} y={y - 44} width="22" height="9" rx="3" fill="#F7EBD0" /></g>;
  if (type === 'wine') return <g><path d={`M${x - 12} ${y - 50} Q${x} ${y - 14} ${x + 12} ${y - 50} Z`} fill="#6A1C2A" /><path d={`M${x - 13} ${y - 52} Q${x} ${y - 10} ${x + 13} ${y - 52}`} fill="none" stroke="#F3E9E0" strokeOpacity=".5" strokeWidth="2" /><line x1={x} y1={y - 30} x2={x} y2={y} stroke="#E8DED2" strokeWidth="3" /></g>;
  if (type === 'cup') return <g><path d={`M${x - 14} ${y - 46} L${x + 14} ${y - 46} L${x + 10} ${y + 2} L${x - 10} ${y + 2} Z`} fill="#B8433A" /><rect x={x - 15} y={y - 49} width="30" height="5" rx="2" fill="#F1E6DA" /></g>;
  return null;
}
function Arm({ side, sleeve, skin, hold, anim, delay = 0 }) {
  const s = side, hx = 58 * s, hy = -50;
  return (
    <g style={anim ? o(34 * s, -108, anim, delay) : undefined}>
      <path d={`M${34 * s} -108 Q${56 * s} -80 ${hx} ${hy}`} stroke={sleeve} strokeWidth="22" fill="none" strokeLinecap="round" />
      <Hold type={hold} x={hx} y={hy} />
      <circle cx={hx} cy={hy + 2} r="10.5" fill={skin} />
    </g>
  );
}
function Person({ x, y, s = 1, flip, shirt, skin, hair, hairType = 'short', face = 'smile',
                  body, bodyDelay = 0, head, headDelay = 0, armR, armL, customArms }) {
  const sleeve = shade(shirt, -0.14);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g style={body ? o(0, 0, body, bodyDelay) : undefined}>
        <path d="M-46 6 C-52 -64 -44 -116 0 -122 C44 -116 52 -64 46 6 Z" fill={shirt} />
        <rect x="-9" y="-140" width="18" height="24" rx="7" fill={skin} />
        <g style={head ? o(0, -134, head, headDelay) : undefined}>
          <ellipse cx="0" cy="-163" rx="27" ry="30" fill={skin} />
          <Hair type={hairType} color={hair} />
          <Face type={face} />
        </g>
        {customArms || (<>
          <Arm side={-1} sleeve={sleeve} skin={skin} {...(armL || {})} />
          <Arm side={1} sleeve={sleeve} skin={skin} {...(armR || {})} />
        </>)}
      </g>
    </g>
  );
}
const Vignette = () => (
  <>
    <defs>
      <radialGradient id="vig" cx="50%" cy="50%" r="75%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity=".55" />
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#vig)" />
  </>
);

/* Fragment 1: de kroeg */
function TableBeer({ x, y }) {
  return (
    <g>
      <rect x={x - 13} y={y - 46} width="26" height="48" rx="3" fill="#D99A2B" opacity=".92" />
      <rect x={x - 13} y={y - 50} width="26" height="10" rx="3" fill="#F7EBD0" />
      {[0, 1, 2].map(k => <circle key={k} cx={x - 6 + k * 6} cy={y - 6} r="2" fill="#FFF3D6" style={{ animation: `rise ${2.2 + k * .3}s ease-in infinite`, animationDelay: `${-k * .7}s` }} />)}
    </g>
  );
}
function Kroeg() {
  const bottleCols = ['#5E7A3A', '#9A5A22', '#C9A15A', '#3E5C6E', '#7B2E2E', '#B8B09A'];
  const bottles = [];
  [236, 346].forEach((sy, r) => {
    for (let k = 0; k < 15; k++) {
      const bx = 150 + k * 47, h = 48 + ((k * 37 + r * 11) % 40);
      bottles.push(<g key={`${r}-${k}`}><rect x={bx} y={sy - h} width="24" height={h} rx="5" fill={bottleCols[(k + r * 2) % 6]} opacity=".85" /><rect x={bx + 8} y={sy - h - 18} width="8" height="20" rx="2" fill={bottleCols[(k + r * 2) % 6]} opacity=".85" /></g>);
    }
  });
  const toast = 'toastR 6s ease-in-out infinite';
  return (
    <>
      <defs>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A2C1E" /><stop offset="1" stopColor="#24140C" /></linearGradient>
        <radialGradient id="k-glow"><stop offset="0" stopColor="#FFCF86" stopOpacity=".5" /><stop offset="1" stopColor="#FFCF86" stopOpacity="0" /></radialGradient>
        <linearGradient id="k-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8E5A35" /><stop offset="1" stopColor="#5C371F" /></linearGradient>
      </defs>
      <g className="cam">
        <rect width="1600" height="900" fill="url(#k-wall)" />
        {[...Array(16)].map((_, k) => <rect key={k} x={k * 104} y="0" width="2" height="900" fill="#000" opacity=".12" />)}
        <rect x="120" y="140" width="770" height="330" rx="6" fill="#1E110A" opacity=".55" />
        <rect x="120" y="236" width="770" height="10" fill="#2E1A0F" />
        <rect x="120" y="346" width="770" height="10" fill="#2E1A0F" />
        {bottles}
        <ellipse cx="1200" cy="240" rx="260" ry="130" fill="url(#k-glow)" />
        <g style={{ animation: 'flicker 3.4s infinite' }}>
          <rect x="1010" y="170" width="380" height="140" rx="70" fill="none" stroke="#F2B66B" strokeWidth="5" />
          <text x="1200" y="264" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="76" fill="#F7C987">Café</text>
        </g>
        <Person x={540} y={610} s={.82} shirt="#2E3B36" skin="#C98E6B" hair="#2A1C14" face="smile"
                body="bob 3s ease-in-out infinite" armR={{ hold: 'beer', anim: 'talkR 3.4s ease-in-out infinite' }} />
        <rect x="60" y="500" width="880" height="160" fill="#2A170E" />
        <rect x="60" y="492" width="880" height="16" rx="4" fill="#7A4A2C" />
        {[[420, 0], [800, -1.3], [1180, -2.1]].map(([lx, d], k) => (
          <g key={k} style={o(lx, 0, `lamp ${4 + k * .7}s ease-in-out infinite`, d)}>
            <circle cx={lx} cy="160" r="200" fill="url(#k-glow)" />
            <line x1={lx} y1="0" x2={lx} y2="118" stroke="#1A0F09" strokeWidth="3" />
            <path d={`M${lx - 42} 160 L${lx - 16} 116 L${lx + 16} 116 L${lx + 42} 160 Z`} fill="#3B2416" />
            <ellipse cx={lx} cy="160" rx="40" ry="7" fill="#FFD48A" />
          </g>
        ))}
        <Person x={660} y={712} s={1.12} shirt="#7D5A4F" skin="#E0B08E" hair="#5A3A22" hairType="long" face="laugh"
                body="laughBody 2.3s ease-in-out infinite" head="laughHead 2.3s ease-in-out infinite"
                armR={{ hold: 'beer', anim: toast }} />
        <Person x={945} y={712} s={1.12} flip shirt="#3F5866" skin="#8C5A3C" hair="#1E140E" hairType="curly" face="smile"
                body="laughBody 2.7s ease-in-out infinite" bodyDelay={-.8} head="laughHead 2.7s ease-in-out infinite" headDelay={-.8}
                armR={{ hold: 'beer', anim: toast }} />
        <ellipse cx="800" cy="792" rx="424" ry="92" fill="#3A2213" />
        <ellipse cx="800" cy="772" rx="424" ry="88" fill="url(#k-table)" />
        <TableBeer x={770} y={770} />
        <TableBeer x={860} y={784} />
        <Person x={360} y={890} s={1.42} shirt="#5E6E4C" skin="#F0C6A4" hair="#B07A45" face="laugh"
                body="laughBody 2.1s ease-in-out infinite" bodyDelay={-.3} head="laughHead 2.1s ease-in-out infinite" headDelay={-.3}
                armR={{ hold: 'beer', anim: toast }} />
        <Person x={1240} y={890} s={1.42} flip shirt="#A45B3E" skin="#D9A27E" hair="#2F2219" hairType="bun" face="laugh"
                body="laughBody 2.5s ease-in-out infinite" bodyDelay={-1.2} head="laughHead 2.5s ease-in-out infinite" headDelay={-1.2}
                armR={{ hold: 'beer', anim: toast }} armL={{ anim: 'talkL 3s ease-in-out infinite' }} />
        <rect width="1600" height="900" fill="#FF9B3D" opacity=".05" />
      </g>
      <Vignette />
    </>
  );
}

/* Fragment 2: alleen thuis bij het avondeten */
function ThuisArms({ sleeve, skin }) {
  const sp4 = '.4 0 .2 1', lin = '0 0 1 1';
  const dR = 'M-34 -108 Q-66 -66 -26 -36', dU = 'M-34 -108 Q-84 -92 -18 -114';
  const fR = 'M34 -108 Q66 -66 24 -38', fU = 'M34 -108 Q78 -96 18 -128';
  const kt1 = '0;0.42;0.52;0.66;0.76;1', ks1 = [lin, sp4, lin, sp4, lin].join(';');
  const kt2 = '0;0.06;0.13;0.19;0.27;0.82;0.88;0.93;1', ks2 = [lin, sp4, lin, sp4, lin, sp4, lin, sp4].join(';');
  return (
    <>
      <path stroke={sleeve} strokeWidth="22" fill="none" strokeLinecap="round" d={dR}>
        <animate attributeName="d" dur="9s" repeatCount="indefinite" calcMode="spline" keyTimes={kt1} keySplines={ks1} values={[dR, dR, dU, dU, dR, dR].join(';')} />
      </path>
      <path stroke={sleeve} strokeWidth="22" fill="none" strokeLinecap="round" d={fR}>
        <animate attributeName="d" dur="9s" repeatCount="indefinite" calcMode="spline" keyTimes={kt2} keySplines={ks2} values={[fR, fR, fU, fU, fR, fR, fU, fU, fR].join(';')} />
      </path>
      <g>
        <animateTransform attributeName="transform" type="translate" dur="9s" repeatCount="indefinite" calcMode="spline" keyTimes={kt2} keySplines={ks2}
          values="0 0;0 0;-6 -90;-6 -90;0 0;0 0;-6 -90;-6 -90;0 0" />
        <line x1="24" y1="-38" x2="2" y2="-56" stroke="#CFC8BE" strokeWidth="4" strokeLinecap="round" />
        <path d="M2 -56 L-4 -62 M5 -59 L-1 -65 M8 -61 L2 -67" stroke="#CFC8BE" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="24" cy="-36" r="10.5" fill={skin} />
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" dur="9s" repeatCount="indefinite" calcMode="spline" keyTimes={kt1} keySplines={ks1}
          values="0 0;0 0;8 -78;8 -78;0 0;0 0" />
        <Hold type="wine" x={-26} y={-36} />
        <circle cx="-26" cy="-34" r="10.5" fill={skin} />
      </g>
    </>
  );
}
function Thuis() {
  return (
    <>
      <defs>
        <linearGradient id="t-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A465D" /><stop offset="1" stopColor="#222A39" /></linearGradient>
        <linearGradient id="t-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18264A" /><stop offset=".6" stopColor="#3B3F6B" /><stop offset="1" stopColor="#C77B5C" /></linearGradient>
        <radialGradient id="t-lamp"><stop offset="0" stopColor="#FFDCA3" stopOpacity=".42" /><stop offset="1" stopColor="#FFDCA3" stopOpacity="0" /></radialGradient>
      </defs>
      <g className="cam" style={{ transformOrigin: '930px 560px' }}>
        <rect width="1600" height="900" fill="url(#t-wall)" />
        <rect x="170" y="130" width="440" height="400" rx="4" fill="url(#t-sky)" />
        {[[220, 172], [300, 214], [404, 160], [262, 262], [466, 236], [352, 300], [560, 290]].map(([sx, sy], k) =>
          <circle key={k} cx={sx} cy={sy} r="2.6" fill="#fff" style={{ animation: `twinkle ${2 + k * .4}s ease-in-out infinite`, animationDelay: `${-k * .5}s` }} />)}
        <circle cx="520" cy="205" r="28" fill="#F1E3C2" />
        <g fill="#141B2E">
          <rect x="170" y="430" width="70" height="100" /><rect x="240" y="400" width="60" height="130" /><rect x="300" y="450" width="90" height="80" />
          <rect x="390" y="415" width="55" height="115" /><rect x="445" y="440" width="80" height="90" /><rect x="525" y="420" width="85" height="110" />
        </g>
        {[[190, 450], [258, 420], [272, 460], [320, 470], [404, 440], [466, 462], [545, 445], [580, 480]].map(([wx, wy], k) =>
          <rect key={k} x={wx} y={wy} width="10" height="12" fill="#E9B86A" opacity=".8" style={k % 3 === 0 ? { animation: `twinkle ${3 + k}s ease-in-out infinite` } : undefined} />)}
        <rect x="170" y="130" width="440" height="400" fill="none" stroke="#C9B9A2" strokeWidth="14" />
        <line x1="390" y1="130" x2="390" y2="530" stroke="#C9B9A2" strokeWidth="9" />
        <line x1="170" y1="330" x2="610" y2="330" stroke="#C9B9A2" strokeWidth="9" />
        <path d="M120 110 Q150 330 125 560 L205 560 Q180 330 205 110 Z" fill="#7E6250" opacity=".92" />
        <g>
          <circle cx="1290" cy="230" r="58" fill="#EDE3D2" />
          <circle cx="1290" cy="230" r="58" fill="none" stroke="#3B3229" strokeWidth="5" />
          {[...Array(12)].map((_, k) => <line key={k} x1="1290" y1="180" x2="1290" y2="188" stroke="#3B3229" strokeWidth="3" transform={`rotate(${k * 30} 1290 230)`} />)}
          <line x1="1290" y1="230" x2="1290" y2="198" stroke="#3B3229" strokeWidth="5" strokeLinecap="round" transform="rotate(-60 1290 230)" />
          <g style={o(1290, 230, 'turn 9s linear infinite')}><line x1="1290" y1="230" x2="1290" y2="186" stroke="#3B3229" strokeWidth="3" strokeLinecap="round" /></g>
          <circle cx="1290" cy="230" r="4" fill="#3B3229" />
        </g>
        <rect x="1040" y="320" width="150" height="110" fill="#5E5248" stroke="#C9B9A2" strokeWidth="8" />
        <path d="M1044 426 L1090 370 L1120 400 L1150 360 L1186 426 Z" fill="#7F8E7A" />
        <circle cx="930" cy="560" r="460" fill="url(#t-lamp)" />
        <g style={o(930, 0, 'lamp 7s ease-in-out infinite')}>
          <line x1="930" y1="0" x2="930" y2="210" stroke="#151A24" strokeWidth="3" />
          <path d="M865 262 L900 208 L960 208 L995 262 Z" fill="#C2A37C" />
          <path d="M870 262 L990 262 L1170 690 L690 690 Z" fill="#FFE2B0" opacity=".09" />
          <ellipse cx="930" cy="262" rx="62" ry="8" fill="#FFE4B5" />
        </g>
        <path d="M540 700 L548 520 Q590 504 632 520 L640 700 Z" fill="#4E3626" />
        <rect x="556" y="540" width="68" height="10" rx="4" fill="#5E4231" />
        <Person x={930} y={728} s={1.35} shirt="#5D6B5B" skin="#E2B596" hair="#3C2A20" hairType="long" face="calm"
                body="breathe 4s ease-in-out infinite" head="chew .9s ease-in-out infinite"
                customArms={<ThuisArms sleeve="#4E5B4C" skin="#E2B596" />} />
        <rect x="440" y="690" width="960" height="230" fill="#6E4A30" />
        <rect x="440" y="684" width="960" height="16" rx="4" fill="#8E623F" />
        <ellipse cx="930" cy="752" rx="130" ry="30" fill="#4F6A6A" opacity=".55" />
        <ellipse cx="930" cy="745" rx="96" ry="21" fill="#F3EEE6" />
        <ellipse cx="910" cy="740" rx="30" ry="9" fill="#C98A45" />
        <ellipse cx="950" cy="742" rx="26" ry="8" fill="#6D8F4E" />
        <ellipse cx="935" cy="733" rx="18" ry="6" fill="#E8D7A6" />
        {[-24, 0, 24].map((dx, k) => <path key={k} d={`M${930 + dx} 722 q-8 -12 0 -24 q8 -12 0 -24`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"
          style={{ animation: `steam ${2.4 + k * .4}s ease-out infinite`, animationDelay: `${-k * .8}s` }} />)}
        <rect x="1162" y="566" width="42" height="140" rx="9" fill="#2C1A20" />
        <rect x="1174" y="518" width="18" height="56" rx="4" fill="#2C1A20" />
        <rect x="1166" y="610" width="34" height="44" fill="#D8C7A8" />
        <rect width="1600" height="900" fill="#FFB86B" opacity=".035" />
      </g>
      <Vignette />
    </>
  );
}

/* Fragment 3: op een feestje */
function SubjectArms({ sleeve, skin }) {
  return (
    <>
      <path d="M-34 -108 Q-44 -52 18 -56" stroke={sleeve} strokeWidth="22" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="-56" r="10.5" fill={skin} />
      <path d="M34 -108 Q62 -72 30 -70" stroke={shade(sleeve, .06)} strokeWidth="22" fill="none" strokeLinecap="round" />
      <Hold type="cup" x={30} y={-70} />
      <circle cx="30" cy="-68" r="10.5" fill={skin} />
    </>
  );
}
function Feest() {
  const dark = ['#3B2E55', '#2E3A55', '#4A2E48', '#35304A', '#2F3E4A'];
  const back = [140, 300, 470, 640, 820, 990, 1160, 1330, 1490];
  const mid = [[150, 1.05, true], [330, .95, false], [700, 1.15, true], [880, 1.0, false], [1300, 1.1, true], [1480, .98, false]];
  return (
    <>
      <defs>
        <linearGradient id="f-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#160F24" /><stop offset="1" stopColor="#2B1D3F" /></linearGradient>
        {['#E46FA4', '#56C2C9', '#E7B64C'].map((c, k) => (
          <linearGradient key={k} id={`f-beam${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".5" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient>
        ))}
        <radialGradient id="f-rim"><stop offset="0" stopColor="#B49AD8" stopOpacity=".32" /><stop offset="1" stopColor="#B49AD8" stopOpacity="0" /></radialGradient>
        <linearGradient id="f-haze" x1="0" y1="0" x2="0" y2="1"><stop offset=".4" stopColor="#6A4C8A" stopOpacity="0" /><stop offset="1" stopColor="#6A4C8A" stopOpacity=".22" /></linearGradient>
      </defs>
      <g className="cam" style={{ transformOrigin: '1080px 560px' }}>
        <rect width="1600" height="900" fill="url(#f-wall)" />
        {[[260, 8, 0], [800, 9.5, -2], [1340, 7, -4]].map(([bx, d, dl], k) => (
          <g key={k} style={{ ...o(bx, 0, `beam ${d}s ease-in-out infinite`, dl), mixBlendMode: 'screen' }}>
            <path d={`M${bx - 14} 0 L${bx + 14} 0 L${bx + 270} 900 L${bx - 270} 900 Z`} fill={`url(#f-beam${k})`} />
          </g>
        ))}
        {[[180, 220, '#E46FA4', 6], [900, 160, '#56C2C9', 7.5], [1250, 300, '#E7B64C', 5.5], [520, 360, '#56C2C9', 8]].map(([cx, cy, c, d], k) =>
          <circle key={k} cx={cx} cy={cy} r="16" fill={c} opacity=".4" style={{ animation: `spot ${d}s ease-in-out infinite`, animationDelay: `${-k * 1.3}s` }} />)}
        {back.map((bx, k) => (
          <Person key={k} x={bx} y={700} s={.62} flip={k % 2 === 0} shirt={dark[k % 5]} skin="#2C2238" hair="#151020" face="none"
                  body={`dance ${.95 + (k % 4) * .1}s ease-in-out infinite`} bodyDelay={-k * .23}
                  armR={k % 3 === 0 ? { anim: 'armUpR 1.1s ease-in-out infinite', delay: -k * .2 } : undefined} />
        ))}
        {mid.map(([mx, s, up], k) => (
          <Person key={k} x={mx} y={820} s={s} flip={k % 2 === 1} shirt={dark[(k + 2) % 5]} skin="#3A2E48" hair="#1A1424" face="none"
                  body={`dance ${1 + (k % 3) * .12}s ease-in-out infinite`} bodyDelay={-k * .31}
                  armR={up ? { anim: 'armUpR 1.2s ease-in-out infinite', delay: -k * .15 } : { hold: 'cup' }} />
        ))}
        <Person x={300} y={905} s={1.45} shirt="#7A4C68" skin="#C68B66" hair="#20150F" hairType="bun" face="laugh"
                body="laughBody 2.2s ease-in-out infinite" head="laughHead 2.2s ease-in-out infinite"
                armR={{ hold: 'cup', anim: 'talkR 2.8s ease-in-out infinite' }} />
        <Person x={520} y={910} s={1.5} flip shirt="#4C6878" skin="#EDC3A0" hair="#7A5230" face="laugh"
                body="laughBody 2.6s ease-in-out infinite" bodyDelay={-.7} head="laughHead 2.6s ease-in-out infinite" headDelay={-.7}
                armR={{ hold: 'cup' }} />
        <ellipse cx="1080" cy="620" rx="280" ry="340" fill="url(#f-rim)" />
        <Person x={1080} y={915} s={1.75} shirt="#CDBFA9" skin="#D8A47F" hair="#4A3324" face="unsure"
                body="shift 4.5s ease-in-out infinite" head="look 9s ease-in-out infinite"
                customArms={<SubjectArms sleeve="#B9AA93" skin="#D8A47F" />} />
        <rect width="1600" height="900" fill="url(#f-haze)" />
      </g>
      <Vignette />
    </>
  );
}

const SCENE_COMP = { kroeg: Kroeg, thuis: Thuis, feest: Feest };
function Scene({ id, mode = 'play' }) {
  const ref = useRef(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg || !svg.pauseAnimations) return;
    try {
      if (mode === 'still') { svg.setCurrentTime(5.3); svg.pauseAnimations(); }
      else if (mode === 'paused') svg.pauseAnimations();
      else svg.unpauseAnimations();
    } catch (e) {}
  }, [mode]);
  const C = SCENE_COMP[id];
  return (
    <svg ref={ref} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"
         className={`block w-full h-full ${mode === 'still' ? 'still' : ''} ${mode === 'paused' ? 'paused' : ''}`}>
      <C />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Interface-onderdelen                                                */
/* ------------------------------------------------------------------ */
function GroupIcon({ id, className = 'w-8 h-8' }) {
  const p = { viewBox: '0 0 48 48', className, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (id === 'avontuurlijk') return <svg {...p}><circle cx="24" cy="24" r="18" /><path d="M31 17l-5 11-9 3 5-11z" fill="currentColor" fillOpacity=".18" /></svg>;
  if (id === 'zoekend') return <svg {...p}><circle cx="21" cy="21" r="12" /><path d="M30 30l10 10" /></svg>;
  return <svg {...p}><path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z" /><circle cx="24" cy="24" r="5" /></svg>;
}

function StaticChip({ need, size = 'md' }) {
  const n = NEED[need];
  const cls = size === 'lg' ? 'text-lg px-4 py-2' : 'text-base px-3.5 py-1.5';
  return <span className={`inline-flex items-center rounded-full text-white font-medium ${cls}`} style={{ background: n.color }}>{n.label}</span>;
}

const STEP_ORDER = ['v0', 'v1', 'v2', 'game', 'mine', 'others', 'groups', 'reflect'];
const STEP_LABELS = ['Fragment 1', 'Fragment 2', 'Fragment 3', 'Koppelen', 'Jouw keuzes', 'Andere bezoekers', 'Onderzoekers', 'Reflectie'];

function Header({ step, researcher, onRestart }) {
  const idx = STEP_ORDER.indexOf(step);
  const g = GROUPS.find(x => x.id === researcher);
  return (
    <header className="h-20 shrink-0 px-10 grid grid-cols-[1fr_auto_1fr] items-center"> {/* was grid-cols-3; aangepast zodat de terugknop past */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl font-semibold tracking-tight">DOPE</span>
        <span className="text-xs uppercase tracking-[0.2em] text-[#8A7E73]">Wereldmuseum · Zone 1 Behoeften</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        {idx >= 0 && (<>
          <div className="flex items-center gap-2">
            {STEP_ORDER.map((s, i) => (
              <span key={s} className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: i === idx ? '2.2rem' : '0.75rem', background: i <= idx ? '#2B2622' : '#DCD3C7' }} />
            ))}
          </div>
          <span className="text-sm text-[#8A7E73]">{STEP_LABELS[idx]}</span>
        </>)}
      </div>
      <div className="flex items-center justify-end gap-4">
        {g && (
          <div className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full bg-white shadow-sm">
            <GroupIcon id={g.id} className="w-6 h-6 text-[#2B2622]" />
            <div className="leading-tight">
              <div className="text-[0.65rem] uppercase tracking-[0.16em] text-[#8A7E73]">Jouw onderzoeker</div>
              <div className="text-sm font-medium">{g.label}</div>
            </div>
          </div>
        )}
        {idx >= 0 && <button onClick={onRestart} className="text-sm text-[#8A7E73] px-3 py-2 rounded-full hover:bg-black/5">↺ Opnieuw</button>}
        {/* Toegevoegd voor de gezamenlijke website */}
        <Link to="/" className="whitespace-nowrap text-sm text-[#5E544C] px-3.5 py-2 rounded-full border border-[#DCD3C7] bg-white/60 hover:bg-white">← Terug naar startscherm</Link>
      </div>
    </header>
  );
}

/* Start: kies een onderzoeker */
function Intro({ researcher, setResearcher, onStart }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-10 pb-12 fade-up">
      <p className="uppercase tracking-[0.22em] text-sm text-[#8A7E73]">Zone 1 · Behoeften</p>
      <h1 className="font-display text-[4.4rem] leading-none mt-4 text-center">Welke behoefte zie jij?</h1>
      <p className="mt-6 text-2xl text-[#5E544C] max-w-3xl text-center leading-relaxed">
        Je bekijkt drie korte fragmenten. Daarna koppel je de behoeften die jij herkent. Er zijn geen goede of foute antwoorden.
      </p>
      <p className="mt-14 mb-6 text-xl font-medium">Met welke onderzoeker ga je op pad?</p>
      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl">
        {GROUPS.map(g => {
          const on = researcher === g.id;
          return (
            <button key={g.id} onClick={() => setResearcher(g.id)}
                    className="text-left rounded-[1.75rem] p-7 transition-all duration-200"
                    style={{ background: on ? '#2B2622' : '#fff', color: on ? '#F5F0E8' : '#2B2622',
                             boxShadow: on ? '0 22px 40px -20px rgba(43,38,34,.7)' : '0 12px 28px -18px rgba(60,40,20,.35)',
                             transform: on ? 'translateY(-4px)' : 'none' }}>
              <GroupIcon id={g.id} className="w-11 h-11" />
              <div className="font-display text-3xl mt-5">{g.label}</div>
              <div className="mt-2 text-lg leading-snug" style={{ opacity: .72 }}>{g.desc}</div>
            </button>
          );
        })}
      </div>
      <button className="btn-primary mt-12" disabled={!researcher} onClick={onStart}>Start met kijken</button>
    </div>
  );
}

/* Stap 1: drie fragmenten na elkaar */
function VideoStep({ index, onNext }) {
  const DUR = 9000;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ended, setEnded] = useState(false);
  const [run, setRun] = useState(0);
  const tRef = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const tick = now => {
      tRef.current = Math.min(DUR, tRef.current + (now - last));
      last = now;
      setT(tRef.current);
      if (tRef.current >= DUR) { setPlaying(false); setEnded(true); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, run]);
  const replay = () => { tRef.current = 0; setT(0); setEnded(false); setPlaying(true); setRun(r => r + 1); };
  const toggle = () => { if (ended) replay(); else setPlaying(p => !p); };
  const sc = SCENES[index];
  const sec = Math.floor(t / 1000);
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-10 pb-8 fade-up">
      <p className="text-lg text-[#8A7E73] font-medium tracking-wide">Fragment {index + 1} van 3</p>
      <h1 className="font-display text-[2.6rem] mt-1 mb-6">{sc.title}</h1>
      <div className="relative rounded-[2rem] overflow-hidden bg-black shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)] cursor-pointer"
           style={{ width: 'min(100%, calc((100vh - 19rem) * 16 / 9))', aspectRatio: '16 / 9' }} onClick={toggle}>
        <Scene key={run} id={sc.id} mode={playing ? 'play' : 'paused'} />
        <div className="absolute top-5 left-6 flex items-center gap-2 text-white/85 text-sm font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${playing ? 'bg-[#E46F5A] soft-pulse' : 'bg-white/50'}`} />
          0:0{sec} / 0:09
        </div>
        <div className="absolute top-5 right-6 text-white/70 text-sm flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M22 9l-6 6M16 9l6 6" /></svg>
          Zonder geluid
        </div>
        {(!playing) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center">
              {ended
                ? <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="#2B2622" strokeWidth="2.2" strokeLinecap="round"><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v4h4" /></svg>
                : <svg viewBox="0 0 24 24" className="w-10 h-10 ml-1" fill="#2B2622"><path d="M7 5l12 7-12 7z" /></svg>}
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/15">
          <div className="h-full bg-white/85" style={{ width: `${(t / DUR) * 100}%` }} />
        </div>
      </div>
      <div className="mt-8 flex items-center gap-5">
        <button className="btn-ghost" onClick={replay}>Opnieuw afspelen</button>
        <button className="btn-primary" disabled={!ended} onClick={onNext}>
          {ended ? (index < 2 ? 'Volgend fragment' : 'Naar de behoeften') : 'Kijk het fragment af'}
        </button>
      </div>
    </div>
  );
}

/* Stap 2: het verbindingsspel */
function Game({ links, setLinks, onDone }) {
  const [selected, setSelected] = useState(null);
  const [drag, setDrag] = useState(null);
  const [lines, setLines] = useState([]);
  const [flash, setFlash] = useState(null);
  const dragRef = useRef(null);
  const wrapRef = useRef(null);
  const cardRefs = useRef([]);
  const chipRefs = useRef({});

  const add = (need, card) => {
    setLinks(prev => prev.map((a, i) => i === card && !a.includes(need) ? [...a, need] : a));
    setFlash({ card, need, key: Date.now() });
  };
  const remove = (need, card) => setLinks(prev => prev.map((a, i) => i === card ? a.filter(x => x !== need) : a));
  const move = (need, from, to) => {
    setLinks(prev => prev.map((a, i) => {
      if (i === from) return a.filter(x => x !== need);
      if (i === to && !a.includes(need)) return [...a, need];
      return a;
    }));
    setFlash({ card: to, need, key: Date.now() });
  };
  const hitTest = (x, y) => {
    for (let i = 0; i < 3; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left - 16 && x <= r.right + 16 && y >= r.top - 16 && y <= r.bottom + 16) return i;
    }
    return null;
  };
  const startDrag = (e, need, from) => {
    if (e.button !== undefined && e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const d = { need, from, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY,
                ox: r.left + r.width / 2, oy: r.top, moved: false, over: null };
    dragRef.current = d;
    setDrag({ ...d });
  };

  const active = !!drag;
  useEffect(() => {
    if (!active) return;
    const mv = e => {
      const d = dragRef.current; if (!d) return;
      d.x = e.clientX; d.y = e.clientY;
      if (!d.moved && Math.hypot(d.x - d.sx, d.y - d.sy) > 8) d.moved = true;
      d.over = d.moved ? hitTest(d.x, d.y) : null;
      setDrag({ ...d });
    };
    const up = e => {
      const d = dragRef.current;
      dragRef.current = null; setDrag(null);
      if (!d) return;
      if (!d.moved) {
        if (d.from === null) setSelected(s => s === d.need ? null : d.need);
        return;
      }
      const over = hitTest(e.clientX, e.clientY);
      if (d.from === null) { if (over !== null) { add(d.need, over); setSelected(null); } }
      else if (over === null) remove(d.need, d.from);
      else if (over !== d.from) move(d.need, d.from, over);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [active]);

  useLayoutEffect(() => {
    const calc = () => {
      const w = wrapRef.current; if (!w) return;
      const wr = w.getBoundingClientRect();
      const out = [];
      links.forEach((arr, i) => {
        const card = cardRefs.current[i]; if (!card) return;
        const cr = card.getBoundingClientRect();
        arr.forEach((need, k) => {
          const ch = chipRefs.current[need]; if (!ch) return;
          const r = ch.getBoundingClientRect();
          const spread = (k - (arr.length - 1) / 2) * 14;
          out.push({ key: need + i, need, x1: r.left + r.width / 2 - wr.left, y1: r.top - wr.top,
                     x2: cr.left + cr.width / 2 + spread - wr.left, y2: cr.bottom - wr.top });
        });
      });
      setLines(out);
    };
    calc();
    const t = setTimeout(calc, 400);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(calc);
    window.addEventListener('resize', calc);
    return () => { clearTimeout(t); window.removeEventListener('resize', calc); };
  }, [links]);

  const allDone = links.every(a => a.length > 0);
  const remaining = links.filter(a => a.length === 0).length;
  const dragging = drag && drag.moved;
  const activeNeed = dragging ? drag.need : selected;
  const wr = wrapRef.current ? wrapRef.current.getBoundingClientRect() : null;

  return (
    <div ref={wrapRef} className="relative min-h-full flex flex-col px-10 pt-1 pb-8 select-none">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {lines.map(l => {
          const c = NEED[l.need].color;
          const op = activeNeed ? (activeNeed === l.need ? .95 : .12) : .45;
          return (
            <g key={l.key} style={{ opacity: op, transition: 'opacity .3s' }}>
              <path d={`M${l.x1} ${l.y1} C${l.x1} ${l.y1 - 90} ${l.x2} ${l.y2 + 90} ${l.x2} ${l.y2}`} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={l.x1} cy={l.y1} r="4" fill={c} />
              <circle cx={l.x2} cy={l.y2} r="5.5" fill={c} />
            </g>
          );
        })}
        {dragging && wr && drag.from === null && (() => {
          const x1 = drag.ox - wr.left, y1 = drag.oy - wr.top, x2 = drag.x - wr.left, y2 = drag.y - wr.top;
          return <path d={`M${x1} ${y1} C${x1} ${y1 - 80} ${x2} ${y2 + 80} ${x2} ${y2}`} fill="none"
                       stroke={NEED[drag.need].color} strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />;
        })()}
      </svg>

      <div className="relative z-10 text-center mb-6 fade-up">
        <h1 className="font-display text-[2.5rem] leading-tight">Welke behoeften of gevoelens herken jij in deze situaties?</h1>
        <p className="mt-2 text-lg text-[#7A6F66] h-7">
          {selected
            ? <span>Tik nu op een situatie om <b style={{ color: NEED[selected].color }}>{NEED[selected].label}</b> te koppelen.</span>
            : 'Sleep behoeften naar de situaties, of tik op een behoefte en daarna op een situatie. Er is geen goed of fout.'}
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-8">
        {SCENES.map((sc, i) => {
          const over = dragging && drag.over === i;
          const hl = over ? NEED[drag.need].color : null;
          const shadow = over ? `0 0 0 4px ${hl}, 0 26px 44px -20px rgba(60,40,20,.45)`
                       : selected ? `0 0 0 3px ${NEED[selected].color}66, 0 14px 30px -18px rgba(60,40,20,.3)`
                       : '0 14px 30px -18px rgba(60,40,20,.3)';
          return (
            <div key={sc.id} ref={el => (cardRefs.current[i] = el)}
                 onClick={() => { if (selected) { add(selected, i); setSelected(null); } }}
                 className={`rounded-[1.75rem] bg-white transition-all duration-200 ${selected ? 'cursor-pointer' : ''}`}
                 style={{ boxShadow: shadow, transform: over ? 'translateY(-4px) scale(1.015)' : 'none' }}>
              <div className="relative aspect-video rounded-t-[1.75rem] overflow-hidden bg-[#2a2420]">
                <Scene id={sc.id} mode="still" />
                <div className="absolute inset-x-0 bottom-0 px-5 pt-10 pb-4 bg-gradient-to-t from-black/65 to-transparent text-white">
                  <div className="text-xs uppercase tracking-[0.18em] opacity-80">Fragment {i + 1}</div>
                  <div className="font-display text-2xl">{sc.title}</div>
                </div>
                {selected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="px-5 py-2.5 rounded-full bg-white/95 text-base font-medium soft-pulse">+ {NEED[selected].label}</span>
                  </div>
                )}
              </div>
              <div className="p-4 min-h-[8.5rem] flex flex-wrap content-start gap-2.5">
                {links[i].length === 0 && (
                  <div className="w-full h-[6.8rem] rounded-2xl border-2 border-dashed flex items-center justify-center text-base transition-colors"
                       style={{ borderColor: over ? hl : '#DCD2C4', color: over ? hl : '#A3978B' }}>
                    Sleep hier een behoefte naartoe
                  </div>
                )}
                {links[i].map(nid => {
                  const n = NEED[nid];
                  const isFlash = flash && flash.card === i && flash.need === nid;
                  const ghosted = dragging && drag.from === i && drag.need === nid;
                  return (
                    <div key={nid + (isFlash ? flash.key : '')}
                         onPointerDown={e => startDrag(e, nid, i)}
                         className={`touch-none flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full text-white text-lg font-medium cursor-grab ${isFlash ? 'pop' : ''}`}
                         style={{ background: n.color, opacity: ghosted ? .3 : 1 }}>
                      {n.label}
                      <button aria-label={`Verwijder ${n.label}`} onPointerDown={e => e.stopPropagation()}
                              onClick={e => { e.stopPropagation(); remove(nid, i); }}
                              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-xl leading-none">×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 min-h-[4.5rem]" />

      <div className="relative z-10 flex justify-center gap-5 flex-wrap">
        {NEEDS.map(n => {
          const isSel = selected === n.id;
          const isDrag = dragging && drag.from === null && drag.need === n.id;
          return (
            <div key={n.id} ref={el => (chipRefs.current[n.id] = el)} onPointerDown={e => startDrag(e, n.id, null)}
                 className="touch-none cursor-grab flex items-center gap-3 rounded-2xl bg-white px-7 py-5 text-xl font-medium transition-all duration-200"
                 style={{ border: `2px solid ${isSel || isDrag ? n.color : '#E7DFD3'}`,
                          transform: isSel ? 'translateY(-8px)' : 'none',
                          boxShadow: isSel ? `0 18px 30px -16px ${n.color}` : '0 10px 22px -16px rgba(60,40,20,.4)' }}>
              <span className="w-4 h-4 rounded-full" style={{ background: n.color }} />
              {n.label}
              <span className="flex gap-1 ml-1">
                {links.map((a, k) => <span key={k} className="w-2 h-2 rounded-full transition-colors" style={{ background: a.includes(n.id) ? n.color : '#E4DCD0' }} />)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-7 flex items-center justify-between">
        <p className="text-lg text-[#7A6F66]">
          {allDone ? 'Bij elke situatie staat een behoefte. Je kunt nog aanpassen.' : `Nog ${remaining} ${remaining > 1 ? 'situaties' : 'situatie'} zonder behoefte`}
        </p>
        <button className="btn-primary" disabled={!allDone} onClick={onDone}>Bekijk de resultaten</button>
      </div>

      {dragging && (
        <div className="fixed z-50 pointer-events-none px-6 py-3.5 rounded-full text-white text-xl font-medium"
             style={{ left: drag.x, top: drag.y, transform: 'translate(-50%,-50%) scale(1.06)', background: NEED[drag.need].color,
                      boxShadow: '0 20px 34px -12px rgba(0,0,0,.4)' }}>
          {NEED[drag.need].label}
        </div>
      )}
    </div>
  );
}

/* Stap 3: jouw koppelingen */
function Mine({ links, onNext }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-10 pb-10 fade-up">
      <p className="uppercase tracking-[0.2em] text-sm text-[#8A7E73]">Jouw koppelingen</p>
      <h1 className="font-display text-[2.6rem] mt-2 mb-9">Dit herkende jij</h1>
      <div className="grid grid-cols-3 gap-8 w-full max-w-[1400px]">
        {SCENES.map((sc, i) => (
          <div key={sc.id} className="rounded-[1.75rem] bg-white overflow-hidden shadow-[0_14px_30px_-18px_rgba(60,40,20,.3)]">
            <div className="aspect-video"><Scene id={sc.id} mode="still" /></div>
            <div className="p-6">
              <div className="font-display text-2xl mb-4">{sc.title}</div>
              <div className="flex flex-wrap gap-2">{links[i].map(nid => <StaticChip key={nid} need={nid} size="lg" />)}</div>
            </div>
          </div>
        ))}
      </div>
      <h2 className="font-display text-3xl mt-12 text-center max-w-3xl leading-snug">Denk je dat anderen in deze situaties dezelfde behoeften herkennen?</h2>
      <button className="btn-primary mt-8" onClick={onNext}>Vergelijk met andere bezoekers</button>
    </div>
  );
}

function Bar({ value, color, strong, delay = 0, height = 'h-10' }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 80 + delay); return () => clearTimeout(t); }, [value]);
  return (
    <div className={`flex-1 ${height} rounded-full bg-[#EFE8DE] overflow-hidden`}>
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color, opacity: strong ? 1 : .42, transition: 'width .9s cubic-bezier(.2,.7,.2,1)' }} />
    </div>
  );
}

const Disclaimer = () => (
  <p className="text-sm text-[#9B8F83]">Fictieve demonstratiedata van {TOTAL.toLocaleString('nl-NL')} bezoekers. Dit zijn geen echte bezoekersresultaten.</p>
);

/* Stap 4: andere bezoekers, fragment voor fragment */
function Others({ links, onNext }) {
  const [i, setI] = useState(0);
  const sc = SCENES[i];
  const mine = links[i];
  const rows = NEEDS.map(n => ({ ...n, p: pct(sc.id, n.id), mine: mine.includes(n.id) })).sort((a, b) => b.p - a.p);
  const rare = rows.filter(r => r.mine && r.p < 25);
  const common = mine.length > 0 && rows.filter(r => r.mine).every(r => r.p >= 50);
  return (
    <div className="min-h-full flex flex-col px-14 pb-10">
      <div key={sc.id} className="flex-1 grid grid-cols-[0.9fr_1.25fr] gap-14 items-center fade-up">
        <div>
          <p className="text-lg text-[#8A7E73] font-medium">Fragment {i + 1} van 3</p>
          <h1 className="font-display text-[2.6rem] mt-1 mb-6">{sc.title}</h1>
          <div className="rounded-[1.75rem] overflow-hidden aspect-video shadow-[0_14px_30px_-18px_rgba(60,40,20,.4)]"><Scene id={sc.id} mode="still" /></div>
          <div className="mt-7 rounded-[1.5rem] bg-white p-6">
            <p className="text-xl">
              <span className="text-[#8A7E73]">Jij koos </span>
              <b className="font-semibold">{joinNL(mine.map(m => NEED[m].label))}</b>
            </p>
            <div className="mt-4 space-y-2.5">
              {mine.map(m => (
                <div key={m} className="flex items-center gap-3 text-lg">
                  <span className="w-3 h-3 rounded-full" style={{ background: NEED[m].color }} />
                  <span><b>{pct(sc.id, m)}%</b> van de andere bezoekers koos ook {NEED[m].label.toLowerCase()}</span>
                </div>
              ))}
            </div>
            {rare.length > 0 && <p className="mt-4 text-[#7A6F66]">Minder dan een kwart zag hier {joinNL(rare.map(r => r.label.toLowerCase()))}. Jij kijkt hier anders dan de meesten.</p>}
            {rare.length === 0 && common && <p className="mt-4 text-[#7A6F66]">Hier zag je hetzelfde als veel anderen.</p>}
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl mb-2">Wat zagen andere bezoekers?</h2>
          <p className="text-lg text-[#7A6F66] mb-8">Percentage bezoekers dat deze behoefte bij dit fragment koos.</p>
          <div className="space-y-5">
            {rows.map((r, k) => (
              <div key={r.id} className="flex items-center gap-5">
                <div className="w-48 flex items-center gap-2.5 text-xl">
                  <span className={r.mine ? 'font-semibold' : 'text-[#5E544C]'}>{r.label}</span>
                  {r.mine && <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: r.color }}>Jij</span>}
                </div>
                <Bar key={sc.id + r.id} value={r.p} color={r.color} strong={r.mine} delay={k * 90} />
                <div className={`w-16 text-right text-2xl tabular-nums ${r.mine ? 'font-semibold' : 'text-[#5E544C]'}`}>{r.p}%</div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base text-[#7A6F66]">Bezoekers konden meerdere behoeften kiezen. Daarom tellen de percentages niet op tot 100%.</p>
          <div className="mt-2"><Disclaimer /></div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-6">
        <button className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Vorig fragment</button>
        <div className="flex gap-2">{SCENES.map((_, k) => <span key={k} className="w-2.5 h-2.5 rounded-full" style={{ background: k === i ? '#2B2622' : '#DCD3C7' }} />)}</div>
        {i < 2
          ? <button className="btn-primary" onClick={() => setI(i + 1)}>Volgend fragment →</button>
          : <button className="btn-primary" onClick={onNext}>Vergelijk de onderzoekers</button>}
      </div>
    </div>
  );
}

/* Stap 5: vergelijk de drie onderzoekers */
function Groups({ links, researcher, onNext }) {
  const [v, setV] = useState(0);
  const firstNeed = vi => links[vi][0] || 'verbinding';
  const [need, setNeed] = useState(firstNeed(0));
  const sc = SCENES[v];
  const vals = DATA[sc.id][need];
  const n = NEED[need];
  const max = Math.max(...vals), min = Math.min(...vals);
  const maxG = GROUPS[vals.indexOf(max)], minG = GROUPS[vals.indexOf(min)];
  const spread = max - min;
  const insight = spread <= 8
    ? 'Hier zijn de drie groepen het opvallend eens.'
    : `Bezoekers met een ${maxG.label.toLowerCase()} onderzoeker zagen dit het vaakst, die met een ${minG.label.toLowerCase()} onderzoeker het minst. Een verschil van ${spread} procentpunt.`;
  return (
    <div className="min-h-full flex flex-col px-14 pb-10 fade-up">
      <div className="text-center">
        <h1 className="font-display text-[2.6rem]">Zien andere onderzoekers hetzelfde als jij?</h1>
        <p className="text-lg text-[#7A6F66] mt-2">Kies een fragment en een behoefte. Je ziet per onderzoeker hoeveel procent die behoefte koos.</p>
      </div>
      <div className="flex-1 grid grid-cols-[19rem_1fr] gap-12 mt-6 items-start">
        <div className="space-y-4">
          {SCENES.map((s, k) => {
            const on = k === v;
            return (
              <button key={s.id} onClick={() => { setV(k); setNeed(firstNeed(k)); }}
                      className="w-full text-left rounded-[1.4rem] bg-white overflow-hidden transition-all duration-200"
                      style={{ boxShadow: on ? '0 0 0 3px #2B2622, 0 16px 30px -18px rgba(60,40,20,.5)' : '0 10px 22px -18px rgba(60,40,20,.4)', opacity: on ? 1 : .72 }}>
                <div className="aspect-[16/7] overflow-hidden"><Scene id={s.id} mode="still" /></div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="font-display text-xl">{s.title}</span>
                  <span className="text-sm text-[#8A7E73]">Fragment {k + 1}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="rounded-[1.75rem] bg-white px-10 py-8 shadow-[0_14px_30px_-18px_rgba(60,40,20,.3)]">
          <div className="flex flex-wrap gap-3">
            {NEEDS.map(x => {
              const on = x.id === need;
              const mine = links[v].includes(x.id);
              return (
                <button key={x.id} onClick={() => setNeed(x.id)}
                        className="flex items-center gap-2 rounded-full px-5 py-3 text-lg font-medium transition-all duration-200"
                        style={{ background: on ? x.color : '#F3EEE6', color: on ? '#fff' : '#2B2622' }}>
                  {x.label}
                  {mine && <span className="text-[0.65rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                 style={{ background: on ? 'rgba(255,255,255,.25)' : x.color, color: '#fff' }}>Jij</span>}
                </button>
              );
            })}
          </div>
          <h2 className="font-display text-3xl mt-8 mb-6">
            <span style={{ color: n.color }}>{n.label}</span> <span className="text-[#8A7E73]">bij</span> {sc.title.toLowerCase()}
          </h2>
          <div className="space-y-5">
            {GROUPS.map((g, k) => {
              const own = g.id === researcher;
              return (
                <div key={g.id} className="flex items-center gap-6">
                  <div className="w-60 flex items-center gap-3">
                    <GroupIcon id={g.id} className={`w-8 h-8 ${own ? 'text-[#2B2622]' : 'text-[#9B8F83]'}`} />
                    <div className="leading-tight">
                      <div className={`text-xl ${own ? 'font-semibold' : 'text-[#5E544C]'}`}>{g.label}</div>
                      {own && <div className="text-xs uppercase tracking-[0.14em] text-[#8A7E73] mt-0.5">Jouw onderzoeker</div>}
                    </div>
                  </div>
                  <Bar key={sc.id + need + g.id} value={vals[k]} color={n.color} strong={own} delay={k * 110} height="h-12" />
                  <div className={`w-20 text-right text-3xl tabular-nums ${own ? 'font-semibold' : 'text-[#5E544C]'}`}>{vals[k]}%</div>
                </div>
              );
            })}
          </div>
          <p className="mt-7 text-xl leading-snug">{insight}</p>
          <p className="mt-4 text-base text-[#7A6F66]">Dit zegt niets over hoe onderzoekers ‘zijn’. Het laat alleen zien hoe bezoekers die deze onderzoeker kozen, hebben gekozen.</p>
          <div className="mt-1"><Disclaimer /></div>
        </div>
      </div>
      <div className="flex justify-end pt-5">
        <button className="btn-primary" onClick={onNext}>Naar de afsluiting</button>
      </div>
    </div>
  );
}

/* Leermoment */
function Reflect({ links, onRestart }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center px-10 pb-12 fade-up">
      <div className="flex gap-5 mb-9">
        {SCENES.map((s, i) => (
          <div key={s.id} className="relative w-56 rounded-2xl overflow-hidden aspect-video shadow-[0_12px_26px_-16px_rgba(60,40,20,.5)]">
            <Scene id={s.id} mode="still" />
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              {links[i].map(nid => <span key={nid} className="w-3.5 h-3.5 rounded-full ring-2 ring-white" style={{ background: NEED[nid].color }} />)}
            </div>
          </div>
        ))}
      </div>
      <h1 className="font-display text-[3.2rem] leading-tight max-w-4xl">Dezelfde situatie, verschillende interpretaties.</h1>
      <p className="mt-6 text-2xl text-[#5E544C] max-w-3xl leading-relaxed">
        Waar jij misschien ontspanning ziet, herkent iemand anders ontsnapping of verbinding. Wat iemand werkelijk voelt of nodig heeft, kun je niet zomaar aan de buitenkant zien.
      </p>
      <div className="mt-9 px-12 py-7 rounded-[1.75rem] bg-white shadow-[0_14px_30px_-18px_rgba(60,40,20,.3)] max-w-3xl">
        <p className="uppercase tracking-[0.2em] text-sm text-[#8A7E73] mb-3">Denk er even over na</p>
        <p className="font-display text-[2rem] leading-snug">Waarom denk je dat anderen in dezelfde situatie iets anders herkennen dan jij?</p>
      </div>
      <button className="btn-ghost mt-9" onClick={onRestart}>Opnieuw beginnen</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function App() {
  const [step, setStep] = useState('intro');
  const [researcher, setResearcher] = useState(null);
  const [links, setLinks] = useState([[], [], []]);
  const stepRef = useRef(step);
  stepRef.current = step;

  const reset = () => { setStep('intro'); setResearcher(null); setLinks([[], [], []]); };

  // Museumstand: na 3 minuten zonder aanraking terug naar het begin.
  useEffect(() => {
    let t;
    const bump = () => { clearTimeout(t); t = setTimeout(() => { if (stepRef.current !== 'intro') reset(); }, 180000); };
    bump();
    window.addEventListener('pointerdown', bump);
    return () => { clearTimeout(t); window.removeEventListener('pointerdown', bump); };
  }, []);

  let body;
  if (step === 'intro') body = <Intro researcher={researcher} setResearcher={setResearcher} onStart={() => setStep('v0')} />;
  else if (step === 'v0' || step === 'v1' || step === 'v2') {
    const i = +step[1];
    body = <VideoStep key={step} index={i} onNext={() => setStep(i < 2 ? `v${i + 1}` : 'game')} />;
  }
  else if (step === 'game') body = <Game links={links} setLinks={setLinks} onDone={() => setStep('mine')} />;
  else if (step === 'mine') body = <Mine links={links} onNext={() => setStep('others')} />;
  else if (step === 'others') body = <Others links={links} onNext={() => setStep('groups')} />;
  else if (step === 'groups') body = <Groups links={links} researcher={researcher} onNext={() => setStep('reflect')} />;
  else body = <Reflect links={links} onRestart={reset} />;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header step={step} researcher={researcher} onRestart={reset} />
      <main className="flex-1 min-h-0 overflow-y-auto">{body}</main>
    </div>
  );
}

/* Ingang voor de gezamenlijke website */
export default function Zone1() {
  return <div className="z1"><App /></div>;
}
