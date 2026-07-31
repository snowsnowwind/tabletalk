import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Server, Database, Activity } from 'lucide-react';
import apiService from '../services/api';
import './StatusIndicator.css';

export default function StatusIndicator() {
    const [status, setStatus] = useState({
        backend: 'checking', // checking, connected, disconnected
        database: 'unknown',
        ai: 'unknown',
        latency: 0
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        const start = Date.now();
        try {
            // Call a lightweight endpoint - using 127.0.0.1 for better reliability
            const response = await fetch('http://127.0.0.1:8570/health');
            const latency = Date.now() - start;

            if (response.ok) {
                // Also check AI status endpoint if available
                try {
                    const aiStatus = await apiService.getAIStatus();
                    setStatus({
                        backend: 'connected',
                        database: 'connected',
                        ai: aiStatus.ai_configured ? 'configured' : 'disconnected',
                        latency
                    });
                } catch (e) {
                    console.warn("AI Status check failed:", e);
                    setStatus({
                        backend: 'connected',
                        database: 'connected',
                        ai: 'unknown',
                        latency
                    });
                }
            } else {
                console.error("Health check returned non-OK:", response.status);
                throw new Error('Backend error');
            }
        } catch (error) {
            console.error("System Status check failed:", error);
            setStatus({
                backend: 'disconnected',
                database: 'disconnected',
                ai: 'disconnected',
                latency: 0
            });
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'connected': return '#10b981'; // Green
            case 'configured': return '#3b82f6'; // Blue
            case 'checking': return '#f59e0b'; // Orange
            case 'disconnected': return '#ef4444'; // Red
            default: return '#9ca3af'; // Gray
        }
    };

    return (
        <div className="status-indicator-container">
            <div className={`status-indicator ${isOpen ? 'open' : ''}`}>
                <button
                    className="status-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    title="System Status"
                >
                    {status.backend === 'connected' ? (
                        <Activity size={18} color="#10b981" />
                    ) : (
                        <WifiOff size={18} color="#ef4444" />
                    )}
                    <span className="status-label">
                        {status.backend === 'connected' ? 'System Online' : 'System Offline'}
                    </span>
                    {status.backend === 'connected' && (
                        <span className="latency-badge">{status.latency}ms</span>
                    )}
                </button>

                {isOpen && (
                    <div className="status-details">
                        <div className="status-header">
                            <h4>System Health</h4>
                            <button className="refresh-btn" onClick={checkStatus}>Refresh</button>
                        </div>

                        <div className="status-row">
                            <div className="status-icon">
                                <Server size={16} color={getStatusColor(status.backend)} />
                            </div>
                            <span className="status-name">Backend API</span>
                            <span className="status-value" style={{ color: getStatusColor(status.backend) }}>
                                {status.backend.toUpperCase()}
                            </span>
                        </div>

                        <div className="status-row">
                            <div className="status-icon">
                                <Database size={16} color={getStatusColor(status.database)} />
                            </div>
                            <span className="status-name">PostgreSQL DB</span>
                            <span className="status-value" style={{ color: getStatusColor(status.database) }}>
                                {status.database.toUpperCase()}
                            </span>
                        </div>

                        <div className="status-row">
                            <div className="status-icon">
                                <Wifi size={16} color={getStatusColor(status.ai)} />
                            </div>
                            <span className="status-name">OpenCode Go</span>
                            <span className="status-value" style={{ color: getStatusColor(status.ai) }}>
                                {status.ai === 'configured' ? 'CONFIGURED' : status.ai.toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
