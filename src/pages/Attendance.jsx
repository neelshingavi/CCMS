import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useWallet } from '../context/WalletContext';
import { PageContainer } from '../ui/layouts/PageContainer';
import { Text } from '../ui/primitives/Text';
import { Stack } from '../ui/primitives/Stack';
import { Button } from '../ui/components/Button';
import { Card, CardBody, CardHeader, CardFooter } from '../ui/components/Card';
import { Badge } from '../ui/components/Badge';
import { Icon } from '../ui/components/Icon';
import './Attendance.css';

export default function Attendance() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { walletAddress, isConnected } = useWallet();

    const [event, setEvent] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, loading, marking, success, error
    const [logs, setLogs] = useState([]);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, type, timestamp }]);
    };

    const fetchEvent = async () => {
        try {
            setStatus('loading');
            const res = await api.get('/events');
            const found = res.data.find(e => e.eventId === eventId);
            if (found) {
                setEvent(found);
                addLog('Event loaded successfully', 'success');
            } else {
                addLog('Event not found', 'error');
            }
            setStatus('idle');
        } catch (error) {
            addLog('Failed to load event: ' + error.message, 'error');
            setStatus('error');
        }
    };

    const handleMarkAttendance = async () => {
        if (!isConnected) {
            addLog('Please connect your wallet first', 'error');
            return;
        }

        setStatus('marking');
        addLog('Initiating attendance marking...');

        try {
            addLog('Preparing cryptographic payload...');
            await new Promise(r => setTimeout(r, 500));

            addLog('Signing with wallet (simulated)...');
            await new Promise(r => setTimeout(r, 500));

            addLog('Submitting to backend...');
            const res = await api.post('/attendance/mark', {
                eventId: event.eventId,
                walletAddress,
                timestamp: Date.now(),
            });

            addLog('Attendance confirmed!', 'success');
            addLog(`Transaction ID: ${res.data.txnId}`, 'success');

            setResult(res.data);
            setStatus('success');
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            addLog(`Error: ${errorMsg}`, 'error');
            setStatus('error');
        }
    };

    if (!isConnected) {
        return (
            <PageContainer title="Mark Attendance">
                <Card variant="outlined" padding="8">
                    <CardBody>
                        <Stack direction="vertical" gap="5" align="center">
                            <div className="attendance__empty-icon">
                                <Icon name="wallet" size="xl" />
                            </div>
                            <Text as="h2" variant="h3" align="center">
                                Connect Your Wallet
                            </Text>
                            <Text variant="body" color="secondary" align="center">
                                You need to connect your Algorand wallet to mark attendance.
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Mark Attendance"
            subtitle={event ? `For: ${event.title}` : 'Loading event...'}
        >
            <div className="attendance__layout">
                {/* Main Card */}
                <Card variant="elevated" className="attendance__main">
                    <CardHeader>
                        <Stack direction="horizontal" align="center" justify="between">
                            <Stack direction="horizontal" gap="3" align="center">
                                <div className="attendance__event-icon">
                                    <Icon name="event" size="lg" />
                                </div>
                                <div>
                                    <Text variant="h4">{event?.title || 'Loading...'}</Text>
                                    <Text variant="caption" color="tertiary" className="attendance__event-id">
                                        {eventId}
                                    </Text>
                                </div>
                            </Stack>
                            {event && (
                                <Badge
                                    variant={event.status === 'ACTIVE' ? 'success' : 'default'}
                                >
                                    {event.status}
                                </Badge>
                            )}
                        </Stack>
                    </CardHeader>

                    <CardBody>
                        <Stack direction="vertical" gap="5">
                            {/* Status Display */}
                            <div className="attendance__status">
                                {status === 'success' ? (
                                    <div className="attendance__status-success">
                                        <Icon name="checkCircle" size="xl" color="success" />
                                        <Text variant="h4" color="success">Attendance Marked!</Text>
                                        <Text variant="body-sm" color="secondary">
                                            Your attendance has been recorded on-chain.
                                        </Text>
                                    </div>
                                ) : (
                                    <div className="attendance__status-pending">
                                        <Icon name="user" size="xl" />
                                        <Text variant="body" color="secondary">
                                            Ready to mark attendance
                                        </Text>
                                    </div>
                                )}
                            </div>

                            {/* Result Details */}
                            {result && (
                                <Card variant="filled" padding="4" className="attendance__result">
                                    <CardBody>
                                        <Stack direction="vertical" gap="3">
                                            <div className="attendance__result-row">
                                                <Text variant="caption" color="tertiary">Attendance ID</Text>
                                                <Text variant="mono">{result.attendanceId}</Text>
                                            </div>
                                            <div className="attendance__result-row">
                                                <Text variant="caption" color="tertiary">Transaction ID</Text>
                                                <Text variant="mono">{result.txnId}</Text>
                                            </div>
                                            {result.explorerUrl && (
                                                <a
                                                    href={result.explorerUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="attendance__explorer-link"
                                                >
                                                    <Icon name="externalLink" size="sm" />
                                                    View on Explorer
                                                </a>
                                            )}
                                        </Stack>
                                    </CardBody>
                                </Card>
                            )}
                        </Stack>
                    </CardBody>

                    <CardFooter>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/student')}
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleMarkAttendance}
                            loading={status === 'marking'}
                            disabled={status === 'success'}
                            leftIcon={<Icon name="check" size="sm" />}
                        >
                            {status === 'success' ? 'Marked' : 'Mark Attendance'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Activity Log */}
                <Card variant="outlined" className="attendance__log">
                    <CardHeader>
                        <Text variant="h5">Activity Log</Text>
                    </CardHeader>
                    <CardBody>
                        <div className="attendance__log-entries">
                            {logs.length === 0 ? (
                                <Text variant="body-sm" color="tertiary">
                                    Waiting for action...
                                </Text>
                            ) : (
                                logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`attendance__log-entry attendance__log-entry--${log.type}`}
                                    >
                                        <span className="attendance__log-time">{log.timestamp}</span>
                                        <span className="attendance__log-message">{log.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </PageContainer>
    );
}
