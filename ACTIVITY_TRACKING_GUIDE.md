# CRM Activity Tracking System

## Overview

The CRM Activity Tracking System provides comprehensive monitoring of employee usage and productivity within the CRM application. This feature allows administrators and managers to track how long employees spend actively using the system on a daily basis.

## Features

### 🕒 **Real-Time Activity Tracking**
- Automatic session start when users log in
- Real-time timer display in the navigation bar
- Tracks active usage time (not just idle time)
- Handles page visibility changes and browser events
- **NEW**: System lock/unlock detection - timer automatically pauses when system locks
- **NEW**: Manual timer controls for employees

### 📊 **Admin Dashboard**
- **Today's Activity**: View current day's usage with live updates
- **Date Range Reports**: Historical activity data for any date range
- **Statistics**: Comprehensive analytics for the last 7, 14, or 30 days
- **User Details**: Individual user activity breakdown with roles and status

### 🔄 **Smart Session Management**
- Automatic session ending on page close/refresh
- Inactivity detection (5-minute threshold)
- **NEW**: System lock detection (pauses timer when screen locks)
- **NEW**: Tab switching detection (pauses timer when tab is hidden)
- Reliable tracking using `navigator.sendBeacon()` for page unload events
- Session persistence across page reloads

### 👤 **Employee Controls**
- **NEW**: Manual start/pause timer controls
- **NEW**: Hover over timer to access control panel
- **NEW**: Visual status indicators (Active, Paused, Stopped)
- **NEW**: Transparent tracking with user control

### 📈 **Detailed Analytics**
- Total active time per user per day
- Number of sessions per user
- Average daily usage statistics
- Role-based activity breakdown
- Currently active users indicator

## How It Works

### Backend Components

1. **UserActivity Model** (`server/models/UserActivity.js`)
   - Stores daily activity records for each user
   - Tracks individual sessions with start/end times
   - Calculates total active time per day

2. **Activity Routes** (`server/routes/activity.js`)
   - `/api/activity/start-session` - Start a new activity session
   - `/api/activity/end-session` - End current session
   - `/api/activity/end-session-beacon` - **NEW**: Special endpoint for sendBeacon requests
   - `/api/activity/track` - Periodic activity updates
   - `/api/activity/my-activity` - Get user's own activity
   - `/api/activity/all-users` - Get all users' activity (Admin/Manager only)
   - `/api/activity/statistics` - Get activity statistics (Admin/Manager only)

### Frontend Components

1. **Activity Tracker Hook** (`client/src/hooks/useActivityTracker.js`)
   - Automatically tracks user activity
   - Handles session start/end
   - Monitors user interactions (mouse, keyboard, scroll)
   - **NEW**: System lock/unlock detection via Page Visibility API
   - **NEW**: Manual pause/resume functionality
   - **NEW**: Persistent manual pause state across sessions
   - Manages inactivity detection

2. **Activity Timer Widget** (`client/src/components/ActivityTimer/ActivityTimer.jsx`)
   - Displays current session time in the navbar
   - **NEW**: Hover-activated control panel
   - **NEW**: Manual start/pause buttons
   - **NEW**: Status indicators (▶️ Active, ⏸️ Paused, ⏹️ Stopped)
   - **NEW**: Help text explaining automatic features
   - Shows active status indicator
   - Updates in real-time

3. **Admin Activity Dashboard** (`client/src/pages/AdminActivityPage.jsx`)
   - Comprehensive activity monitoring interface
   - Multiple views: Today, Date Range, Statistics
   - Real-time data updates every 30 seconds

## Usage

### For Employees

#### Automatic Features
- **Auto-Start**: Activity tracking starts automatically when you log in
- **System Lock Detection**: Timer automatically pauses when your system locks
- **Tab Switching**: Timer pauses when you switch to other tabs or applications
- **Inactivity Detection**: Timer pauses after 5 minutes of no activity

#### Manual Controls
1. **View Timer**: Current session time is displayed in the top navigation bar
2. **Access Controls**: Hover over the timer to see the control panel
3. **Manual Pause**: Click the "⏸️ Pause" button to manually pause tracking
4. **Manual Resume**: Click the "▶️ Start" button to resume tracking
5. **Status Indicators**: 
   - ▶️ = Timer is actively running
   - ⏸️ = Timer is paused (manually or automatically)
   - ⏹️ = Timer is stopped

#### Privacy Features
- **Transparent Tracking**: You can always see your current session time
- **User Control**: You can manually pause/resume your timer
- **Content Privacy**: Only active usage time is tracked, not screen content or keystrokes
- **Clear Status**: Always know if tracking is active or paused

### For Administrators/Managers
1. **Access Dashboard**: Navigate to "Activity Dashboard" in the admin section
2. **View Today's Activity**: See real-time usage for all employees
3. **Historical Reports**: Use date range selector for historical data
4. **Analytics**: View statistics for productivity insights

### Dashboard Features

#### Today's Activity Tab
- **Summary Cards**: Total users, currently active, total time, average time
- **User Table**: Detailed breakdown by user with role, status, and session info
- **Auto-refresh**: Updates every 30 seconds
- **Date Selector**: View activity for any specific date

#### Date Range Tab
- **Custom Range**: Select start and end dates
- **Bulk Data**: View activity across multiple days
- **Export Ready**: Data formatted for easy analysis

#### Statistics Tab
- **Period Selection**: 7, 14, or 30-day views
- **Daily Trends**: Day-by-day activity breakdown
- **Top Users**: Most active employees ranking
- **Averages**: Daily average calculations per user

## Technical Implementation

