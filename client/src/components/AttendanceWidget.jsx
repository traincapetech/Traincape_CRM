import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AttendanceWidget = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayAttendance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await api.post('/attendance/checkin', { notes });
      setTodayAttendance(response.data);
      setNotes('');
      alert('Check-in successful!');
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Error checking in: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const response = await api.put('/attendance/checkout', { notes });
      setTodayAttendance(response.data);
      setNotes('');
      alert('Check-out successful!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Error checking out: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Attendance
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {todayAttendance?.data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-800 dark:text-green-300 text-sm font-medium">
                Check-in Time
              </div>
              <div className="text-green-900 dark:text-green-100 text-lg font-bold">
                {formatTime(todayAttendance.data.checkIn)}
              </div>
            </div>
            
            {todayAttendance.data.checkOut ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-red-800 dark:text-red-300 text-sm font-medium">
                  Check-out Time
                </div>
                <div className="text-red-900 dark:text-red-100 text-lg font-bold">
                  {formatTime(todayAttendance.data.checkOut)}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Check-out Time
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  Not checked out
                </div>
              </div>
            )}
          </div>

          {todayAttendance.data.totalHours > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                Total Hours
              </div>
              <div className="text-blue-900 dark:text-blue-100 text-lg font-bold">
                {todayAttendance.data.totalHours.toFixed(2)} hours
              </div>
              <div className="text-blue-600 dark:text-blue-400 text-sm">
                Status: {todayAttendance.data.status}
              </div>
            </div>
          )}

          {!todayAttendance.data.checkOut && (
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for check-out (optional)"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                rows="2"
              />
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-md transition-colors"
              >
                {checkingOut ? 'Checking Out...' : 'Check Out'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-gray-500 dark:text-gray-400">
            You haven't checked in today
          </div>
          
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for check-in (optional)"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              rows="2"
            />
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md transition-colors"
            >
              {checkingIn ? 'Checking In...' : 'Check In'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceWidget; 