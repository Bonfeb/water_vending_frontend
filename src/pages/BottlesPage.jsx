// src/pages/BottlesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Chip, Skeleton,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  TablePagination, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDroplet, FiSearch, FiPlus, FiEdit2, FiTrash2,
  FiFilter, FiX, FiPackage, FiCheck,
} from 'react-icons/fi';
import productService from '../services/productService';

/* ═══════════════════════ PALETTE ═══════════════════════ */
const C = {
  brand:      '#003d99',
  brandMid:   '#0066cc',
  rowEven:    '#ffffff',
  rowOdd:     '#f4f8ff',
  rowHover:   '#e6f0ff',
  border:     '#dce8f9',
  headerBg:   '#003d99',
  chipActive:   { bg: '#dcf5e7', color: '#166534' },
  chipInactive: { bg: '#fee2e2', color: '#991b1b' },
};

const SIZE_OPTIONS = [5, 10, 20];

/* ═══════════════════════ HELPERS ════════════════════════ */
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const fmtKsh = (v) =>
  v != null ? `KSh ${Number(v).toLocaleString('en-KE', { minimumFractionDigits: 2 })}` : '—';

const extractError = (err) => {
  const d = err?.response?.data;
  if (!d) return 'Something went wrong.';
  if (typeof d === 'string') return d;
  return Object.values(d).flat()[0] || 'Something went wrong.';
};

/* ═══════════════════════ SUMMARY CARDS ═════════════════ */
const StatCard = ({ label, value, color = C.brand }) => (
  <Box sx={{
    flex: '1 1 120px', bgcolor: 'white', borderRadius: '10px',
    border: `1px solid ${C.border}`, px: 2, py: 1.5,
    boxShadow: '0 1px 6px rgba(0,60,180,0.06)',
  }}>
    <Typography fontSize="0.7rem" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
      {label}
    </Typography>
    <Typography fontSize="1.5rem" fontWeight={800} color={color} lineHeight={1.2} mt={0.3}>
      {value ?? '—'}
    </Typography>
  </Box>
);

/* ═══════════════════════ TABLE HEAD ════════════════════ */
const COLS = [
  { key: 'idx',      label: '#',            w: 48,  align: 'center' },
  { key: 'id',       label: 'ID',           w: 60,  align: 'center' },
  { key: 'size',     label: 'Size',         w: 90,  align: 'left'   },
  { key: 'status',   label: 'Status',       w: 100, align: 'center' },
  { key: 'date',     label: 'Purchase Date',w: 140, align: 'left'   },
  { key: 'actions',  label: 'Actions',      w: 90,  align: 'center' },
];

const gridCols = COLS.map((c) => `${c.w}px`).join(' ') + ' 1fr';

