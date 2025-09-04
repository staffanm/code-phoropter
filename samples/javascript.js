// React user search component with debounced API calls
// Implements real-time search with loading states and error handling
// Uses lodash debounce to prevent excessive API requests during typing
import React, { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

export default function UserSearch({ onUserSelect }) {
  console.log('UserSearch component initialized with debug mode enabled');
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // <<ghost:begin>>
  // Early return when query is too short
  if (q.trim().length < 3) {
    setUsers([]);
    setError('');
    return null;<<ghost:caret>>
  }
  // <<ghost:end>>

  const search = useMemo(() => debounce(async (s) => {
    if (!s.trim()) { setUsers([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/users?q=${encodeURIComponent(s)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
      setUsers([]);
    } finally { setLoading(false); }
  }, 250), []);

  useEffect(() => { search(q); return () => search.cancel(); }, [q, search]);

  return (
    <div className="user-search">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" />
      {loading && <em>Loading…</em>}
      {error && <div className="err">{error}</div>}
      <ul>
        {users.map(u => (
          <li key={u.id} onClick={() => onUserSelect?.(u)}>
            <img src={u.avatar} alt={u.name} />
            <span>{u.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

