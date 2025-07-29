import React, { useState, useEffect } from 'react';
import { FaClock, FaCalendarCheck, FaSignInAlt, FaSignOutAlt, FaChartBar, FaMapMarkerAlt, FaDownload, FaFilter, FaSpinner } from 'react-icons/fa';
import { attendanceAPI } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-toastify';

// Office location coordinates (update these with your actual office coordinates)
const OFFICE_LOCATION = {
  latitude: 28.607407 ,   // UPDATE: Replace with your actual office latitude
  longitude: 77.081754,  // UPDATE: Replace with your actual office longitude
  allowedRadius: 20    // 20 meters radius (you can adjust this)
};

const AttendanceManagement = ({ employeeId, userRole }) => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isInOfficeRange, setIsInOfficeRange] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showReports, setShowReports] = useState(false);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Check if user is within office range
  const checkLocationValidity = (userLat, userLng) => {
    const distance = calculateDistance(
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude,
      userLat,
      userLng
    );
    return distance <= OFFICE_LOCATION.allowedRadius;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAttendance();
    fetchTodayAttendance();

    // Set up interval to refresh data every minute
    const interval = setInterval(() => {
      fetchAttendance();
      fetchTodayAttendance();
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        month: selectedMonth + 1, // API expects 1-based month
        year: selectedYear
      };
      const response = await attendanceAPI.getHistory(params);
      setAttendance(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      if (response.data.success) {
        setTodayAttendance(response.data.data);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      toast.error('Failed to fetch today\'s attendance status');
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      setGettingLocation(true);
      setLocationError('');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGettingLocation(false);
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Check if user is within office range
          const isInRange = checkLocationValidity(userLocation.latitude, userLocation.longitude);
          const distance = calculateDistance(
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude,
            userLocation.latitude,
            userLocation.longitude
          );
          
          userLocation.distance = distance;
          userLocation.isInOfficeRange = isInRange;
          
          setLocation(userLocation);
          setIsInOfficeRange(isInRange);
          
          if (!isInRange) {
            setLocationError(`You are ${distance.toFixed(1)} meters away from office. Please move within ${OFFICE_LOCATION.allowedRadius} meters to mark attendance.`);
          } else {
            setLocationError('');
          }
          
          resolve(userLocation);
        },
        (error) => {
          setGettingLocation(false);
          let errorMessage = 'Unable to get your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }
          
          setLocationError(errorMessage);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      // Get location for check-in
      let locationData = null;
      try {
        locationData = await getCurrentLocation();
        
        // Check if user is within office range
        if (!locationData.isInOfficeRange) {
          toast.error(`Cannot check in: You are ${locationData.distance.toFixed(1)} meters away from office. Please move within ${OFFICE_LOCATION.allowedRadius} meters of the office location.`);
          return;
        }
      } catch (error) {
        console.warn('Could not get location:', error);
        toast.error('Location access is required for attendance marking. Please enable location services and try again.');
        return;
      }
      
      const response = await attendanceAPI.checkIn({ 
        notes: '', 
        location: locationData 
      });
      
      if (response.data.success) {
        setTodayAttendance(response.data.data);
        toast.success('Check-in successful! You are within the office premises.');
        
        // Refresh attendance data
        fetchAttendance();
      } else {
        toast.error(response.data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    try {
      // Get location for check-out
      let locationData = null;
      try {
        locationData = await getCurrentLocation();
        
        // Check if user is within office range
        if (!locationData.isInOfficeRange) {
          toast.error(`Cannot check out: You are ${locationData.distance.toFixed(1)} meters away from office. Please move within ${OFFICE_LOCATION.allowedRadius} meters of the office location.`);
          return;
        }
      } catch (error) {
        console.warn('Could not get location:', error);
        toast.error('Location access is required for attendance marking. Please enable location services and try again.');
        return;
      }
      
      const response = await attendanceAPI.checkOut({ 
        notes: '', 
        location: locationData 
      });
      
      if (response.data.success) {
        setTodayAttendance(response.data.data);
        toast.success('Check-out successful! Have a great day.');
        
        // Refresh attendance data
        fetchAttendance();
      } else {
        toast.error(response.data.message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out. Please try again.');
    }
  };

  const calculateStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(att => att.status === 'PRESENT').length;
    const totalHours = attendance.reduce((sum, att) => sum + (att.totalHours || 0), 0);
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0;
    
    return {
      totalDays,
      presentDays,
      totalHours: totalHours.toFixed(1),
      avgHours: avgHours.toFixed(1),
      attendanceRate: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
    };
  };

  const exportAttendanceData = () => {
    const filteredData = getFilteredAttendance();
    const csvContent = [
      ['Date', 'Check In', 'Check Out', 'Hours', 'Status', 'Location'],
      ...filteredData.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--',
        record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--',
        record.totalHours ? `${record.totalHours.toFixed(1)}h` : '--',
        record.status,
        record.location ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${months[selectedMonth]}_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredAttendance = () => {
    return attendance.filter(record => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'Present') return record.status === 'PRESENT';
      if (filterStatus === 'Absent') return record.status === 'ABSENT';
      if (filterStatus === 'Half Day') return record.status === 'HALF_DAY';
      if (filterStatus === 'Late') return record.status === 'LATE';
      return record.status === filterStatus;
    });
  };

  const stats = calculateStats();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Today's Attendance */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <FaClock className="mr-2 text-blue-600" />
          Today's Attendance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentTime.toTimeString().slice(0, 8)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Check In</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Check Out</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          {!todayAttendance?.checkIn ? (
            <button
              onClick={handleCheckIn}
              disabled={gettingLocation}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {gettingLocation ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSignInAlt className="mr-2" />
              )}
              {gettingLocation ? 'Getting Location...' : 'Check In'}
            </button>
          ) : !todayAttendance?.checkOut ? (
            <button
              onClick={handleCheckOut}
              disabled={gettingLocation}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              {gettingLocation ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSignOutAlt className="mr-2" />
              )}
              {gettingLocation ? 'Getting Location...' : 'Check Out'}
            </button>
          ) : (
            <div className="text-center">
              <div className="text-green-600 font-medium">
                ✅ Attendance marked for today
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Working Hours: {todayAttendance.totalHours?.toFixed(1)} hours
              </div>
              {todayAttendance?.location && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center">
                  <FaMapMarkerAlt className="mr-1" />
                  Location tracked
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location Status */}
        {location && (
          <div className={`mt-4 p-3 rounded-lg ${
            isInOfficeRange 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className={`flex items-center text-sm ${
              isInOfficeRange 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              <FaMapMarkerAlt className="mr-2" />
              <div>
                <div className="font-medium">
                  {isInOfficeRange ? '✅ Within Office Range' : '❌ Outside Office Range'}
                </div>
                <div className="text-xs mt-1">
                  Your Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                <div className="text-xs">
                  Office Location: {OFFICE_LOCATION.latitude.toFixed(6)}, {OFFICE_LOCATION.longitude.toFixed(6)}
                </div>
                <div className="text-xs">
                  Distance: {location.distance ? `${location.distance.toFixed(1)}m` : 'Calculating...'} 
                  (Required: ≤ {OFFICE_LOCATION.allowedRadius}m)
                </div>
                <div className="text-xs">
                  GPS Accuracy: ±{location.accuracy.toFixed(0)}m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center text-sm text-red-600 dark:text-red-400">
              <FaMapMarkerAlt className="mr-2" />
              <div>
                <div className="font-medium">Location Error</div>
                <div className="text-xs mt-1">{locationError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Office Location Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <FaMapMarkerAlt className="mr-2" />
            <div>
              <div className="font-medium">Office Location</div>
              <div className="text-xs mt-1">
                {OFFICE_LOCATION.latitude.toFixed(6)}, {OFFICE_LOCATION.longitude.toFixed(6)}
              </div>
              <div className="text-xs">
                Attendance allowed within {OFFICE_LOCATION.allowedRadius} meters radius
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <FaChartBar className="mr-2 text-blue-600" />
          Monthly Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.avgHours}h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.attendanceRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Attendance</div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FaCalendarCheck className="mr-2 text-blue-600" />
            Attendance History
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => exportAttendanceData()}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <FaDownload className="mr-1" />
              Export
            </button>
            <button
              onClick={() => setShowReports(!showReports)}
              className="flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              <FaChartBar className="mr-1" />
              Reports
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner 
              size={45}
              text="Loading attendance..."
              particleCount={1}
              speed={1.2}
              hueRange={[180, 240]}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Check In</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Check Out</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hours</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredAttendance().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No attendance records found for selected filters
                    </td>
                  </tr>
                ) : (
                  getFilteredAttendance().map((record) => (
                    <tr key={`${record.date}-${record._id || Date.now()}`} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '--'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Present' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : record.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : record.status === 'Half Day'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {record.location ? (
                          <FaMapMarkerAlt className="text-green-600" title="Location tracked" />
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Reports Section */}
        {showReports && (
          <div className="mt-6 bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Analytics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Weekly Pattern</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Monday: {attendance.filter(a => new Date(a.date).getDay() === 1).length} days</p>
                  <p>Tuesday: {attendance.filter(a => new Date(a.date).getDay() === 2).length} days</p>
                  <p>Wednesday: {attendance.filter(a => new Date(a.date).getDay() === 3).length} days</p>
                  <p>Thursday: {attendance.filter(a => new Date(a.date).getDay() === 4).length} days</p>
                  <p>Friday: {attendance.filter(a => new Date(a.date).getDay() === 5).length} days</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Time Patterns</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Early Check-ins: {attendance.filter(a => a.checkIn && a.checkIn < '09:00').length}</p>
                  <p>Late Check-ins: {attendance.filter(a => a.checkIn && a.checkIn > '09:15').length}</p>
                  <p>Early Check-outs: {attendance.filter(a => a.checkOut && a.checkOut < '17:30').length}</p>
                  <p>Late Check-outs: {attendance.filter(a => a.checkOut && a.checkOut > '18:30').length}</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Perfect Days: {attendance.filter(a => a.workingHours >= 8).length}</p>
                  <p>Short Days: {attendance.filter(a => a.workingHours < 8 && a.workingHours > 0).length}</p>
                  <p>Location Tracked: {attendance.filter(a => a.location).length} days</p>
                  <p>Punctuality Score: {attendance.length > 0 ? ((attendance.filter(a => a.checkIn && a.checkIn <= '09:00').length / attendance.length) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement; 