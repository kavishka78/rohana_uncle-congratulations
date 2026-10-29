import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, RotateCcw, Sparkles } from 'lucide-react';
import Envelope from './Envelope';
import PersonalNote from './PersonalNote';
import { greeting } from './config';
const Showroom = lazy(() => import('./Showroom'));
export default function App() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
    function navigate(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const target = link && document.getElementById(link.getAttribute('href')!.slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    document.addEventListener('click', navigate);
    return () => document.removeEventListener('click', navigate);
  }, []);
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setReduced(media.matches); media.addEventListener('change', change); return () => { media.removeEventListener('change', change); clearTimeout(timer.current); }; }, []);
  useEffect(() => { if (opened) title.current?.focus(); }, [opened]);
  function open() { setOpening(true); timer.current = setTimeout(() => { setOpened(true); setOpening(false); window.scrollTo(0, 0); }, reduced ? 0 : 1000); }
  function replay() { setOpened(false); setOpening(false); window.scrollTo(0, 0); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.gold-button')?.focus()); }
  if (!opened) return <Envelope opening={opening} onOpen={open}/>;
  return <div className="reveal" id="top"><div className="gold-dust" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${i * .08}s` }}/>)}</div><a href="#personal-note" className="skip-link">Skip to personal message</a>
    <header className="site-header"><a href="#top" className="wordmark"><span className="brand">R<span>.</span></span><span>THE NEXT CHAPTER</span></a><a href="#personal-note" className="header-note">A NOTE FOR YOU <ArrowUpRight size={14}/></a><button onClick={replay} className="replay" aria-label="Replay the surprise"><RotateCcw size={14}/><span>Replay the surprise</span></button></header>
    <main><section className="hero"><div className="hero-topline"><p className="eyebrow"><span className="tiny-line"/> A NEW CHAPTER. NEW JOURNEYS.</p><span className="edition">A SPECIAL CELEBRATION / 2026</span></div><div className="hero-title"><h1 tabIndex={-1} ref={title}>Congratulations,<br/><i>{greeting.name}.</i></h1><div className="hero-aside"><Sparkles size={22}/><p>{greeting.subtitle}</p><a href="#showroom">YOUR NEXT ADVENTURE <ArrowDown size={15}/></a></div></div>
      <Suspense fallback={<div className="showroom loading-scene" role="status">Preparing your showroom…</div>}><Showroom reduced={reduced}/></Suspense>
      <div className="vehicle-caption"><div><p className="eyebrow">THE START OF SOMETHING SPECIAL</p><h2>{greeting.vehicle}</h2></div><p>Every road has a story.<br/><span>Here’s to the ones you’ll make.</span></p><a href="#personal-note" aria-label="Read your personal note"><ArrowDown size={20}/></a></div>
    </section><div className="chapter-divider"><span>GOOD THINGS ARE WORTH CELEBRATING</span><Sparkles size={18}/><span>GREAT JOURNEYS ARE WORTH SHARING</span></div><PersonalNote/><section className="closing"><p className="eyebrow">HERE’S TO WHAT’S NEXT</p><h2>Happy miles.<br/><i>Beautiful memories.</i></h2><p>Enjoy every moment behind the wheel, {greeting.name}.</p><button className="gold-button" onClick={replay}>RELIVE THE MOMENT <RotateCcw size={16}/></button></section></main><footer className="site-footer"><span className="brand">R<span>.</span></span><p>Made with love by {greeting.sender}. For {greeting.name}.</p><span><a href={import.meta.env.BASE_URL + 'models/license.txt'} target="_blank" rel="noreferrer">3D model credits</a> · 2026 · THE JOURNEY BEGINS</span></footer>
  </div>;
}
