import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState(null); // null = not loaded yet
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50; // default items per page, can be adjusted later
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (pageNum = page, limitNum = limit, q = query) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', pageNum);
      params.set('limit', limitNum);
      if (q) params.set('q', q);

      const res = await fetch(`http://localhost:4001/api/items?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log(json);

      let returnedItems = [];
      let returnedPage = pageNum;
      console.log(json);

      if (Array.isArray(json)) {
        returnedItems = json;
        returnedPage = pageNum;
      } else if (json && typeof json === 'object') {
        returnedItems = Array.isArray(json.items) ? json.items : [];
        returnedPage = typeof json.page === 'number' ? json.page : pageNum;
        setTotalPages(json.totalPages || 1);
      }

      setItems(returnedItems);
      setPage(returnedPage);
    } catch (err) {
      console.log(err);
      setError(err.message || 'Unknown error');
      setItems([]);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, query]);

  return (
    <DataContext.Provider value={{ items, fetchItems, query, setQuery, page, setPage, totalPages, total, limit, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);