import './EventCard.css';
import { Card, CardBody } from '../components/Card';
import { Text } from '../primitives/Text';
import { Stack } from '../primitives/Stack';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';

/**
 * EventCard Pattern
 * Displays event information with actions
 */
export function EventCard({
    event,
    onAttendance,
    onFeedback,
    onEligibility,
    compact = false,
    className = '',
}) {
    const {
        title,
        description,
        eventId,
        status = 'ACTIVE',
        startTime,
        endTime,
    } = event;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'UPCOMING': return 'primary';
            case 'ENDED': return 'default';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card
            variant="elevated"
            className={`event-card ${compact ? 'event-card--compact' : ''} ${className}`}
            padding="0"
        >
            <CardBody>
                <div className="event-card__header">
                    <Stack direction="vertical" gap="2">
                        <Text as="h3" variant="h4" color="primary">
                            {title}
                        </Text>
                        <Badge variant={getStatusVariant(status)} size="sm">
                            {status}
                        </Badge>
                    </Stack>
                </div>

                {!compact && description && (
                    <Text variant="body-sm" color="secondary" className="event-card__description">
                        {description}
                    </Text>
                )}

                <div className="event-card__meta">
                    <div className="event-card__meta-item">
                        <Icon name="calendar" size="sm" color="tertiary" />
                        <Text variant="caption" color="tertiary">
                            {formatDate(startTime)}
                        </Text>
                    </div>
                    <div className="event-card__meta-item">
                        <Icon name="clock" size="sm" color="tertiary" />
                        <Text variant="caption" color="tertiary">
                            {formatTime(startTime)} - {formatTime(endTime)}
                        </Text>
                    </div>
                </div>

                <div className="event-card__actions">
                    {onAttendance && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAttendance(eventId)}
                            leftIcon={<Icon name="check" size="sm" />}
                        >
                            Mark Attendance
                        </Button>
                    )}
                    {onFeedback && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onFeedback(eventId)}
                            leftIcon={<Icon name="feedback" size="sm" />}
                        >
                            Feedback
                        </Button>
                    )}
                    {onEligibility && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEligibility(eventId)}
                            leftIcon={<Icon name="certificate" size="sm" />}
                        >
                            Check Eligibility
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default EventCard;
