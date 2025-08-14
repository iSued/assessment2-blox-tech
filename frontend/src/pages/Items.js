import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link as RouterLink } from 'react-router-dom';
import { Box, ListItem, ListItemText, ListItemSecondaryAction, Typography, Button, Chip, CircularProgress, TextField, Alert, Pagination, Stack } from '@mui/material';
import { FixedSizeList as List } from 'react-window';

// Color palette
const COLORS = {
  dark: '#1d3557',
  mid: '#457b9d',
  soft: '#a8dadc',
  light: '#f1faee',
};

function Items() {
  const { items, fetchItems, query, setQuery, page, setPage, totalPages, loading, error } = useData();
  const [search, setSearch] = useState(query || '');
  const [searching, setSearching] = useState(false);

  // Function to render each row in the virtualized list
  const renderRow = ({ index, style }) => {
    const item = items[index];

    return (
      <div style={style} key={item.id}>
        <ListItem divider sx={{ '&:hover': { bgcolor: '#f8feff' } }}>
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{ sx: { color: COLORS.dark, fontWeight: 600 } }}
            secondary={<>
              <Chip label={item.category} size="small" sx={{ mr: 1, bgcolor: COLORS.soft, color: COLORS.dark }} />
              <Typography component="span" variant="body2" color="text.secondary">{formatPrice(item.price)}</Typography>
            </>}
          />

          <ListItemSecondaryAction>
            <Button component={RouterLink} to={`/items/${item.id}`} size="small" variant="outlined" sx={{ borderColor: COLORS.mid, color: COLORS.dark }}>
              View
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    );
  };

  // Fetch whenever page or query changes
  useEffect(() => {
    fetchItems(page);
  }, [fetchItems, page, query]);

  // Debounce local search input -> update global query and reset page
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== query) {
        setPage(1);
        setQuery(search);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, query, setQuery, setPage]);

  // Clear local searching flag when loading completes
  useEffect(() => {
    if (!loading) setSearching(false);
  }, [loading]);

  const formatPrice = (value) => {
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(value);
    } catch (e) {
      return `€${value}`;
    }
  };

  const handlePageChange = (_, value) => {
    const clamped = Math.max(1, Math.min(totalPages || 1, Number(value) || 1));
    if (clamped !== page) setPage(clamped);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${COLORS.light} 0%, #ffffff 100%)`, py: 6 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3, bgcolor: 'transparent' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: COLORS.dark, fontWeight: 700 }}>
          Products
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search by name"
            variant="filled"
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSearching(true); }}
            sx={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 1,
              '.MuiFilledInput-root': { backgroundColor: '#fff' },
              input: { color: COLORS.dark },
              '& .MuiInputLabel-root': { color: COLORS.mid },
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          />

          <Button
            variant="contained"
            onClick={() => {
              setSearch('');
              setQuery('');
              setPage(1);
              setSearching(false);
            }}
            sx={{
              bgcolor: COLORS.mid,
              color: COLORS.light,
              '&:hover': { bgcolor: COLORS.dark }
            }}
          >
            Clear
          </Button>
        </Box>

        {(loading || searching) && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30vh' }}>
            <CircularProgress sx={{ color: COLORS.mid }} />
          </Box>
        )}

        {!loading && !searching && error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {!loading && !searching && items && items.length === 0 && (
          <Typography sx={{ py: 6, textAlign: 'center' }} color="text.secondary">No results found.</Typography>
        )}

        {!loading && !searching && items && items.length > 0 && (
          <>
            <Box sx={{
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: '#fff',
              boxShadow: '0 6px 18px rgba(29,53,87,0.06)',
              height: 600 // Set a fixed height for the virtualized list
            }}>
              <List
                height={600}
                itemCount={items.length}
                itemSize={88} // Approximate height per item
                overscanCount={5}
              >
                {renderRow}
              </List>
            </Box>

            <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
              <Pagination
                count={Math.max(1, totalPages)}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiPaginationItem-root': { color: COLORS.dark },
                  '& .MuiPaginationItem-root.Mui-selected': { bgcolor: COLORS.mid, color: COLORS.light, '&:hover': { bgcolor: COLORS.dark } },
                }}
              />
              <Typography variant="caption" color="text.secondary">Page {page} of {totalPages}</Typography>
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Items;