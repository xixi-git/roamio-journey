import { UserRound, Settings } from 'lucide-react';


export default function HomeAcount() {
  return (
    <section className="home-panel account-panel">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=90" alt="Jenna Peterson in Paris" />
        <div className="account-shade" />
        <div className="account-top"><span><UserRound />Account</span><button aria-label="Account settings" type="button"><Settings /></button></div>
        <div className="account-name"><strong>JENNA PETERSON</strong><span>12,540 Miles Traveled</span></div>
    </section>
  );
}