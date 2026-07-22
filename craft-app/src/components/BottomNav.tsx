import { useEffect, useState } from 'react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const PRIMARY_TABS = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
    ),
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16" cy="14" r="1.4" /></svg>
    ),
  },
  {
    id: 'dailyplanner',
    label: 'Planner',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
    ),
  },
  {
    id: 'meals',
    label: 'Meals',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M6 3v18M6 3c-2 0-2 4 0 5M18 3v18M18 3a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3" /></svg>
    ),
  },
];

const MORE_ICON = (
  <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
);

const MORE_SECTIONS = [
  {
    id: 'open-kitchen',
    label: 'Open Kitchen',
    items: [{ id: 'grocery', label: 'Grocery List' }],
  },
  {
    id: 'planning',
    label: 'Planning',
    items: [
      { id: 'trackers', label: 'Trackers' },
      { id: 'decisions', label: 'Decisions' },
    ],
  },
  {
    id: 'home',
    label: 'Home',
    items: [{ id: 'maidwizard', label: 'Maid Wizard' }],
  },
];

const MORE_ITEM_IDS = MORE_SECTIONS.flatMap(s => s.items.map(i => i.id));

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = MORE_ITEM_IDS.includes(currentPage);

  useEffect(() => {
    if (!moreOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [moreOpen]);

  function go(page: string) {
    onNavigate(page);
    setMoreOpen(false);
  }

  return (
    <>
      <nav className="bottombar">
        {PRIMARY_TABS.map(tab => (
          <button
            key={tab.id}
            className={`bottombar-tab ${currentPage === tab.id ? 'active' : ''}`}
            onClick={() => go(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <button
          className={`bottombar-tab ${isMoreActive ? 'active' : ''}`}
          onClick={() => setMoreOpen(true)}
        >
          {MORE_ICON}
          More
        </button>
      </nav>

      {moreOpen && (
        <>
          <div className="more-sheet-backdrop" onClick={() => setMoreOpen(false)} />
          <div className="more-sheet">
            <div className="more-sheet-handle" />
            <div className="more-sheet-header">
              <span className="topbar-mark">More</span>
              <button className="nav-close" onClick={() => setMoreOpen(false)}>Close</button>
            </div>

            {MORE_SECTIONS.map(section => (
              <div className="nav-group" key={section.id}>
                <div className="nav-group-label">{section.label}</div>
                <div className="nav-group-items">
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                      onClick={() => go(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
