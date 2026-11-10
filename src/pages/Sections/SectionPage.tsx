import { ArrowLeft, ArrowUpRight, Compass, Map, Share2, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import './SectionPage.css';

const sections = {
  '/explore': {
    title: 'Explore',
    eyebrow: 'FIND YOUR NEXT PLACE',
    description: 'A little inspiration for the places and journeys waiting just beyond your plans.',
    icon: Compass,
  },
  '/shared': {
    title: 'Shared Trips',
    eyebrow: 'TRAVEL IS BETTER TOGETHER',
    description: 'Trips shared with you and the plans you are building with other travelers will live here.',
    icon: Share2,
  },
  '/stats': {
    title: 'Travel Stats',
    eyebrow: 'YOUR JOURNEY SO FAR',
    description: 'A personal view of the places you have visited, the miles you have traveled, and what is ahead.',
    icon: Map,
  },
};

export default function SectionPage() {
  const { pathname } = useLocation();
  const section = sections[pathname as keyof typeof sections];

  if (!section) {
    return (
      <section className="section-page">
        <div className="section-page-card section-page-not-found">
          <span className="section-page-icon"><Sparkles aria-hidden="true" /></span>
          <span className="section-page-eyebrow">THIS PATH HASN’T BEEN MAPPED</span>
          <h1>Page not found<span>.</span></h1>
          <p>Return to your trips and keep planning the next good story.</p>
          <Link className="section-page-link" to="/trips">Go to My Trips <ArrowLeft aria-hidden="true" /></Link>
        </div>
      </section>
    );
  }

  const Icon = section.icon;
  return (
    <section className="section-page">
      <div className="section-page-heading">
        <span className="section-page-eyebrow">{section.eyebrow}</span>
        <h1>{section.title}<span>.</span></h1>
        <p>{section.description}</p>
      </div>
      <div className="section-page-card">
        <span className="section-page-icon"><Icon aria-hidden="true" /></span>
        <span className="section-page-eyebrow">A NEW CHAPTER IS ON ITS WAY</span>
        <h2>Make room for what’s next.</h2>
        <p>This space is ready for your next travel idea. Start by saving a destination and the reasons you want to go.</p>
        <Link className="section-page-link" to="/trips/new">Plan a new trip <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
