'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Edit2, Trash2, Shield, ChevronRight,
  Loader2, X, Check, Eye, EyeOff, UserCheck, KeyRound, Lock,
  ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

// ── Types ──────────────────────────────────────────
interface UserPermissions {
  [menu: string]: { access: boolean; create: boolean; edit: boolean; delete: boolean; };
}

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  permissions?: string;
}

// ── Constants ──────────────────────────────────────
const SIMAD_ROLES = [
  { value: 'superadmin', label: 'Super Admin', color: 'var(--dash-danger)' },
  { value: 'admin_dinas', label: 'Admin Dinas', color: 'var(--dash-primary)' },
  { value: 'admin_post', label: 'Admin Post', color: 'var(--dash-success)' },
];

const SIMAD_MENUS = [
  { key: 'dashboard',   label: 'Dashboard',              icon: '📊' },
  { key: 'destinasi',   label: 'Destinasi Wisata',       icon: '🗺️' },
  { key: 'berita',      label: 'Berita & Artikel',       icon: '📰' },
  { key: 'galeri',      label: 'Galeri Foto',            icon: '🖼️' },
  { key: 'organisasi',  label: 'Struktur Organisasi',    icon: '🏛️' },
  { key: 'sambutan',    label: 'Sambutan Kepala Dinas',  icon: '🎙️' },
  { key: 'agenda',      label: 'Agenda & Event',         icon: '📅' },
  { key: 'partner',     label: 'Partner Kami',           icon: '🤝' },
  { key: 'wisatawan',   label: 'Pertumbuhan Wisatawan',  icon: '📈' },
  { key: 'pengguna',    label: 'Manajemen Akun',         icon: '👥' },
];

const DEFAULT_PERMISSIONS = (): UserPermissions =>
  Object.fromEntries(SIMAD_MENUS.map(m => [m.key, { access: true, create: false, edit: false, delete: false }]));

const parsePermissions = (raw?: string): UserPermissions => {
  if (!raw) return DEFAULT_PERMISSIONS();
  try { return { ...DEFAULT_PERMISSIONS(), ...JSON.parse(raw) }; } catch { return DEFAULT_PERMISSIONS(); }
};

const ROLE_META: Record<string, { label: string; color: string }> = {
  superadmin: { label: 'Super Admin', color: 'var(--dash-danger)' },
  admin_dinas: { label: 'Admin Dinas', color: 'var(--dash-primary)' },
  admin_post: { label: 'Admin Post', color: 'var(--dash-success)' },
};