### System Lock Detection
```javascript
// Page Visibility API for system lock detection
document.addEventListener('visibilitychange', () => {
  if (document.hidden || document.visibilityState === 'hidden') {
    // System locked or tab hidden - pause timer
    pauseTracking();
  } else if (document.visibilityState === 'visible') {
    // System unlocked or tab visible - resume timer
    resumeTracking();
  }
});
```

### Manual Controls
```javascript
// Manual pause/resume functions
const manualPause = () => {
  isManuallyPaused.current = true;
  localStorage.setItem('activityManuallyPaused', 'true');
  endSession();
};

const manualResume = () => {
  isManuallyPaused.current = false;
  localStorage.setItem('activityManuallyPaused', 'false');
  startSession();
};
```

### Activity Detection
```javascript
// Events monitored for activity
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

// Inactivity threshold
const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes
```

### Reliable Session Ending
```javascript
// Special beacon endpoint for page unload
navigator.sendBeacon('/api/activity/end-session-beacon', JSON.stringify({
  duration: sessionDuration,
  token: authToken // Token in body for beacon requests
}));
```

### Data Storage
```javascript
// MongoDB Schema
{
  userId: ObjectId,
  date: "YYYY-MM-DD",
  sessions: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // seconds
    isActive: Boolean
  }],
  totalActiveTime: Number, // seconds
  lastActivity: Date
}
```

### API Endpoints

#### Start Session
```http
POST /api/activity/start-session
Authorization: Bearer <token>
```

#### End Session
```http
POST /api/activity/end-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration": 3600 // seconds
}
```

#### End Session (Beacon)
```http
POST /api/activity/end-session-beacon
Content-Type: application/json

{
  "duration": 3600, // seconds
  "token": "<auth-token>" // Token in body for sendBeacon
}
```

#### Get All Users Activity
```http
GET /api/activity/all-users?date=2024-01-15
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /api/activity/statistics?days=7
Authorization: Bearer <token>
```

## Security & Privacy

### Data Protection
- Only tracks usage duration, not content
- No screen recording or keystroke logging
- Secure API endpoints with role-based access
- Data encrypted in transit and at rest

### Access Control
- **Employees**: Can only view their own activity data
- **Managers**: Can view all team activity data
- **Admins**: Full access to all activity data and analytics

### Privacy Compliance
- **Transparent tracking**: Users can see their timer and controls
- **User control**: Manual pause/resume functionality
- **Clear purpose**: Productivity monitoring and resource planning
- **No surveillance**: Focus on time tracking, not content monitoring

### Employee Rights
- **Visibility**: Always see current tracking status
- **Control**: Ability to manually pause tracking
- **Transparency**: Clear indication when tracking is active/paused
- **Privacy**: No access to screen content or detailed activity

## Benefits

### For Management
- **Productivity Insights**: Understand team engagement levels
- **Resource Planning**: Optimize staffing based on usage patterns
- **Performance Metrics**: Data-driven performance evaluations
- **System Usage**: Monitor CRM adoption and utilization
- **Fair Evaluation**: Objective activity measurements

### For Employees
- **Self-Monitoring**: Track your own productivity
- **Transparency**: Clear visibility into what's being tracked
- **Control**: Manual pause/resume capabilities
- **Fair Evaluation**: Objective activity measurements
- **Goal Setting**: Use data for personal productivity goals
- **Work-Life Balance**: Pause tracking during breaks

## Troubleshooting

### Common Issues

1. **Timer Not Starting**
   - Check if user is logged in
   - Verify user role (Customers are excluded)
   - Check if manually paused (hover over timer to see controls)
   - Check browser console for errors

2. **Timer Not Pausing on System Lock**
   - Verify browser supports Page Visibility API
   - Check if manual pause is enabled
   - Test with tab switching first

3. **Data Not Updating**
   - Ensure backend server is running
   - Check API endpoint accessibility
   - Verify user permissions
   - Check network connectivity

4. **Manual Controls Not Working**
   - Hover over timer to access control panel
   - Check if user has proper permissions
   - Verify localStorage is enabled

5. **Inaccurate Time Tracking**
   - Check browser tab visibility
   - Verify activity detection events
   - Review inactivity threshold settings
   - Check for manual pause state

### Browser Compatibility
- **Supported**: Chrome, Firefox, Safari, Edge (modern versions)
- **Required Features**: 
  - `navigator.sendBeacon()` API
  - `document.hidden` and Page Visibility API
  - `localStorage` support
- **Fallbacks**: Included for older browsers

### Environment Setup
```bash
# Client .env file
VITE_API_URL=http://localhost:8080/api

# Server environment
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
```

## Future Enhancements

### Planned Features
- **Mobile App Support**: Extend tracking to mobile applications
- **Detailed Breakdowns**: Track time per CRM module/feature
- **Productivity Scores**: AI-driven productivity analytics
- **Team Comparisons**: Department-wise activity comparisons
- **Export Features**: CSV/PDF report generation
- **Notifications**: Activity reminders and goals
- **Break Tracking**: Automatic break detection and logging
- **Offline Support**: Track activity when offline and sync when online

### Integration Possibilities
- **HR Systems**: Integration with payroll and HR platforms
- **Project Management**: Link activity to specific projects/tasks
- **Performance Reviews**: Automated activity reports for reviews
- **Time Tracking**: Integration with existing time tracking tools
- **Calendar Integration**: Sync with meeting schedules
- **Slack/Teams**: Activity status integration

## Support

For technical support or feature requests related to the activity tracking system, please contact the development team or create an issue in the project repository.

---

**Note**: This activity tracking system is designed to be transparent, fair, and focused on productivity improvement rather than surveillance. All tracking is clearly visible to users, includes user controls, and serves legitimate business purposes. The system respects employee privacy while providing valuable insights for both employees and management. 