const THead = () => (
  <Box sx={{
    display: 'grid', gridTemplateColumns: gridCols,
    bgcolor: C.headerBg, borderRadius: '10px 10px 0 0', px: 1,
  }}>
    {COLS.map((col) => (
      <Box key={col.key} sx={{
        py: 1.5, px: 1, textAlign: col.align,
        color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem',
        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {col.label}
      </Box>
    ))}
  </Box>
);

/* ═══════════════════════ TABLE ROW ═════════════════════ */
const TRow = ({ bottle, index, globalIndex, onEdit, onDelete }) => {
  const even = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025, duration: 0.22 }}
    >
      <Box sx={{
        display: 'grid', gridTemplateColumns: gridCols,
        bgcolor: even ? C.rowEven : C.rowOdd,
        borderBottom: `1px solid ${C.border}`,
        px: 1, transition: 'background 0.12s',
        '&:hover': { bgcolor: C.rowHover },
      }}>
        <Box sx={{ py: 1.3, px: 1, textAlign: 'center', color: 'text.disabled', fontSize: '0.78rem' }}>
          {globalIndex + 1}
        </Box>
        <Box sx={{ py: 1.3, px: 1, textAlign: 'center', fontSize: '0.78rem', color: 'text.secondary', fontFamily: 'monospace' }}>
          {bottle.id}
        </Box>
        <Box sx={{ py: 1.3, px: 1, fontSize: '0.85rem', fontWeight: 700, color: C.brand }}>
          {bottle.size}L
        </Box>
        <Box sx={{ py: 1.3, px: 1, textAlign: 'center' }}>
          <Chip
            label={bottle.is_active ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              height: 22, fontSize: '0.68rem', fontWeight: 700,
              bgcolor: bottle.is_active ? C.chipActive.bg : C.chipInactive.bg,
              color: bottle.is_active ? C.chipActive.color : C.chipInactive.color,
            }}
          />
        </Box>
        <Box sx={{ py: 1.3, px: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
          {fmt(bottle.purchase_date)}
        </Box>
        <Box sx={{ py: 1.3, px: 1, textAlign: 'center' }} /> {/* spacer for 1fr col */}
        <Box sx={{ py: 0.8, px: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(bottle)}
              sx={{ color: C.brandMid, '&:hover': { bgcolor: '#e6f0ff' } }}>
              <FiEdit2 size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark inactive / delete">
            <IconButton size="small" onClick={() => onDelete(bottle)}
              sx={{ color: '#dc2626', '&:hover': { bgcolor: '#fee2e2' } }}>
              <FiTrash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </motion.div>
  );
};

const SkeletonRows = ({ n = 8 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <Box key={i} sx={{
        display: 'grid', gridTemplateColumns: gridCols,
        bgcolor: i % 2 === 0 ? C.rowEven : C.rowOdd,
        borderBottom: `1px solid ${C.border}`, px: 1, py: 0.5,
      }}>
        {COLS.map((col) => (
          <Box key={col.key} sx={{ py: 1, px: 1 }}>
            <Skeleton variant="text" width={col.w * 0.6} height={18} />
          </Box>
        ))}
      </Box>
    ))}
  </>
);

