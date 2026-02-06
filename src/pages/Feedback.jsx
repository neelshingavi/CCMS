import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useWallet } from '../context/WalletContext';
import { PageContainer } from '../ui/layouts/PageContainer';
import { Text } from '../ui/primitives/Text';
import { Stack } from '../ui/primitives/Stack';
import { Button } from '../ui/components/Button';
import { Card, CardBody, CardHeader, CardFooter } from '../ui/components/Card';
import { Input } from '../ui/components/Input';
import { Icon } from '../ui/components/Icon';
import { Badge } from '../ui/components/Badge';
import './Feedback.css';

export default function Feedback() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { walletAddress, isConnected } = useWallet();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events');
            const found = res.data.find(e => e.eventId === eventId);
            if (found) {
                setEvent(found);
            }
        } catch (error) {
            console.error('Error fetching event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!walletAddress) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/feedback/submit', {
                eventId,
                walletAddress,
                content: feedback,
                rating,
                anonymous: true
            });
            setSubmitted(true);
        } catch (error) {
            alert('Failed to submit feedback: ' + (error.response?.data?.error || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isConnected) {
        return (
            <PageContainer title="Provide Feedback">
                <Card variant="outlined" padding="8">
                    <CardBody>
                        <Stack direction="vertical" gap="5" align="center">
                            <div className="feedback__empty-icon">
                                <Icon name="wallet" size="xl" />
                            </div>
                            <Text as="h2" variant="h3" align="center">
                                Connect Your Wallet
                            </Text>
                            <Text variant="body" color="secondary" align="center">
                                Your feedback is anonymous, but we need your wallet to verify you attended.
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Provide Feedback"
            subtitle={event ? `For: ${event.title}` : 'Loading event...'}
        >
            <div className="feedback__container">
                {submitted ? (
                    <Card variant="elevated" padding="8" className="feedback__success">
                        <CardBody>
                            <Stack direction="vertical" gap="5" align="center">
                                <div className="feedback__success-icon">
                                    <Icon name="checkCircle" size="xl" />
                                </div>
                                <Text as="h2" variant="h3" color="success">
                                    Feedback Submitted!
                                </Text>
                                <Text variant="body" color="secondary" align="center">
                                    Thank you for your feedback. Hash: {Math.random().toString(36).substr(2, 12)}
                                </Text>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/student')}
                                    leftIcon={<Icon name="arrowRight" size="sm" />}
                                >
                                    Return to Dashboard
                                </Button>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : (
                    <Card variant="elevated">
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <Stack direction="vertical" gap="2">
                                    <Text variant="h4">Your Feedback</Text>
                                    <Text variant="body-sm" color="secondary">
                                        Your response is cryptographically anonymized.
                                    </Text>
                                </Stack>
                            </CardHeader>

                            <CardBody>
                                <Stack direction="vertical" gap="6">
                                    {/* Rating */}
                                    <div className="feedback__rating">
                                        <Text variant="label">Rating</Text>
                                        <div className="feedback__stars">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    className={`feedback__star ${rating >= star ? 'feedback__star--active' : ''}`}
                                                    onClick={() => setRating(star)}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Feedback Text */}
                                    <div className="feedback__input-group">
                                        <label className="input__label">Comments</label>
                                        <textarea
                                            className="feedback__textarea"
                                            rows="5"
                                            placeholder="Share your thoughts..."
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="feedback__privacy-notice">
                                        <Icon name="info" size="sm" color="tertiary" />
                                        <Text variant="caption" color="tertiary">
                                            This feedback will be hashed and cannot be traced back to your wallet address.
                                        </Text>
                                    </div>
                                </Stack>
                            </CardBody>

                            <CardFooter>
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => navigate('/student')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    loading={submitting}
                                    disabled={!rating || !feedback}
                                    leftIcon={<Icon name="feedback" size="sm" />}
                                >
                                    Submit Feedback
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}
            </div>
        </PageContainer>
    );
}
