'use client';

import React, { useState, useEffect, useMemo, JSX } from 'react';
import { Enquiry, EnquiriesApiResponse, EnquiriesListProps } from './enquiries.props';

// Maps known source keywords to Tailwind colour classes
const SOURCE_COLOURS: Record<string, { bg: string; text: string }> = {
  Conference:            { bg: '#ede9fe', text: '#6d28d9' },
  'Google Search':       { bg: '#dbeafe', text: '#1d4ed8' },
  'Email Campaign':      { bg: '#fef3c7', text: '#b45309' },
  Webinar:               { bg: '#d1fae5', text: '#065f46' },
  'Partner Referral':    { bg: '#fce7f3', text: '#9d174d' },
  'Website Contact Form':{ bg: '#cffafe', text: '#0e7490' },
};

const getBadgeStyle = (source: string): { background: string; color: string } => {
  const key = Object.keys(SOURCE_COLOURS).find((k) =>
    source.toLowerCase().includes(k.toLowerCase()),
  );
  return key
    ? { background: SOURCE_COLOURS[key].bg, color: SOURCE_COLOURS[key].text }
    : { background: '#f1f5f9', color: '#475569' };
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const SkeletonCard = (): JSX.Element => (
  <div
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="enquiries-skeleton" style={{ height: '1rem', width: '55%', borderRadius: 4 }} />
        <div className="enquiries-skeleton" style={{ height: '0.75rem', width: '70%', borderRadius: 4 }} />
      </div>
      <div className="enquiries-skeleton" style={{ height: '0.75rem', width: '4rem', borderRadius: 4 }} />
    </div>
    <div className="enquiries-skeleton" style={{ height: '0.8rem', borderRadius: 4 }} />
    <div className="enquiries-skeleton" style={{ height: '0.8rem', width: '85%', borderRadius: 4 }} />
    <div className="enquiries-skeleton" style={{ height: '0.8rem', width: '60%', borderRadius: 4 }} />
    <div className="enquiries-skeleton" style={{ height: '1.4rem', width: '6rem', borderRadius: '9999px', marginTop: '0.25rem' }} />
  </div>
);

const EnquiryCard = ({ item }: { item: Enquiry }): JSX.Element => {
  const badgeStyle = getBadgeStyle(item.Source);

  return (
    <article
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Name / email / date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--color-brand-navy)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.Name}
          </p>
          <a
            href={`mailto:${item.Email}`}
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.Email}
          </a>
        </div>
        <time
          dateTime={item.CreatedOn}
          style={{ fontSize: '0.75rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: '0.1rem' }}
        >
          {formatDate(item.CreatedOn)}
        </time>
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

      {/* Message — clamp to 3 lines */}
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-text)',
          margin: 0,
          lineHeight: 1.65,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.Message}
      </p>

      {/* Source badge — pinned to bottom */}
      <div style={{ marginTop: 'auto' }}>
        <span
          style={{
            ...badgeStyle,
            display: 'inline-block',
            fontSize: '0.71rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
          }}
        >
          {item.Source}
        </span>
      </div>
    </article>
  );
};

export const Default = ({ params }: EnquiriesListProps): JSX.Element => {
  const { styles, RenderingIdentifier: id } = params;

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    fetch('/api/enquiries')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<EnquiriesApiResponse>;
      })
      .then((data) => {
        if (data.Success) setEnquiries(data.Data);
        else setError(data.Message);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sources = useMemo(
    () => Array.from(new Set(enquiries.map((e) => e.Source))).sort(),
    [enquiries],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enquiries.filter((e) => {
      const matchesSearch =
        !q ||
        e.Name.toLowerCase().includes(q) ||
        e.Email.toLowerCase().includes(q) ||
        e.Message.toLowerCase().includes(q) ||
        e.Source.toLowerCase().includes(q);
      const matchesSource = !sourceFilter || e.Source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [enquiries, search, sourceFilter]);

  const inputStyle: React.CSSProperties = {
    padding: '0.625rem 1rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    background: 'var(--color-surface)',
    outline: 'none',
    width: '100%',
  };

  return (
    <div className={`component enquiries-list ${styles}`} id={id ?? undefined}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: 'var(--color-brand-navy)',
            margin: '0 0 0.35rem',
            letterSpacing: '-0.03em',
          }}
        >
          Enquiries
        </h2>
        {!loading && !error && (
          <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
            Showing{' '}
            <strong style={{ color: 'var(--color-text)' }}>{filtered.length}</strong>{' '}
            of{' '}
            <strong style={{ color: 'var(--color-text)' }}>{enquiries.length}</strong>{' '}
            enquir{enquiries.length === 1 ? 'y' : 'ies'}
          </p>
        )}
      </div>

      {/* ── Source stats strip ── */}
      {!loading && !error && enquiries.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
            marginBottom: '1.5rem',
          }}
        >
          {sources.map((s) => {
            const count = enquiries.filter((e) => e.Source === s).length;
            const badge = getBadgeStyle(s);
            const isActive = sourceFilter === s;
            return (
              <button
                key={s}
                onClick={() => setSourceFilter(isActive ? '' : s)}
                style={{
                  ...badge,
                  border: isActive ? `2px solid ${badge.color}` : '2px solid transparent',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.8rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'border-color 150ms',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {s}
                <span
                  style={{
                    background: badge.color,
                    color: '#fff',
                    borderRadius: '9999px',
                    padding: '0 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    lineHeight: '1.4',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Search + filter controls ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          {/* search icon */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search name, email or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
          />
        </div>
        <div style={{ flex: '0 0 auto', minWidth: '160px' }}>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {(search || sourceFilter) && (
          <button
            onClick={() => { setSearch(''); setSourceFilter(''); }}
            style={{
              flex: '0 0 auto',
              padding: '0.625rem 1rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              background: 'transparent',
              color: 'var(--color-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#dc2626',
            fontSize: '0.9rem',
          }}
        >
          <strong>Failed to load enquiries:</strong> {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>No enquiries found</p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem' }}>Try adjusting your search or filter.</p>
        </div>
      )}

      {/* ── Card grid ── */}
      {!loading && !error && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filtered.map((item) => (
            <EnquiryCard key={item.Id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