/* ═══════════════════════ ADD / EDIT DIALOG ════════════ */
const BottleDialog = ({ open, bottle, onClose, onSaved }) => {
  const isEdit = !!bottle;
  const [form, setForm] = useState({ size: 20, is_active: true });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open) {
      setErr(null);
      setForm(bottle ? { size: bottle.size, is_active: bottle.is_active } : { size: 20, is_active: true });
    }
  }, [open, bottle]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (isEdit) {
        await productService.staffUpdateBottle(bottle.id, form);
      } else {
        await productService.staffAddBottle(form);
      }
      onSaved();
    } catch (e) {
      setErr(extractError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: '#fff' } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>
        {isEdit ? 'Edit Bottle' : 'Add Bottle'}
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {err && (
          <Box sx={{ bgcolor: '#fee2e2', borderRadius: 2, px: 2, py: 1 }}>
            <Typography fontSize="0.8rem" color="#991b1b">{err}</Typography>
          </Box>
        )}
        <FormControl fullWidth size="small">
          <InputLabel>Size</InputLabel>
          <Select value={form.size} label="Size" onChange={set('size')}>
            {SIZE_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s} Litres</MenuItem>
            ))}
          </Select>
        </FormControl>
        {isEdit && (
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={form.is_active} label="Status"
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value }))}>
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
        <Button
          onClick={handleSave} variant="contained" disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <FiCheck size={14} />}
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: 2,
            background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandMid} 100%)`,
            boxShadow: 'none',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ═══════════════════════ DELETE CONFIRM ═══════════════ */
const DeleteDialog = ({ open, bottle, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => { if (open) setErr(null); }, [open]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.staffDeleteBottle(bottle.id);
      onDeleted();
    } catch (e) {
      setErr(extractError(e));
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Mark Bottle Inactive?</DialogTitle>
      <DialogContent>
        {err && (
          <Box sx={{ bgcolor: '#fee2e2', borderRadius: 2, px: 2, py: 1, mb: 1 }}>
            <Typography fontSize="0.8rem" color="#991b1b">{err}</Typography>
          </Box>
        )}
        <Typography fontSize="0.88rem" color="text.secondary">
          Bottle <strong>#{bottle?.id}</strong> ({bottle?.size}L) will be marked as <strong>inactive</strong> (sold or damaged).
          This cannot be undone from the UI.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
        <Button
          onClick={handleDelete} variant="contained" disabled={deleting}
          startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <FiTrash2 size={14} />}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, boxShadow: 'none' }}
        >
          {deleting ? 'Marking…' : 'Mark Inactive'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ═══════════════════════ PAGE ══════════════════════════ */
const BottlesPage = () => {
  const [bottles, setBottles]     = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // filters
  const [search, setSearch]       = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // pagination
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // dialogs
  const [addOpen, setAddOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (filterSize)   filters.size = filterSize;
      if (filterStatus) filters.is_active = filterStatus === 'active';
      const data = await productService.staffGetBottles(filters);
      // Backend returns { summary: {...}, results: [...] }
      // Never use Object.values — it would turn the object into a mixed primitive array
      setSummary(data?.summary ?? null);
      const arr = Array.isArray(data)
        ? data                          // unlikely but safe
        : Array.isArray(data?.results)
          ? data.results                // expected shape
          : [];
      setBottles(arr);
    } catch (e) {
      setError('Could not load bottles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterSize, filterStatus]); // eslint-disable-line

  // client-side search on top of server-side size/status filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bottles;
    return bottles.filter((b) =>
      String(b.id).includes(q) ||
      String(b.size).includes(q) ||
      (b.is_active ? 'active' : 'inactive').includes(q)
    );
  }, [bottles, search]);

  useEffect(() => setPage(0), [search, filterSize, filterStatus]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSaved = () => {
    setAddOpen(false);
    setEditTarget(null);
    load();
  };
  const handleDeleted = () => {
    setDeleteTarget(null);
    load();
  };

  return (
    <Box sx={{ bgcolor: '#f4f8ff', minHeight: '100vh' }}>

      {/* ── Banner ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #003d99 0%, #0066cc 55%, #0099e6 100%)',
        pt: { xs: 3, md: 4 }, pb: { xs: 3, md: 4 }, px: 2,
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        {[{ w:260,h:260,top:-90,right:-50,op:0.07 },{ w:140,h:140,bottom:-45,left:-35,op:0.05 }].map((b,i) => (
          <Box key={i} sx={{ position:'absolute', width:b.w, height:b.h, top:b.top, bottom:b.bottom, left:b.left, right:b.right, borderRadius:'50%', bgcolor:'white', opacity:b.op, pointerEvents:'none' }} />
        ))}
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <motion.div initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:0.5 }}>
              <FiPackage size={22} />
              <Typography variant="h4" fontWeight={800} sx={{ fontSize:{ xs:'1.5rem', md:'1.8rem' } }}>
                Bottle Inventory
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity:0.82, fontSize:{ xs:'0.8rem', md:'0.875rem' } }}>
              Manage all registered bottles — add, edit, or deactivate.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py:{ xs:2.5, md:3 } }}>

        {/* ── Error ── */}
        {error && (
          <Box sx={{ p:2, borderRadius:2, bgcolor:'#fff0f0', border:'1px solid #fdd', mb:2, textAlign:'center' }}>
            <Typography color="error.main" fontWeight={600} fontSize="0.85rem">{error}</Typography>
          </Box>
        )}

        {/* ── Summary cards ── */}
        {summary && (
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.5, mb:3 }}>
            <StatCard label="Total"      value={summary.total_bottles} />
            <StatCard label="Active"     value={summary.active_bottles}   color="#166534" />
            <StatCard label="Inactive"   value={summary.inactive_bottles} color="#991b1b" />
            <StatCard label="Unassigned" value={summary.unassigned_bottles} color="#92400e" />
            <StatCard label="5L"  value={summary.by_size?.['5L']}  />
            <StatCard label="10L" value={summary.by_size?.['10L']} />
            <StatCard label="20L" value={summary.by_size?.['20L']} />
          </Box>
        )}

        {/* ── Controls ── */}
        <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.5, mb:2, alignItems:'center' }}>
          {/* search */}
          <TextField
            size="small" placeholder="Search by ID or size…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch size={14} color="#888" /></InputAdornment> }}
            sx={{ width:{ xs:'100%', sm:210 }, '& .MuiOutlinedInput-root':{ borderRadius:2, bgcolor:'white', fontSize:'0.85rem', '& fieldset':{ borderColor:C.border }, '&.Mui-focused fieldset':{ borderColor:C.brandMid } } }}
          />

          {/* size filter */}
          <FormControl size="small" sx={{ minWidth:110 }}>
            <InputLabel sx={{ fontSize:'0.85rem' }}>Size</InputLabel>
            <Select value={filterSize} label="Size" onChange={(e) => setFilterSize(e.target.value)}
              sx={{ borderRadius:2, bgcolor:'white', fontSize:'0.85rem' }}>
              <MenuItem value=""><em>All sizes</em></MenuItem>
              {SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}L</MenuItem>)}
            </Select>
          </FormControl>

          {/* status filter */}
          <FormControl size="small" sx={{ minWidth:120 }}>
            <InputLabel sx={{ fontSize:'0.85rem' }}>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ borderRadius:2, bgcolor:'white', fontSize:'0.85rem' }}>
              <MenuItem value=""><em>All</em></MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {/* clear filters */}
          {(filterSize || filterStatus || search) && (
            <Tooltip title="Clear filters">
              <IconButton size="small" onClick={() => { setSearch(''); setFilterSize(''); setFilterStatus(''); }}
                sx={{ bgcolor:'white', border:`1px solid ${C.border}`, borderRadius:2 }}>
                <FiX size={15} color="#888" />
              </IconButton>
            </Tooltip>
          )}

          <Box sx={{ ml:'auto' }}>
            <Button
              variant="contained" startIcon={<FiPlus size={15} />}
              onClick={() => setAddOpen(true)}
              sx={{
                textTransform:'none', fontWeight:600, borderRadius:2, fontSize:'0.85rem',
                background:`linear-gradient(135deg, ${C.brand} 0%, ${C.brandMid} 100%)`,
                boxShadow:'0 3px 12px rgba(0,60,180,0.25)',
                '&:hover':{ boxShadow:'0 4px 18px rgba(0,60,180,0.35)' },
              }}
            >
              Add Bottle
            </Button>
          </Box>
        </Box>

        {/* count label */}
        {!loading && (
          <Typography variant="caption" color="text.secondary" sx={{ display:'block', mb:1 }}>
            {filtered.length} {filtered.length === 1 ? 'bottle' : 'bottles'}
            {(search || filterSize || filterStatus) && ' (filtered)'}
          </Typography>
        )}

        {/* ── Table ── */}
        <Box sx={{ borderRadius:'12px', border:`1px solid ${C.border}`, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,60,180,0.07)' }}>
          <Box sx={{ overflowX:'auto' }}>
            <Box sx={{ minWidth:580 }}>
              <THead />
              {loading ? (
                <SkeletonRows n={rowsPerPage} />
              ) : filtered.length === 0 ? (
                <Box sx={{ py:6, textAlign:'center', bgcolor:'white', borderRadius:'0 0 10px 10px' }}>
                  <Box sx={{ width:48, height:48, borderRadius:2.5, bgcolor:'#dbeeff', display:'flex', alignItems:'center', justifyContent:'center', mx:'auto', mb:1.5 }}>
                    <FiDroplet size={22} color={C.brandMid} strokeWidth={1.5} />
                  </Box>
                  <Typography fontWeight={700} gutterBottom>
                    {search || filterSize || filterStatus ? 'No bottles match your filters' : 'No bottles yet'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    {search || filterSize || filterStatus ? 'Try adjusting your filters.' : 'Add a bottle to get started.'}
                  </Typography>
                </Box>
              ) : (
                paginated.map((bottle, idx) => (
                  <TRow
                    key={bottle.id}
                    bottle={bottle}
                    index={idx}
                    globalIndex={page * rowsPerPage + idx}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </Box>
          </Box>

          {!loading && filtered.length > 0 && (
            <Box sx={{ borderTop:`1px solid ${C.border}`, bgcolor:'white' }}>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  '.MuiTablePagination-toolbar':{ minHeight:48, px:2 },
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows':{ fontSize:'0.8rem', color:'text.secondary', mb:0 },
                  '.MuiIconButton-root':{ color:C.brand },
                  '.Mui-disabled':{ color:'text.disabled !important' },
                }}
              />
            </Box>
          )}
        </Box>
      </Container>

      {/* ── Dialogs ── */}
      <BottleDialog
        open={addOpen || !!editTarget}
        bottle={editTarget}
        onClose={() => { setAddOpen(false); setEditTarget(null); }}
        onSaved={handleSaved}
      />
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          bottle={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </Box>
  );
};

export default BottlesPage;