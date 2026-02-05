import { useState, useEffect } from 'react';
import api from '../config/api';
import { useWallet } from '../context/WalletContext';
import { PageContainer, Section } from '../ui/layouts/PageContainer';
import { Text } from '../ui/primitives/Text';
import { Stack } from '../ui/primitives/Stack';
import { Button } from '../ui/components/Button';
import { Card, CardBody, CardFooter } from '../ui/components/Card';
import { Input } from '../ui/components/Input';
import { Badge } from '../ui/components/Badge';
import { Icon } from '../ui/components/Icon';
import { Modal } from '../ui/components/Modal';
import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
    const { walletAddress, isConnected } = useWallet();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!walletAddress) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            setCreating(true);
            await api.post('/events/demo', {
                ...formData,
                organizerWallet: walletAddress,
            });
            setShowCreateModal(false);
            setFormData({ title: '', description: '', startTime: '', endTime: '' });
            fetchEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event: ' + (error.response?.data?.error || error.message));
        } finally {
            setCreating(false);
        }
    };

    const stats = [
        { label: 'Total Events', value: events.length, icon: 'event', color: 'primary' },
        { label: 'Active', value: events.filter(e => e.status === 'ACTIVE').length, icon: 'checkCircle', color: 'success' },
        { label: 'Upcoming', value: events.filter(e => e.status === 'UPCOMING').length, icon: 'clock', color: 'warning' },
    ];

    if (!isConnected) {
        return (
            <div className="organizer-dashboard__empty">
                <Card variant="outlined" padding="8">
                    <CardBody>
                        <Stack direction="vertical" gap="5" align="center">
                            <div className="organizer-dashboard__empty-icon">
                                <Icon name="wallet" size="xl" />
                            </div>
                            <Text as="h2" variant="h3" align="center">
                                Connect to Manage Events
                            </Text>
                            <Text variant="body" color="secondary" align="center">
                                Connect your Algorand wallet to create and manage events.
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <PageContainer
            title="Organizer Dashboard"
            subtitle="Create and manage campus events"
            actions={
                <Button
                    variant="primary"
                    leftIcon={<Icon name="plus" size="sm" />}
                    onClick={() => setShowCreateModal(true)}
                >
                    Create Event
                </Button>
            }
        >
            {/* Stats */}
            <div className="organizer-dashboard__stats">
                {stats.map((stat, index) => (
                    <Card key={index} variant="filled" className="stat-card">
                        <CardBody>
                            <Stack direction="horizontal" align="center" justify="between">
                                <div>
                                    <Text variant="caption" color="tertiary">{stat.label}</Text>
                                    <Text variant="h3">{stat.value}</Text>
                                </div>
                                <div className={`stat-card__icon stat-card__icon--${stat.color}`}>
                                    <Icon name={stat.icon} size="lg" />
                                </div>
                            </Stack>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Events List */}
            <Section title="Your Events" subtitle="Manage your created events">
                {loading ? (
                    <Card variant="outlined" padding="6">
                        <CardBody>
                            <Stack direction="horizontal" gap="3" align="center" justify="center">
                                <Icon name="spinner" size="md" />
                                <Text color="secondary">Loading events...</Text>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : events.length === 0 ? (
                    <Card variant="outlined" padding="8" className="empty-state">
                        <CardBody>
                            <Stack direction="vertical" gap="5" align="center">
                                <div className="empty-state__icon">
                                    <Icon name="plus" size="xl" />
                                </div>
                                <Text variant="h4" color="secondary">No Events Yet</Text>
                                <Text variant="body-sm" color="tertiary" align="center">
                                    Create your first event to get started with blockchain-verified attendance.
                                </Text>
                                <Button
                                    variant="primary"
                                    leftIcon={<Icon name="plus" size="sm" />}
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Create Your First Event
                                </Button>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="organizer-dashboard__events-table">
                        <div className="events-table__header">
                            <Text variant="label" color="tertiary">Event</Text>
                            <Text variant="label" color="tertiary">Status</Text>
                            <Text variant="label" color="tertiary">Date</Text>
                            <Text variant="label" color="tertiary">Actions</Text>
                        </div>
                        {events.map(event => (
                            <div key={event.id} className="events-table__row">
                                <div className="events-table__cell">
                                    <Text variant="body" weight="medium">{event.title}</Text>
                                    <Text variant="caption" color="tertiary">{event.eventId}</Text>
                                </div>
                                <div className="events-table__cell">
                                    <Badge
                                        variant={event.status === 'ACTIVE' ? 'success' : 'default'}
                                        size="sm"
                                    >
                                        {event.status}
                                    </Badge>
                                </div>
                                <div className="events-table__cell">
                                    <Text variant="body-sm" color="secondary">
                                        {new Date(event.startTime).toLocaleDateString()}
                                    </Text>
                                </div>
                                <div className="events-table__cell events-table__actions">
                                    <Button variant="ghost" size="sm">
                                        <Icon name="users" size="sm" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Icon name="edit" size="sm" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* Create Event Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Event"
                size="md"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateEvent}
                            loading={creating}
                        >
                            Create Event
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleCreateEvent} className="create-event-form">
                    <Stack direction="vertical" gap="5">
                        <Input
                            label="Event Title"
                            placeholder="e.g., Blockchain Workshop"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <Input
                            label="Description"
                            placeholder="Describe your event..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        <Stack direction="horizontal" gap="4">
                            <Input
                                label="Start Time"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />

                            <Input
                                label="End Time"
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </Stack>
                    </Stack>
                </form>
            </Modal>
        </PageContainer>
    );
}
