import { useState, useEffect, useMemo } from 'react';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { realtimeDb } from '../../utils/firebase';
import { ref, onValue } from 'firebase/database';
import { FaVideo, FaClock, FaTrophy, FaFire, FaRegCalendarCheck, FaRegStar, FaStar } from 'react-icons/fa';
import './progress.styles.scss';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    Filler
);

const Progress = () => {
    const { user } = useUserAuthContext();
    const [userProgress, setUserProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        const userProgressRef = ref(realtimeDb, `userProgress/${user.uid}`);
        onValue(userProgressRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const progressArray = Object.keys(data).map(key => ({
                    videoId: key,
                    ...data[key]
                }));
                setUserProgress(progressArray);
            } else {
                setUserProgress([]);
            }
            setLoading(false);
        });
    }, [user]);
    
    const analytics = useMemo(() => {
        if (!userProgress.length) return null;
        
        // Calculate total stats
        const totalVideos = userProgress.length;
        const videosCompleted = userProgress.filter(video => video.completed).length;
        const completionRate = totalVideos ? Math.round((videosCompleted / totalVideos) * 100) : 0;
        const totalWatchTime = userProgress.reduce((acc, video) => acc + (video.totalWatchTime || 0), 0);
        const totalWatchSessions = userProgress.reduce((acc, video) => acc + (video.watchSessions || 0), 0);
        
        // Calculate watch streak
        const watchDates = userProgress
            .flatMap(video => [video.lastWatched])
            .filter(Boolean)
            .map(timestamp => {
                const date = new Date(timestamp);
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            })
            .sort()
            .filter((date, index, self) => self.indexOf(date) === index);
        
        // Recent activity
        const recentActivity = [...userProgress]
            .sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0))
            .slice(0, 5);
        
        // Earned badges
        const badges = [
            {
                id: 'first_watch',
                name: 'First Steps',
                icon: <FaVideo />,
                description: 'Started watching your first video',
                earned: totalVideos > 0,
                progress: totalVideos > 0 ? 100 : 0
            },
            {
                id: 'completion_bronze',
                name: 'Bronze Viewer',
                icon: <FaTrophy className="bronze" />,
                description: 'Complete 3 videos',
                earned: videosCompleted >= 3,
                progress: Math.min(Math.round((videosCompleted / 3) * 100), 100)
            },
            {
                id: 'completion_silver',
                name: 'Silver Viewer',
                icon: <FaTrophy className="silver" />,
                description: 'Complete 10 videos',
                earned: videosCompleted >= 10,
                progress: Math.min(Math.round((videosCompleted / 10) * 100), 100)
            },
            {
                id: 'completion_gold',
                name: 'Gold Viewer',
                icon: <FaTrophy className="gold" />,
                description: 'Complete 25 videos',
                earned: videosCompleted >= 25,
                progress: Math.min(Math.round((videosCompleted / 25) * 100), 100)
            },
            {
                id: 'time_bronze',
                name: 'Learning Enthusiast',
                icon: <FaClock />,
                description: 'Watch for at least 1 hour',
                earned: totalWatchTime >= 3600,
                progress: Math.min(Math.round((totalWatchTime / 3600) * 100), 100)
            },
            {
                id: 'time_silver',
                name: 'Dedicated Student',
                icon: <FaClock />,
                description: 'Watch for at least 5 hours',
                earned: totalWatchTime >= 18000,
                progress: Math.min(Math.round((totalWatchTime / 18000) * 100), 100)
            },
            {
                id: 'time_gold',
                name: 'Learning Master',
                icon: <FaClock />,
                description: 'Watch for at least 10 hours',
                earned: totalWatchTime >= 36000,
                progress: Math.min(Math.round((totalWatchTime / 36000) * 100), 100)
            },
            {
                id: 'streak_bronze',
                name: 'Learning Streak',
                icon: <FaFire />,
                description: 'Watch videos on 5 different days',
                earned: watchDates.length >= 5,
                progress: Math.min(Math.round((watchDates.length / 5) * 100), 100)
            },
            {
                id: 'engaged_learner',
                name: 'Engaged Learner',
                icon: <FaRegCalendarCheck />,
                description: 'More than 20 watch sessions across videos',
                earned: totalWatchSessions >= 20,
                progress: Math.min(Math.round((totalWatchSessions / 20) * 100), 100)
            }
        ];
        
        return {
            totalVideos,
            videosCompleted,
            completionRate,
            totalWatchTime,
            watchDates,
            recentActivity,
            badges: badges.sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0))
        };
    }, [userProgress]);
    
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hrs ? `${hrs}h ` : ''}${mins ? `${mins}m ` : ''}${secs}s`;
    };
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown date';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const generateChartData = useMemo(() => {
        if (!analytics) return null;
        
        // Get the last 7 days for time trend
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            last7Days.push(dateStr);
        }
        
        // Generate data for daily watch time
        const watchTimeByDay = new Array(7).fill(0);
        
        userProgress.forEach(video => {
            if (video.lastWatched) {
                const watchDate = new Date(video.lastWatched);
                const dayDiff = Math.floor((today - watchDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff >= 0 && dayDiff < 7) {
                    watchTimeByDay[6 - dayDiff] += video.totalWatchTime || 0;
                }
            }
        });
        
        // Convert seconds to minutes for display
        const watchTimeInMinutes = watchTimeByDay.map(seconds => Math.round(seconds / 60));
        
        // Video completion data
        const completionData = {
            labels: ['Completed', 'In Progress'],
            datasets: [
                {
                    data: [analytics.videosCompleted, analytics.totalVideos - analytics.videosCompleted],
                    backgroundColor: ['#4caf50', '#f0f0f0'],
                    borderColor: ['#4caf50', '#e0e0e0'],
                    borderWidth: 1,
                },
            ],
        };
        
        // Watch time trend
        const watchTimeTrend = {
            labels: last7Days,
            datasets: [
                {
                    label: 'Watch Time (minutes)',
                    data: watchTimeInMinutes,
                    backgroundColor: 'rgba(74, 108, 247, 0.2)',
                    borderColor: '#4a6cf7',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
        
        return {
            completionData,
            watchTimeTrend,
        };
    }, [analytics, userProgress]);
    
    if (loading) {
        return (
            <div className="progress-div loading">
                <div className="loader"></div>
                <p>Loading your progress...</p>
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="progress-div not-signed-in">
                <h2>Progress Tracking</h2>
                <p>Please sign in to track your progress.</p>
            </div>
        );
    }
    
    if (!analytics) {
        return (
            <div className="progress-div empty">
                <h2>No Progress Yet</h2>
                <p>Start watching videos to track your progress.</p>
            </div>
        );
    }
    
    return (
        <div className="progress-div animate__animated animate__fadeInDown">
            <h2>Your Learning Progress</h2>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><FaVideo /></div>
                    <div className="stat-content">
                        <h3>Videos Watched</h3>
                        <div className="stat-value">{analytics.totalVideos}</div>
                        <div className="stat-detail">{analytics.videosCompleted} completed</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon"><FaClock /></div>
                    <div className="stat-content">
                        <h3>Watch Time</h3>
                        <div className="stat-value">{formatTime(analytics.totalWatchTime)}</div>
                        <div className="stat-detail">Across all videos</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon"><FaRegCalendarCheck /></div>
                    <div className="stat-content">
                        <h3>Active Days</h3>
                        <div className="stat-value">{analytics.watchDates.length}</div>
                        <div className="stat-detail">Days of learning</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon"><FaTrophy /></div>
                    <div className="stat-content">
                        <h3>Completion Rate</h3>
                        <div className="stat-value">{analytics.completionRate}%</div>
                        <div className="stat-detail">Of started videos</div>
                    </div>
                </div>
            </div>
            
            <div className="progress-sections">
                <div className="badges-section">
                    <h3>Earned Badges</h3>
                    <div className="badges-grid">
                        {analytics.badges.map(badge => (
                            <div key={badge.id} className={`badge-card ${badge.earned ? 'earned' : ''}`}>
                                <div className="badge-icon">
                                    {badge.icon}
                                    {badge.earned && <div className="badge-earned-indicator"><FaStar /></div>}
                                </div>
                                <div className="badge-content">
                                    <h4>{badge.name}</h4>
                                    <p>{badge.description}</p>
                                    <div className="badge-progress-bar">
                                        <div 
                                            className="badge-progress" 
                                            style={{ width: `${badge.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="badge-progress-text">
                                        {badge.earned ? 'Complete!' : `${badge.progress}% complete`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {analytics.recentActivity.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon">
                                    <FaVideo />
                                    {activity.completed && <div className="completed-indicator"></div>}
                                </div>
                                <div className="activity-content">
                                    <h4>{activity.videoName || 'Unknown Video'}</h4>
                                    <div className="activity-meta">
                                        <span><FaClock /> {formatTime(activity.totalWatchTime || 0)}</span>
                                        <span>Last watched: {formatDate(activity.lastWatched)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {generateChartData && (
                <div className="charts-section">
                    <div className="chart-container">
                        <h3>Daily Watch Time</h3>
                        {generateChartData ? (
                            <Line 
                                data={generateChartData.watchTimeTrend} 
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        tooltip: {
                                            mode: 'index',
                                            intersect: false,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Minutes',
                                            },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="chart-placeholder">Not enough data to display chart</div>
                        )}
                    </div>
                    
                    <div className="chart-container">
                        <h3>Video Completion</h3>
                        {generateChartData ? (
                            <div style={{ maxHeight: '250px', display: 'flex', justifyContent: 'center' }}>
                                <Doughnut 
                                    data={generateChartData.completionData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const label = context.label || '';
                                                        const value = context.raw || 0;
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = Math.round((value / total) * 100);
                                                        return `${label}: ${value} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        },
                                        cutout: '70%',
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="chart-placeholder">Not enough data to display chart</div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="watch-history">
                <h3>All Video Progress</h3>
                <div className="history-list">
                    {userProgress
                        .sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0))
                        .map((video, index) => (
                            <div key={index} className={`history-item ${video.completed ? 'completed' : ''}`}>
                                <div className="history-status">
                                    {video.completed ? <FaStar className="completed-star" /> : <FaRegStar />}
                                </div>
                                <div className="history-content">
                                    <h4>{video.videoName || 'Unknown Video'}</h4>
                                    <div className="history-meta">
                                        <span><FaClock /> {formatTime(video.totalWatchTime || 0)}</span>
                                        <span>{video.watchSessions || 0} sessions</span>
                                    </div>
                                    <div className="history-dates">
                                        <div>First watched: {formatDate(video.firstWatched)}</div>
                                        <div>Last watched: {formatDate(video.lastWatched)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Progress;