import { Link } from 'react-router-dom';

const ZONES = [
  {
    to: '/zone-1',
    zone: 'Zone 1 – Behoeften',
    title: 'Welke behoefte zie jij?',
    text: 'Ontdek hoe mensen verschillende behoeften herkennen achter middelengebruik.',
    accent: '#B9694A',
    dots: ['#6F8F77', '#B9694A', '#58708F', '#B88D33', '#86648A'],
    icon: (
      <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="14" r="5" /><circle cx="36" cy="14" r="5" /><circle cx="24" cy="36" r="5" />
        <path d="M15.5 17.5L21 32M32.5 17.5L27 32M17 14h14" />
      </svg>
    ),
  },
  {
    to: '/zone-2',
    zone: 'Zone 2 – Systemen',
    title: 'Volg het middel',
    text: 'Onderzoek hoe wetgeving invloed heeft op de verschillende onderdelen van de handel in middelen.',
    accent: '#2b7bc4',
    dots: ['#e08a1e', '#2e9a58', '#cc3f86'],
    icon: (
      <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="24" r="4.5" /><circle cx="24" cy="24" r="4.5" /><circle cx="40" cy="24" r="4.5" />
        <path d="M12 21c3-4 5-4 8 0M28 21c3-4 5-4 8 0" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 fade-in-home">
      <p className="uppercase tracking-[0.22em] text-sm text-[#8A7E73]">Wereldmuseum</p>
      <h1 className="font-display text-[3.6rem] leading-[1.05] mt-4 text-center">DOPE – Interactieve prototypes</h1>
      <p className="mt-5 text-xl text-[#5E544C] max-w-2xl text-center leading-relaxed">
        Ontdek de interactieve concepten voor de verschillende zones van de tentoonstelling.
      </p>

      <div className="mt-14 grid gap-8 w-full max-w-5xl md:grid-cols-2">
        {ZONES.map(z => (
          <Link
            key={z.to}
            to={z.to}
            className="group text-left rounded-[1.75rem] bg-white p-9 flex flex-col transition-all duration-200 shadow-[0_14px_30px_-18px_rgba(60,40,20,.35)] hover:-translate-y-1 hover:shadow-[0_24px_44px_-20px_rgba(60,40,20,.45)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2B2622]/30"
          >
            <div className="flex items-center justify-between">
              <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: z.accent }}>
                {z.icon}
              </span>
              <span className="flex gap-1.5">
                {z.dots.map(c => <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
              </span>
            </div>
            <p className="mt-7 text-sm uppercase tracking-[0.18em] text-[#8A7E73] font-medium">{z.zone}</p>
            <h2 className="font-display text-[2.2rem] leading-tight mt-2">{z.title}</h2>
            <p className="mt-3 text-lg text-[#5E544C] leading-relaxed flex-1">{z.text}</p>
            <span className="mt-8 self-start inline-flex items-center gap-2 rounded-full bg-[#2B2622] text-[#F5F0E8] px-7 py-3.5 text-lg font-medium shadow-[0_12px_28px_-14px_rgba(43,38,34,.6)] transition-transform group-active:scale-[.97]">
              Open interactie
              <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-14 text-sm text-[#9B8F83]">Prototypes · alle inhoud is voorbeeldinhoud</p>
    </div>
  );
}