// ── Page ──────────────────────────────────────────
export default function PenggunaPage() {
  const { user: currentUser } = useAdmin();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('admin_post');
  const [formPerms, setFormPerms] = useState<UserPermissions>(DEFAULT_PERMISSIONS());
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Fetch ──
  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch('/api/users').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Computed ── (superadmin hidden from management view)
  const visibleUsers = users.filter(u => u.role !== 'superadmin');
  const filteredUsers = visibleUsers.filter(u => {
    const matchQ = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchR = filterRole === 'all' || u.role === filterRole;
    return matchQ && matchR;
  });

  if (!currentUser || currentUser.role !== 'superadmin') {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <Lock size={48} style={{ color: 'var(--dash-text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--dash-text)', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.5rem' }}>Akses Ditolak</h2>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>Halaman ini hanya untuk Super Admin.</p>
      </div>
    );
  }

  // ── Helpers ──
  const openCreate = () => {
    setIsEditing(false); setEditingId(null);
    setFormName(''); setFormUsername(''); setFormPassword('');
    setFormRole('admin_post'); setFormPerms(DEFAULT_PERMISSIONS());
    setShowPassword(false); setShowForm(true);
  };

  const openEdit = (u: User) => {
    setIsEditing(true); setEditingId(u.id);
    setFormName(u.name); setFormUsername(u.username);
    setFormPassword(''); setFormRole(u.role);
    setFormPerms(parsePermissions(u.permissions));
    setShowPassword(false); setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formUsername.trim() || (!isEditing && !formPassword.trim())) {
      alert('Nama, username, dan password (buat baru) wajib diisi.'); return;
    }
    setSaving(true);
    try {
      const body: any = { name: formName.trim(), username: formUsername.trim(), role: formRole, permissions: JSON.stringify(formPerms) };
      if (!isEditing) body.password = formPassword;
      else if (formPassword.trim()) body.password = formPassword.trim();

      const url = isEditing ? `/api/users/${editingId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan');

      setShowForm(false);
      fetchUsers();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u: User) => {
    if (u.id === currentUser.id) { alert('Tidak bisa menghapus akun sendiri.'); return; }
    if (!confirm(`Hapus akun "${u.name}" secara permanen?`)) return;
    setDeleting(u.id);
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal');
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (e: any) { alert(e.message); }
    finally { setDeleting(null); }
  };

  const togglePerm = (menu: string, action: keyof UserPermissions[string]) => {
    setFormPerms(prev => ({
      ...prev,
      [menu]: { ...prev[menu], [action]: !prev[menu][action] }
    }));
  };

  const toggleMenuAccess = (menu: string) => {
    const allOn = formPerms[menu].access && formPerms[menu].create && formPerms[menu].edit && formPerms[menu].delete;
    setFormPerms(prev => ({
      ...prev,
      [menu]: { access: !allOn, create: !allOn, edit: !allOn, delete: !allOn }
    }));
  };

  // ── Styles ──
  const S = {
    page: { maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' } as React.CSSProperties,
    header: { display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--dash-border)', paddingBottom: '1.25rem' } as React.CSSProperties,
    h1: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-text)', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0 } as React.CSSProperties,
    h1Icon: { padding: '0.45rem', background: 'var(--dash-primary-bg)', color: 'var(--dash-primary)', borderRadius: '10px', display: 'flex' } as React.CSSProperties,
    subtext: { color: 'var(--dash-text-muted)', fontSize: '0.82rem', fontWeight: 500, marginTop: '0.25rem' } as React.CSSProperties,
    card: { background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '16px', overflow: 'hidden' } as React.CSSProperties,
    sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)' } as React.CSSProperties,
    sectionTitle: { fontWeight: 800, fontSize: '0.82rem', color: 'var(--dash-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.08em' } as React.CSSProperties,
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, color: '#fff', background: 'var(--dash-primary)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px -4px var(--dash-primary)' } as React.CSSProperties,
    btnSuccess: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, color: '#fff', background: 'var(--dash-success)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px -4px var(--dash-success)' } as React.CSSProperties,
    label: { display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.35rem' } as React.CSSProperties,
    filterPill: (active: boolean): React.CSSProperties => ({ padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${active ? 'var(--dash-primary)' : 'var(--dash-border)'}`, background: active ? 'var(--dash-primary-bg)' : 'var(--dash-card)', color: active ? 'var(--dash-primary)' : 'var(--dash-text-soft)', transition: 'all 0.15s' }),
    overlay: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '1rem' } as React.CSSProperties,
    modal: { background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' } as React.CSSProperties,
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', flexShrink: 0 } as React.CSSProperties,
    modalTitle: { fontWeight: 800, fontSize: '0.92rem', color: 'var(--dash-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 } as React.CSSProperties,
    modalBody: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' as const, flex: 1 } as React.CSSProperties,
    modalFooter: { borderTop: '1px solid var(--dash-border)', padding: '0.85rem 1.25rem', background: 'var(--dash-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.6rem', flexShrink: 0 } as React.CSSProperties,
    permMatrix: { display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' } as React.CSSProperties,
    permRow: { display: 'grid', gridTemplateColumns: '1.6fr repeat(4, 1fr)', gap: '0.5rem', alignItems: 'center', padding: '0.65rem 0.75rem', background: 'var(--dash-bg)', border: '1px solid var(--dash-border)', borderRadius: '10px' } as React.CSSProperties,
    permToggle: (on: boolean): React.CSSProperties => ({ width: '22px', height: '22px', background: on ? 'var(--dash-primary)' : 'var(--dash-surface-hover)', border: `1.5px solid ${on ? 'var(--dash-primary)' : 'var(--dash-border-2)'}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }),
  };

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h1 style={S.h1}>
              <span style={S.h1Icon}><Users size={22} /></span>
              Manajemen Akun
            </h1>
            <p style={S.subtext}>Tambah dan kelola akses pengguna sistem SIMAD beserta izin per modul.</p>
          </div>
          <button onClick={openCreate} style={S.btnPrimary}><Plus size={14} /> Tambah Pengguna</button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Akun', value: visibleUsers.length, color: 'var(--dash-primary)' },
            { label: 'Admin Dinas', value: visibleUsers.filter(u => u.role === 'admin_dinas').length, color: 'var(--dash-primary)' },
            { label: 'Admin Post', value: visibleUsers.filter(u => u.role === 'admin_post').length, color: 'var(--dash-success)' },
          ].map(st => (
            <div key={st.label} style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '0.55rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: st.color }}>{st.value}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Search */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterRole('all')} style={S.filterPill(filterRole === 'all')}>Semua</button>
          {SIMAD_ROLES.filter(r => r.value !== 'superadmin').map(r => (
            <button key={r.value} onClick={() => setFilterRole(r.value)} style={S.filterPill(filterRole === r.value)}>{r.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '280px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', pointerEvents: 'none' }} />
          <input className="dash-input" type="text" placeholder="Cari nama / username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '30px', width: '100%', boxSizing: 'border-box', fontSize: '0.82rem' }} />
        </div>
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={S.sectionHead}>
          <p style={S.sectionTitle}><Shield size={14} style={{ color: 'var(--dash-primary)' }} /> Daftar Pengguna</p>
          <span style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>{filteredUsers.length} Pengguna</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--dash-primary)' }} />
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Memuat data akun...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Users size={36} style={{ opacity: 0.2, marginBottom: '0.75rem', color: 'var(--dash-text-muted)' }} />
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', margin: 0 }}>
              {searchQuery ? 'Tidak ada pengguna yang cocok.' : 'Belum ada pengguna terdaftar.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Pengguna', 'Username', 'Peran', 'Izin Akses', 'Aksi'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--dash-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap', background: 'var(--dash-surface-hover)', borderBottom: '1px solid var(--dash-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((u, idx) => {
                    const rm = ROLE_META[u.role] || { label: u.role, color: 'var(--dash-text-soft)' };
                    const perms = parsePermissions(u.permissions);
                    const accessCount = Object.values(perms).filter(p => p?.access).length;
                    const isSelf = u.id === currentUser.id;
                    return (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.04 }}
                        style={{ borderBottom: '1px solid var(--dash-border)', background: isSelf ? 'var(--dash-primary-bg)' : 'transparent' }}>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' as const }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${rm.color}20`, border: `1.5px solid ${rm.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem', fontWeight: 800, color: rm.color }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--dash-text)' }}>{u.name}</p>
                              {isSelf && <span style={{ fontSize: '0.62rem', color: 'var(--dash-primary)', fontWeight: 700 }}>Akun Anda</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <code style={{ fontSize: '0.78rem', background: 'var(--dash-bg)', padding: '0.2rem 0.55rem', borderRadius: '6px', color: 'var(--dash-text-soft)', border: '1px solid var(--dash-border)', fontFamily: 'monospace' }}>{u.username}</code>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' as const }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: '7px', fontSize: '0.7rem', fontWeight: 800, background: `${rm.color}15`, color: rm.color, border: `1px solid ${rm.color}30` }}>
                            {u.role === 'superadmin' && <ShieldCheck size={11} />}
                            {rm.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ flex: 1, height: '5px', background: 'var(--dash-border)', borderRadius: '4px', maxWidth: '80px' }}>
                              <div style={{ height: '100%', background: 'var(--dash-primary)', borderRadius: '4px', width: `${(accessCount / SIMAD_MENUS.length) * 100}%`, transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)', fontWeight: 700 }}>{accessCount}/{SIMAD_MENUS.length}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' as const }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => openEdit(u)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--dash-primary)', background: 'var(--dash-primary-bg)', border: '1px solid var(--dash-primary)30', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Edit2 size={11} /> Edit
                            </button>
                            {!isSelf && (
                              <button onClick={() => handleDelete(u)} disabled={deleting === u.id} style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--dash-danger)', background: 'var(--dash-danger-bg)', border: '1px solid var(--dash-danger)30', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: deleting === u.id ? 0.5 : 1 }}>
                                {deleting === u.id ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={11} />}
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: Tambah / Edit User ── */}
      <AnimatePresence>
        {showForm && (
          <div style={S.overlay}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }} style={S.modal}>
              <div style={S.modalHeader}>
                <p style={S.modalTitle}>
                  {isEditing ? <><Edit2 size={15} style={{ color: 'var(--dash-primary)' }} /> Edit Pengguna</> : <><Plus size={15} style={{ color: 'var(--dash-primary)' }} /> Tambah Pengguna Baru</>}
                </p>
                <button onClick={() => { if (!saving) setShowForm(false); }} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
              </div>

              <div style={S.modalBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {/* Left column — form fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={S.label}>Nama Lengkap</label>
                      <input className="dash-input" type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nama tampil..." style={{ fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={S.label}>Username</label>
                      <input className="dash-input" type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="username_sistem" disabled={isEditing} style={{ fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', opacity: isEditing ? 0.6 : 1 }} />
                      {isEditing && <p style={{ margin: '0.3rem 0 0', fontSize: '0.67rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>Username tidak dapat diubah setelah dibuat.</p>}
                    </div>
                    <div>
                      <label style={S.label}>{isEditing ? 'Password Baru (kosongkan jika tidak berubah)' : 'Password'}</label>
                      <div style={{ position: 'relative' }}>
                        <input className="dash-input" type={showPassword ? 'text' : 'password'} value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder={isEditing ? '(kosongkan = tidak berubah)' : 'Masukkan password...'} style={{ fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', paddingRight: '40px' }} />
                        <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={S.label}>Peran / Role</label>
                      <select className="dash-input" value={formRole} onChange={e => setFormRole(e.target.value)} style={{ cursor: 'pointer', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}>
                        {SIMAD_ROLES.filter(r => r.value !== 'superadmin').map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.75rem', background: 'var(--dash-bg)', border: '1px solid var(--dash-border)', borderRadius: '8px', fontSize: '0.72rem', color: 'var(--dash-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <Shield size={12} style={{ flexShrink: 0, marginTop: '1px' }} /> Atur halaman yang dapat diakses pengguna di kolom sebelah kanan.
                      </div>
                    </div>
                  </div>

                  {/* Right column — Permission Matrix */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--dash-border)' }}>
                      <KeyRound size={13} style={{ color: 'var(--dash-primary)' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--dash-text)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Izin Akses Modul</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {SIMAD_MENUS.map(menu => {
                        const p = formPerms[menu.key] ?? { access: false, create: false, edit: false, delete: false };
                        const isOn = p.access;
                        return (
                          <button
                            key={menu.key}
                            onClick={() => setFormPerms(prev => ({ ...prev, [menu.key]: { ...prev[menu.key], access: !isOn } }))}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.75rem',
                              padding: '0.7rem 0.9rem', borderRadius: '10px', cursor: 'pointer',
                              border: `1.5px solid ${isOn ? 'var(--dash-primary)' : 'var(--dash-border)'}`,
                              background: isOn ? 'var(--dash-primary-bg)' : 'var(--dash-bg)',
                              transition: 'all 0.15s', textAlign: 'left' as const,
                            }}
                          >
                            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: isOn ? 'var(--dash-primary)' : 'var(--dash-surface-hover)', border: `1.5px solid ${isOn ? 'var(--dash-primary)' : 'var(--dash-border-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                              {isOn && <Check size={11} style={{ color: '#fff', strokeWidth: 3 }} />}
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>{menu.icon}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isOn ? 'var(--dash-text)' : 'var(--dash-text-muted)', transition: 'color 0.15s' }}>{menu.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>Centang halaman yang dapat diakses pengguna ini.</p>
                  </div>
                </div>
              </div>

              <div style={S.modalFooter}>
                <button onClick={() => setShowForm(false)} disabled={saving} style={{ padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-text-soft)', background: 'var(--dash-surface-hover)', border: '1px solid var(--dash-border)', borderRadius: '10px', cursor: 'pointer' }}>Batal</button>
                <button onClick={handleSubmit} disabled={saving} style={S.btnSuccess}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                  {saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Akun'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
