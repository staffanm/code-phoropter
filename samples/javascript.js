// React component with hooks and async operations
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

const UserSearch = ({ onUserSelect, initialQuery = '' }) => {
    const [query, setQuery] = useState(initialQuery);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Memoized debounced search function
    const debouncedSearch = useMemo(
        () => debounce(async (searchQuery) => {
            if (!searchQuery.trim()) {
                setUsers([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortController?.signal
                });

                if (!response.ok) {
                    throw new Error(`Search failed: ${response.status}`);
                }

                const data = await response.json();
                setUsers(data.users || []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    setUsers([]);
                }
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(query);
        return () => debouncedSearch.cancel();
    }, [query, debouncedSearch]);

    const handleUserClick = useCallback((user) => {
        onUserSelect?.(user);
    }, [onUserSelect]);

    return (
        <div className="user-search">
            <div className="search-input-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="search-input"
                />
                {loading && <div className="spinner" />}
            </div>

            {error && (
                <div className="error-message">
                    Error: {error}
                </div>
            )}

            <div className="users-list">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="user-item"
                        onClick={() => handleUserClick(user)}
                    >
                        <img src={user.avatar} alt={user.name} className="avatar" />
                        <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                            {user.department && (
                                <div className="user-department">{user.department}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserSearch;