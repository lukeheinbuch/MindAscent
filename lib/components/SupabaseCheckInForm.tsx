'use client';

import React, { useState } from 'react';
import { submitCheckIn } from '../client/checkins';

type CheckInPayload = {
  date: string // YYYY-MM-DD (client local date)
  mood_rating: number // 1-10
  energy_level: number // 1-10
  stress_management: number // 1-10, higher = better stress management
  sleep_hours?: number
  notes?: string
}

export default function SupabaseCheckInForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<CheckInPayload>({
    date: new Date().toISOString().split('T')[0],
    mood_rating: 5,
    energy_level: 5,
    stress_management: 5,
    sleep_hours: 8,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await submitCheckIn(formData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-red-400">Quick Supabase Check-in Test</h3>
      
      {success && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded text-green-300">
          Check-in saved successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Mood (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.mood_rating}
            onChange={(e) => setFormData({ ...formData, mood_rating: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className="text-sm text-gray-400">{formData.mood_rating}/10</span>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Energy (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.energy_level}
            onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className="text-sm text-gray-400">{formData.energy_level}/10</span>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Stress Management (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.stress_management}
            onChange={(e) => setFormData({ ...formData, stress_management: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className="text-sm text-gray-400">{formData.stress_management}/10</span>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Sleep Hours</label>
          <input
            type="number"
            step="0.5"
            value={formData.sleep_hours || 8}
            onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) })}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white h-20"
            placeholder="How are you feeling today?"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Saving...' : 'Submit Check-in'}
        </button>
      </form>
    </div>
  );
}
