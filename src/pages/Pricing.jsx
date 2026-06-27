// src/pages/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Chip, Skeleton,
  IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, CircularProgress,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FiDollarSign, FiPlus, FiEdit2, FiTrash2,
  FiCheck, FiTag,
} from 'react-icons/fi';
import productService from '../services/productService';

/* ═══════════════════════ PALETTE ═══════════════════════ */
const C = {
  brand:    '#003d99',
  brandMid: '#0066cc',
  rowEven:  '#ffffff',
  rowOdd:   '#f4f8ff',
  rowHover: '#e6f0ff',
  border:   '#dce8f9',
};

const SIZE_OPTIONS = [5, 10, 20];

/* ═══════════════════════ HELPERS ════════════════════════ */
const fmtKsh = (v) =>
  v != null
    ? `KSh ${Number(v).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
    : '—';

const extractError = (err) => {
  const d = err?.response?.data;
  if (!d) return 'Something went wrong.';
  if (typeof d === 'string') return d;
  return Object.values(d).flat()[0] || 'Something went wrong.';
};

/* ═══════════════════════ TABLE ═════════════════════════ */
const COLS = [
  { key: 'idx',      label: '#',              w: 48,  align: 'center' },
  { key: 'size',     label: 'Bottle Size',    w: 130, align: 'left'   },
  { key: 'purchase', label: 'Purchase Price', w: 160, align: 'right'  },
  { key: 'refill',   label: 'Refill Price',   w: 150, align: 'right'  },
  { key: 'margin',   label: 'Margin',         w: 120, align: 'right'  },
  { key: 'actions',  label: 'Actions',        w: 90,  align: 'center' },
];

const gridCols = COLS.map((c) => `${c.w}px`).join(' ') + ' 1fr';

const THead = () => (
  <Box sx={{
    display: 'grid', gridTemplateColumns: gridCols,
    bgcolor: C.brand, borderRadius: '10px 10px 0 0', px: 1,
  }}>
    {COLS.map((col) => (
      <Box key={col.key} sx={{
        py: 1.5, px: 1.5, textAlign: col.align,
        color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem',
        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {col.label}
      </Box>
    ))}
  </Box>
);

const TRow = ({ pricing, index, onEdit, onDelete }) => {
  const even   = index % 2 === 0;
  const margin = pricing.purchase_price != null && pricing.refill_price != null
    ? (Number(pricing.purchase_price) - Number(pricing.refill_price)).toFixed(2)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
    >
      <Box sx={{
        display: 'grid', gridTemplateColumns: gridCols,
        bgcolor: even ? C.rowEven : C.rowOdd,
        borderBottom: `1px solid ${C.border}`,
        px: 1, transition: 'background 0.12s',
        '&:hover': { bgcolor: C.rowHover },
      }}>
        {/* # */}
        <Box sx={{ py: 1.6, px: 1.5, textAlign: 'center', color: 'text.disabled', fontSize: '0.78rem' }}>
          {index + 1}
        </Box>
        {/* Size */}
        <Box sx={{ py: 1.6, px: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${pricing.size}L`}
            size="small"
            sx={{
              height: 24, fontSize: '0.78rem', fontWeight: 700,
              bgcolor: '#dbeeff', color: C.brand,
            }}
          />
          <Typography fontSize="0.78rem" color="text.secondary">
            {pricing.size_display ?? `${pricing.size} Litres`}
          </Typography>
        </Box>
        {/* Purchase */}
        <Box sx={{ py: 1.6, px: 1.5, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
          {fmtKsh(pricing.purchase_price)}
        </Box>
        {/* Refill */}
        <Box sx={{ py: 1.6, px: 1.5, textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: C.brandMid }}>
          {fmtKsh(pricing.refill_price)}
        </Box>
        {/* Margin */}
        <Box sx={{ py: 1.6, px: 1.5, textAlign: 'right', fontSize: '0.8rem', color: margin > 0 ? '#92400e' : 'text.secondary' }}>
          {margin != null ? fmtKsh(margin) : '—'}
        </Box>
        {/* spacer */}
        <Box sx={{ py: 1.6, px: 1.5 }} />
        {/* Actions */}
        <Box sx={{ py: 0.8, px: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Edit pricing">
            <IconButton size="small" onClick={() => onEdit(pricing)}
              sx={{ color: C.brandMid, '&:hover': { bgcolor: '#e6f0ff' } }}>
              <FiEdit2 size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete pricing tier">
            <IconButton size="small" onClick={() => onDelete(pricing)}
              sx={{ color: '#dc2626', '&:hover': { bgcolor: '#fee2e2' } }}>
              <FiTrash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </motion.div>
  );
};

const SkeletonRows = ({ n = 3 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <Box key={i} sx={{
        display: 'grid', gridTemplateColumns: gridCols,
        bgcolor: i % 2 === 0 ? C.rowEven : C.rowOdd,
        borderBottom: `1px solid ${C.border}`, px: 1, py: 0.5,
      }}>
        {COLS.map((col) => (
          <Box key={col.key} sx={{ py: 1, px: 1.5 }}>
            <Skeleton variant="text" width={col.w * 0.55} height={20} />
          </Box>
        ))}
      </Box>
    ))}
  </>
);

