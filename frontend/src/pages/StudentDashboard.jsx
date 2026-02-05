import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useWallet } from '../context/WalletContext';
import { PageContainer, Section } from '../ui/layouts/PageContainer';
import { Text } from '../ui/primitives/Text';
import { Stack } from '../ui/primitives/Stack';
import { Button } from '../ui/components/Button';
import { Card, CardBody } from '../ui/components/Card';
import { Badge } from '../ui/components/Badge';
import { Icon } from '../ui/components/Icon';
import { EventCard } from '../ui/patterns/EventCard';
import './StudentDashboard.css';

export default function StudentDashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isConnected, walletAddress } = useWallet();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendance = (eventId) => {
        navigate(`/attendance/${eventId}`);
    };

    const handleFeedback = (eventId) => {
        navigate(`/feedback/${eventId}`);
    };

    const handleEligibility = async (eventId) => {
        if (!walletAddress) {
            alert('Please connect your wallet first');
            return;
        }
        navigate(`/certificates?check=${eventId}`);
    };

    const activeEvents = events.filter(e => e.status === 'ACTIVE');
    const upcomingEvents = events.filter(e => e.status === 'UPCOMING');

    if (!isConnected) {
        return (
            <div className="student-dashboard__empty">
                <Card variant="outlined" padding="8" className="student-dashboard__connect-card">
                    <CardBody>
                        <Stack direction="vertical" gap="5" align="center">
                            <div className="student-dashboard__empty-icon">
                                <Icon name="wallet" size="xl" />
                            </div>
                            <Text as="h2" variant="h3" align="center">
                                Connect Your Wallet
                            </Text>
                            <Text variant="body" color="secondary" align="center">
                                Connect your Algorand wallet to view events and mark attendance.
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <PageContainer
            title="Student Dashboard"
            subtitle="View events, mark attendance, and earn certificates"
        >
            {/* Quick Stats */}
            <div className="student-dashboard__stats">
                <Card variant="filled" className="stat-card">
                    <CardBody>
                        <Stack direction="horizontal" align="center" justify="between">
                            <div>
                                <Text variant="caption" color="tertiary">Active Events</Text>
                                <Text variant="h3">{activeEvents.length}</Text>
                            </div>
                            <div className="stat-card__icon stat-card__icon--primary">
                                <Icon name="event" size="lg" />
                            </div>
                        </Stack>
                    </CardBody>
                </Card>

                <Card variant="filled" className="stat-card">
                    <CardBody>
                        <Stack direction="horizontal" align="center" justify="between">
                            <div>
                                <Text variant="caption" color="tertiary">Upcoming</Text>
                                <Text variant="h3">{upcomingEvents.length}</Text>
                            </div>
                            <div className="stat-card__icon stat-card__icon--accent">
                                <Icon name="calendar" size="lg" />
                            </div>
                        </Stack>
                    </CardBody>
                </Card>

                <Card variant="filled" className="stat-card">
                    <CardBody>
                        <Stack direction="horizontal" align="center" justify="between">
                            <div>
                                <Text variant="caption" color="tertiary">Wallet</Text>
                                <Text variant="mono" className="wallet-display">
                                    {walletAddress?.slice(0, 8)}...
                                </Text>
                            </div>
                            <Badge variant="success" dot pulse />
                        </Stack>
                    </CardBody>
                </Card>
            </div>

            {/* Active Events */}
            <Section
                title="Active Events"
                subtitle="Currently running events you can participate in"
            >
                {loading ? (
                    <Card variant="outlined" padding="8">
                        <CardBody>
                            <Stack direction="horizontal" gap="3" align="center" justify="center">
                                <Icon name="spinner" size="md" />
                                <Text color="secondary">Loading events...</Text>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : error ? (
                    <Card variant="outlined" padding="6">
                        <CardBody>
                            <Stack direction="vertical" gap="4" align="center">
                                <Icon name="error" size="lg" color="error" />
                                <Text color="error">{error}</Text>
                                <Button variant="secondary" size="sm" onClick={fetchEvents}>
                                    Try Again
                                </Button>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : activeEvents.length === 0 ? (
                    <Card variant="outlined" padding="8" className="empty-state">
                        <CardBody>
                            <Stack direction="vertical" gap="4" align="center">
                                <div className="empty-state__icon">
                                    <Icon name="calendar" size="xl" />
                                </div>
                                <Text variant="h4" color="secondary">No Active Events</Text>
                                <Text variant="body-sm" color="tertiary" align="center">
                                    There are no active events at the moment. Check back later!
                                </Text>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="student-dashboard__events-grid">
                        {activeEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onAttendance={handleAttendance}
                                onFeedback={handleFeedback}
                                onEligibility={handleEligibility}
                            />
                        ))}
                    </div>
                )}
            </Section>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <Section
                    title="Upcoming Events"
                    subtitle="Events scheduled for the future"
                >
                    <div className="student-dashboard__events-grid">
                        {upcomingEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                compact
                            />
                        ))}
                    </div>
                </Section>
            )}
        </PageContainer>
    );
}
