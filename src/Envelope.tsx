import { ArrowUpRight } from 'lucide-react';
import { greeting } from './config';
export default function Envelope({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  return <main className={`invitation ${opening ? 'opening' : ''}`}>
    <div className="invitation-top"><span className="brand">R<span>.</span></span><span>A LITTLE SOMETHING, JUST FOR YOU</span></div>
    <div className="invitation-content"><p className="eyebrow">WITH LOVE FROM {greeting.sender.toUpperCase()}</p><h1>A special surprise<br/><i>awaits.</i></h1><p className="intro-copy">For a wonderful uncle.<br/>And the beginning of a beautiful new journey.</p>
      <div className="envelope" aria-hidden="true"><div className="envelope-letter">For {greeting.name}<span>A NEW CHAPTER BEGINS</span></div><div className="envelope-flap"/><div className="seal">R</div></div>
      <button className="gold-button" onClick={onOpen} disabled={opening}>OPEN YOUR SURPRISE <ArrowUpRight size={18}/></button>
      <p className="invitation-caption">A moment worth celebrating.</p>
    </div><footer className="invitation-bottom"><span>MADE ESPECIALLY FOR {greeting.name.toUpperCase()}</span><span>2026 · A NEW CHAPTER</span></footer>
  </main>;
}
