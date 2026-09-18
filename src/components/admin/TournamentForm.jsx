import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useTournaments } from '../../context/TournamentContext';
import { Calendar, Clock, Trophy, MapPin, Users, Key, AlertCircle } from 'lucide-react';

export const TournamentForm = ({ isOpen, onClose, tournamentToEdit = null }) => {
  const { createTournament, updateTournament } = useTournaments();

  const isEditing = Boolean(tournamentToEdit);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    mode: 'Squad',
    map: 'Bermuda',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '20:00',
    entry_fee: 100,
    prize_pool: 15000,
    total_slots: 12,
    room_id: '',
    room_password: '',
    rules: '1. Emulators prohibited.\n2. Standard Free Fire 12-point scoring applied.\n3. Check-in closes 15 mins prior.'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (tournamentToEdit) {
      setFormData({
        name: tournamentToEdit.name || '',
        description: tournamentToEdit.description || '',
        banner_url: tournamentToEdit.banner_url || '',
        mode: tournamentToEdit.mode || 'Squad',
        map: tournamentToEdit.map || 'Bermuda',
        date: tournamentToEdit.date || '',
        time: tournamentToEdit.time || '',
        entry_fee: tournamentToEdit.entry_fee || 0,
        prize_pool: tournamentToEdit.prize_pool || 0,
        total_slots: tournamentToEdit.total_slots || 12,
        room_id: tournamentToEdit.room_id || '',
        room_password: tournamentToEdit.room_password || '',
        rules: tournamentToEdit.rules || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        mode: 'Squad',
        map: 'Bermuda',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '20:00',
        entry_fee: 100,
        prize_pool: 15000,
        total_slots: 12,
        room_id: '',
        room_password: '',
        rules: '1. Emulators prohibited.\n2. Standard Free Fire 12-point scoring applied.\n3. Check-in closes 15 mins prior.'
      });
    }
  }, [tournamentToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide a tournament title.');
      return;
    }

    if (isEditing) {
      updateTournament(tournamentToEdit.id, formData);
    } else {
      createTournament(formData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'EDIT TOURNAMENT' : 'HOST NEW TOURNAMENT'}
      subtitle="Free Fire Battle Royale Configuration"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-950/80 border border-red-500 p-3 rounded clip-hud-sm text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
            Tournament Name *
          </label>
          <input
            type="text"
            required
            name="name"
            placeholder="e.g. Panthers Bermuda Clash — Season 1"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500 font-rajdhani font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
              Battle Mode *
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500 font-rajdhani font-bold"
            >
              <option value="Squad">Squad (4 Players)</option>
              <option value="Duo">Duo (2 Players)</option>
              <option value="Solo">Solo (1 Player)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
              Map *
            </label>
            <select
              name="map"
              value={formData.map}
              onChange={handleChange}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500 font-rajdhani font-bold"
            >
              <option value="Bermuda">Bermuda</option>
              <option value="Purgatory">Purgatory</option>
              <option value="Kalahari">Kalahari</option>
              <option value="Alpine">Alpine</option>
              <option value="NeXTerra">NeXTerra</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
              Total Slots *
            </label>
            <input
              type="number"
              min={2}
              max={48}
              name="total_slots"
              value={formData.total_slots}
              onChange={handleChange}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
              Match Date *
            </label>
            <input
              type="date"
              required
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500"
            />
          </div>

          <div>
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
              Match Time (IST) *
            </label>
            <input
              type="time"
              required
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
              Entry Fee (₹ per squad)
            </label>
            <input
              type="number"
              min={0}
              name="entry_fee"
              value={formData.entry_fee}
              onChange={handleChange}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
              Total Prize Pool (₹)
            </label>
            <input
              type="number"
              min={0}
              name="prize_pool"
              value={formData.prize_pool}
              onChange={handleChange}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-amber-gold focus:outline-none focus:border-flame-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Room Credentials */}
        <div className="bg-panther-950/80 p-3 rounded border border-panther-800 space-y-2">
          <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Custom Room Credentials (Pre-Release)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-rajdhani font-bold text-gray-400 uppercase mb-1">
                Room ID
              </label>
              <input
                type="text"
                name="room_id"
                placeholder="e.g. 8829104"
                value={formData.room_id}
                onChange={handleChange}
                className="w-full bg-panther-900 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-rajdhani font-bold text-gray-400 uppercase mb-1">
                Room Password
              </label>
              <input
                type="text"
                name="room_password"
                placeholder="e.g. PANTHERS"
                value={formData.room_password}
                onChange={handleChange}
                className="w-full bg-panther-900 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Description & Rules */}
        <div>
          <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
            Tournament Overview
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-flame-500 font-sans"
            placeholder="Brief tournament summary..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-panther-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Save Changes' : 'Launch Tournament & Generate Slots'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
