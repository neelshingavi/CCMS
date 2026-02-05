import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { useWallet } from '../context/WalletContext';
import { PageContainer, Section } from '../ui/layouts/PageContainer';
import { Text } from '../ui/primitives/Text';
import { Stack } from '../ui/primitives/Stack';
import { Button } from '../ui/components/Button';
import { Card, CardBody } from '../ui/components/Card';
import { Badge } from '../ui/components/Badge';
import { Icon } from '../ui/components/Icon';
import './Certificates.css';

export default function Certificates() {
    const { walletAddress, isConnected } = useWallet();
    const [searchParams] = useSearchParams();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState(null);
    const [issuing, setIssuing] = useState(false);

    const checkEventId = searchParams.get('check');

    useEffect(() => {
        if (isConnected && walletAddress) {
            fetchCertificates();
            if (checkEventId) {
                checkEligibility(checkEventId);
            }
        }
    }, [isConnected, walletAddress, checkEventId]);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/certificates/my/${walletAddress}`);
            setCertificates(res.data);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkEligibility = async (eventId) => {
        try {
            const res = await api.get(`/certificates/eligibility/${eventId}?walletAddress=${walletAddress}`);
            setEligibility(res.data);
        } catch (error) {
            setEligibility({ eligible: false, reason: error.response?.data?.error || 'Failed to check eligibility' });
        }
    };

    const handleIssueCertificate = async () => {
        if (!eligibility?.eligible) return;

        try {
            setIssuing(true);
            await api.post('/certificates/issue', {
                eventId: checkEventId,
                walletAddress,
            });
            setEligibility({ ...eligibility, alreadyIssued: true });
            fetchCertificates();
        } catch (error) {
            alert('Failed to issue certificate: ' + (error.response?.data?.error || error.message));
        } finally {
            setIssuing(false);
        }
    };

    if (!isConnected) {
        return (
            <PageContainer title="Certificates">
                <Card variant="outlined" padding="8">
                    <CardBody>
                        <Stack direction="vertical" gap="5" align="center">
                            <div className="certificates__empty-icon">
                                <Icon name="certificate" size="xl" />
                            </div>
                            <Text as="h2" variant="h3" align="center">
                                Connect Your Wallet
                            </Text>
                            <Text variant="body" color="secondary" align="center">
                                Connect your Algorand wallet to view your certificates.
                            </Text>
                        </Stack>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="My Certificates"
            subtitle="View and manage your blockchain-verified certificates"
        >
            {/* Eligibility Check (if coming from event) */}
            {checkEventId && eligibility && (
                <Card
                    variant="elevated"
                    className={`eligibility-card ${eligibility.eligible ? 'eligibility-card--eligible' : 'eligibility-card--ineligible'}`}
                >
                    <CardBody>
                        <Stack direction="horizontal" align="center" justify="between" gap="5">
                            <Stack direction="horizontal" gap="4" align="center">
                                <div className={`eligibility-card__icon ${eligibility.eligible ? 'eligibility-card__icon--success' : 'eligibility-card__icon--error'}`}>
                                    <Icon name={eligibility.eligible ? 'checkCircle' : 'error'} size="lg" />
                                </div>
                                <div>
                                    <Text variant="h4">
                                        {eligibility.eligible ? 'You\'re Eligible!' : 'Not Eligible'}
                                    </Text>
                                    <Text variant="body-sm" color="secondary">
                                        {eligibility.eligible
                                            ? 'You can claim your certificate for this event.'
                                            : eligibility.reason || 'Requirements not met.'
                                        }
                                    </Text>
                                </div>
                            </Stack>

                            {eligibility.eligible && !eligibility.alreadyIssued && (
                                <Button
                                    variant="primary"
                                    onClick={handleIssueCertificate}
                                    loading={issuing}
                                    leftIcon={<Icon name="certificate" size="sm" />}
                                >
                                    Claim Certificate
                                </Button>
                            )}

                            {eligibility.alreadyIssued && (
                                <Badge variant="success" size="lg">Already Claimed</Badge>
                            )}
                        </Stack>
                    </CardBody>
                </Card>
            )}

            {/* Certificates Grid */}
            <Section
                title="Earned Certificates"
                subtitle={`${certificates.length} certificate${certificates.length !== 1 ? 's' : ''}`}
            >
                {loading ? (
                    <Card variant="outlined" padding="6">
                        <CardBody>
                            <Stack direction="horizontal" gap="3" align="center" justify="center">
                                <Icon name="spinner" size="md" />
                                <Text color="secondary">Loading certificates...</Text>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : certificates.length === 0 ? (
                    <Card variant="outlined" padding="8" className="empty-state">
                        <CardBody>
                            <Stack direction="vertical" gap="4" align="center">
                                <div className="empty-state__icon">
                                    <Icon name="certificate" size="xl" />
                                </div>
                                <Text variant="h4" color="secondary">No Certificates Yet</Text>
                                <Text variant="body-sm" color="tertiary" align="center">
                                    Attend events and meet the requirements to earn verified certificates.
                                </Text>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="certificates__grid">
                        {certificates.map(cert => (
                            <Card key={cert.id} variant="outlined" className="certificate-card">
                                <CardBody>
                                    <div className="certificate-card__ribbon">
                                        <Icon name="checkCircle" size="sm" />
                                    </div>

                                    <Stack direction="vertical" gap="4">
                                        <div className="certificate-card__badge">
                                            <Icon name="certificate" size="xl" />
                                        </div>

                                        <div className="certificate-card__content">
                                            <Text variant="h4">{cert.Event?.title || 'Certificate'}</Text>
                                            <Text variant="caption" color="tertiary">
                                                Issued {new Date(cert.issuedAt).toLocaleDateString()}
                                            </Text>
                                        </div>

                                        <div className="certificate-card__meta">
                                            <div className="certificate-card__meta-item">
                                                <Text variant="caption" color="tertiary">Certificate ID</Text>
                                                <Text variant="mono" className="certificate-card__hash">
                                                    {cert.certificateHash?.slice(0, 16)}...
                                                </Text>
                                            </div>
                                        </div>

                                        {cert.explorerUrl && (
                                            <a
                                                href={cert.explorerUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="certificate-card__link"
                                            >
                                                <Icon name="externalLink" size="sm" />
                                                View on Blockchain
                                            </a>
                                        )}
                                    </Stack>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </Section>
        </PageContainer>
    );
}
