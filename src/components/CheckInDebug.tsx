import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckInService } from '@/services/checkins';

const CheckInDebug: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkTodayStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const todayStatus = await CheckInService.getTodayStatus(user.uid);
      setStatus(`Checked in today: ${todayStatus.checkedIn}\nCheck-in data: ${JSON.stringify(todayStatus.checkIn, null, 2)}`);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
    setLoading(false);
  };

  const clearAllCache = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`checkIn_${today}`);
    if (user) {
      localStorage.removeItem(`demo_checkins_${user.uid}`);
      localStorage.removeItem(`demo_daily_${user.uid}`);
    }
    setStatus('All check-in caches cleared');
  };

  const testSaveCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const testData = {
        mood: 8,
        stress_management: 7,
        energy: 7,
        motivation: 9,
        sleep: 6,
        soreness: 4,
        focus: 8,
        trainingLoad: 'moderate' as const,
        preCompetition: false,
        note: 'Test check-in from debug component'
      };
      
      const result = await CheckInService.saveCheckIn(user.uid, testData);
      setStatus(`Test check-in saved: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setStatus(`Save error: ${error}`);
    }
    setLoading(false);
  };

  const viewAllCheckIns = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const checkIns = await CheckInService.getCheckIns(user.uid);
      setStatus(`All check-ins (${checkIns.length}): ${JSON.stringify(checkIns, null, 2)}`);
    } catch (error) {
      setStatus(`Error getting check-ins: ${error}`);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
        <p className="text-yellow-400">Debug: User not authenticated</p>
      </div>
    );
  }

  const isDemo = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  return (
    <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-2">Check-in Debug Panel</h3>
      <p className="text-sm text-gray-400 mb-3">
        Mode: {isDemo ? 'Demo (localStorage)' : 'Auth'} | User: {user.email || 'unknown'} ({user.uid})
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={checkTodayStatus}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
        >
          Check Today Status
        </button>
        <button
          onClick={clearAllCache}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm"
        >
          Clear All Cache
        </button>
        <button
          onClick={testSaveCheckIn}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
        >
          Test Save Check-in
        </button>
        <button
          onClick={viewAllCheckIns}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
        >
          View All Check-ins
        </button>
      </div>
      {loading && (
        <div className="text-gray-400 text-sm mb-2">Loading...</div>
      )}
      {status && (
        <div className="bg-gray-800 p-3 rounded border border-gray-700 max-h-40 overflow-y-auto">
          <pre className="text-gray-300 text-xs whitespace-pre-wrap">{status}</pre>
        </div>
      )}
    </div>
  );
};

export default CheckInDebug;
