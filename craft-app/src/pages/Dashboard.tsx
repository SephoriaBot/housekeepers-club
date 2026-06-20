{soonReminders.length > 0 && (
  <div style={{ marginBottom: laterReminders.length > 0 ? 14 : 0 }}>
    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
      Soon
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
      {soonReminders.map(r => (
        <div
          key={r.id}
          onClick={() => onNavigate(r.page)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
            fontSize: '0.85rem', flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '1.05rem' }}>{r.emoji}</span>
          <span style={{ flex: 1, color: 'var(--ink)' }}>
            {r.label} <span style={{ color: 'var(--ink-muted)' }}>· {r.detail}</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
            {formatDueLabel(r.dueDate)}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

{laterReminders.length > 0 && (
  <div>
    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
      Later
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
      {laterReminders.map(r => (
        <div
          key={r.id}
          onClick={() => onNavigate(r.page)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--cream)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
            fontSize: '0.82rem', opacity: 0.8, flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.95rem' }}>{r.emoji}</span>
          <span style={{ flex: 1, color: 'var(--ink-soft)' }}>
            {r.label} <span style={{ color: 'var(--ink-muted)' }}>· {r.detail}</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
            {formatDueLabel(r.dueDate)}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
