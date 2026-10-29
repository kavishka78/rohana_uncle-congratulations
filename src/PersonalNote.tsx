import { useState } from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';
import { greeting, photoUrl } from './config';
export default function PersonalNote() {
  const [failed, setFailed] = useState(false);
  return <section className="personal" id="personal-note"><div className="portrait">{photoUrl && !failed ? <img src={photoUrl} alt="Uncle Rohana" onError={() => setFailed(true)}/> : <div className="monogram"><span className="eyebrow">THE MAN. THE MOMENT.</span><span className="big-r">R<span>.</span></span><span className="portrait-name">ROHANA</span><span className="portrait-rule"/><small>A new chapter looks good on you.</small></div>}<span className="portrait-tag"><Heart size={13}/> CELEBRATING YOU</span></div>
    <div className="note"><p className="eyebrow">A NOTE FROM THE HEART</p><h2>Made especially<br/><i>for you.</i></h2><p className="salutation">Dear {greeting.name},</p>{greeting.paragraphs.map(p => <p key={p}>{p}</p>)}<div className="signature">{greeting.signature}<Heart size={18}/></div><a href="#top" className="text-link">BACK TO YOUR NEW CHAPTER <ArrowUpRight size={15}/></a></div></section>;
}