/* ═══════════════════════ ADD / EDIT DIALOG ════════════ */
const PricingDialog = ({ open, pricing, onClose, onSaved, existingSizes }) => {
  const isEdit = !!pricing;
  const [form, setForm] = useState({ size: '', purchase_price: '', refill_price: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open) {
      setErr(null);
      setForm(
        pricing
          ? { size: pricing.size, purchase_price: pricing.purchase_price, refill_price: pricing.refill_price }
          : { size: '', purchase_price: '', refill_price: '' }
      );
    }
  }, [open, pricing]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // sizes already with a pricing tier (exclude current when editing)
  // Coerce to Number since backend sends integers but Select onChange gives strings
  const usedSizes = existingSizes
    .map(Number)
    .filter((s) => !isEdit || s !== Number(pricing?.size));

  const handleSave = async () => {
    if (!form.size) { setErr('Please select a bottle size.'); return; }
    if (!form.purchase_price || !form.refill_price) { setErr('Both prices are required.'); return; }
    if (isNaN(Number(form.purchase_price)) || isNaN(Number(form.refill_price))) {
      setErr('Prices must be valid numbers.'); return;
    }
    setSaving(true);
    setErr(null);
    try {
      const payload = {
        size: Number(form.size),
        purchase_price: Number(form.purchase_price),
        refill_price: Number(form.refill_price),
      };
      if (isEdit) {
        await productService.staffUpdatePricing(pricing.id, payload);
      } else {
        await productService.staffAddPricing(payload);
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
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>
        {isEdit ? `Edit Pricing — ${pricing.size}L` : 'Add Pricing Tier'}
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {err && (
          <Box sx={{ bgcolor: '#fee2e2', borderRadius: 2, px: 2, py: 1 }}>
            <Typography fontSize="0.8rem" color="#991b1b">{err}</Typography>
          </Box>
        )}

        {/* Size — disabled when editing since size is unique key */}
        <FormControl fullWidth size="small" disabled={isEdit}>
          <InputLabel>Bottle Size</InputLabel>
          <Select value={form.size} label="Bottle Size" onChange={set('size')}>
            {SIZE_OPTIONS.map((s) => (
              <MenuItem key={s} value={s} disabled={usedSizes.includes(s)}>
                {s} Litres {usedSizes.includes(s) ? '(already configured)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small" label="Purchase Price (KSh)" type="number"
          value={form.purchase_price} onChange={set('purchase_price')}
          InputProps={{ startAdornment: <InputAdornment position="start">KSh</InputAdornment> }}
          inputProps={{ min: 0, step: '0.01' }}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <TextField
          size="small" label="Refill Price (KSh)" type="number"
          value={form.refill_price} onChange={set('refill_price')}
          InputProps={{ startAdornment: <InputAdornment position="start">KSh</InputAdornment> }}
          inputProps={{ min: 0, step: '0.01' }}
          fullWidth
          helperText="Price for customers returning their bottle for a refill"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* live margin preview */}
        {form.purchase_price && form.refill_price && !isNaN(Number(form.purchase_price)) && !isNaN(Number(form.refill_price)) && (
          <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, px: 2, py: 1 }}>
            <Typography fontSize="0.78rem" color="#166534">
              Purchase–refill difference:{' '}
              <strong>
                {fmtKsh((Number(form.purchase_price) - Number(form.refill_price)).toFixed(2))}
              </strong>
            </Typography>
          </Box>
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
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Tier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ═══════════════════════ DELETE CONFIRM ═══════════════ */
const DeleteDialog = ({ open, pricing, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => { if (open) setErr(null); }, [open]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.staffDeletePricing(pricing.id);
      onDeleted();
    } catch (e) {
      setErr(extractError(e));
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Delete Pricing Tier?</DialogTitle>
      <DialogContent>
        {err && (
          <Box sx={{ bgcolor: '#fee2e2', borderRadius: 2, px: 2, py: 1, mb: 1 }}>
            <Typography fontSize="0.8rem" color="#991b1b">{err}</Typography>
          </Box>
        )}
        <Typography fontSize="0.88rem" color="text.secondary">
          The <strong>{pricing?.size}L</strong> pricing tier (purchase {fmtKsh(pricing?.purchase_price)},
          refill {fmtKsh(pricing?.refill_price)}) will be permanently deleted.
          Any active orders referencing this size may be affected.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
        <Button
          onClick={handleDelete} variant="contained" disabled={deleting}
          startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <FiTrash2 size={14} />}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, boxShadow: 'none' }}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ═══════════════════════ PAGE ══════════════════════════ */
const Pricing = () => {
  const [pricing, setPricing]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [addOpen, setAddOpen]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.staffGetPricingList();
      // Backend returns a plain list: [{id, size, size_display, purchase_price, refill_price}, ...]
      // Never use Object.values — it turns the array/object into mixed primitives
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];
      setPricing([...arr].sort((a, b) => a.size - b.size));
    } catch (e) {
      setError('Could not load pricing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const existingSizes = pricing.map((p) => p.size);
  const allConfigured = existingSizes.length >= SIZE_OPTIONS.length;

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
              <FiTag size={22} />
              <Typography variant="h4" fontWeight={800} sx={{ fontSize:{ xs:'1.5rem', md:'1.8rem' } }}>
                Pricing Management
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity:0.82, fontSize:{ xs:'0.8rem', md:'0.875rem' } }}>
              Set purchase and refill prices for each bottle size.
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

        {/* ── Summary chips ── */}
        {!loading && (
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mb:2.5 }}>
            {SIZE_OPTIONS.map((s) => {
              const configured = existingSizes.includes(s);
              return (
                <Chip
                  key={s}
                  label={`${s}L — ${configured ? 'configured' : 'not set'}`}
                  size="small"
                  sx={{
                    fontWeight: 600, fontSize: '0.75rem',
                    bgcolor: configured ? '#dcf5e7' : '#fee2e2',
                    color: configured ? '#166534' : '#991b1b',
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* ── Controls ── */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} fontSize="1rem" color="#1a2a4a">
              Pricing Tiers
            </Typography>
            {!loading && (
              <Typography variant="caption" color="text.secondary">
                {pricing.length} of {SIZE_OPTIONS.length} sizes configured
              </Typography>
            )}
          </Box>
          <Tooltip title={allConfigured ? 'All sizes have a pricing tier' : ''}>
            <span>
              <Button
                variant="contained"
                startIcon={<FiPlus size={15} />}
                onClick={() => setAddOpen(true)}
                disabled={allConfigured}
                sx={{
                  textTransform:'none', fontWeight:600, borderRadius:2, fontSize:'0.85rem',
                  background:`linear-gradient(135deg, ${C.brand} 0%, ${C.brandMid} 100%)`,
                  boxShadow:'0 3px 12px rgba(0,60,180,0.25)',
                  '&:hover':{ boxShadow:'0 4px 18px rgba(0,60,180,0.35)' },
                  '&.Mui-disabled':{ background:'rgba(0,0,0,0.12)', color:'rgba(0,0,0,0.26)' },
                }}
              >
                Add Tier
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* ── Table ── */}
        <Box sx={{ borderRadius:'12px', border:`1px solid ${C.border}`, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,60,180,0.07)' }}>
          <Box sx={{ overflowX:'auto' }}>
            <Box sx={{ minWidth:600 }}>
              <THead />
              {loading ? (
                <SkeletonRows n={3} />
              ) : pricing.length === 0 ? (
                <Box sx={{ py:6, textAlign:'center', bgcolor:'white', borderRadius:'0 0 10px 10px' }}>
                  <Box sx={{ width:48, height:48, borderRadius:2.5, bgcolor:'#dbeeff', display:'flex', alignItems:'center', justifyContent:'center', mx:'auto', mb:1.5 }}>
                    <FiDollarSign size={22} color={C.brandMid} strokeWidth={1.5} />
                  </Box>
                  <Typography fontWeight={700} gutterBottom>No pricing tiers yet</Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Add a pricing tier for each bottle size to enable ordering.
                  </Typography>
                </Box>
              ) : (
                pricing.map((p, idx) => (
                  <TRow
                    key={p.id}
                    pricing={p}
                    index={idx}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>

        {/* ── Info note ── */}
        {!loading && pricing.length > 0 && (
          <Box sx={{ mt:2, p:1.5, bgcolor:'#fffbeb', border:'1px solid #fde68a', borderRadius:2 }}>
            <Typography fontSize="0.78rem" color="#92400e">
              <strong>Note:</strong> Changing a price will affect all <em>new</em> orders. Existing orders retain
              their original pricing at time of placement.
            </Typography>
          </Box>
        )}
      </Container>

      {/* ── Dialogs ── */}
      <PricingDialog
        open={addOpen || !!editTarget}
        pricing={editTarget}
        onClose={() => { setAddOpen(false); setEditTarget(null); }}
        onSaved={handleSaved}
        existingSizes={existingSizes}
      />
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          pricing={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </Box>
  );
};

export default Pricing;