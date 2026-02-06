import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Text } from '../ui/primitives/Text';
import { Stack } from '../ui/primitives/Stack';
import { Button } from '../ui/components/Button';
import { Card, CardBody } from '../ui/components/Card';
import { Icon } from '../ui/components/Icon';
import './Landing.css';

export default function Landing() {
    const { isConnected, connectWallet } = useWallet();

    const features = [
        {
            icon: 'checkCircle',
            title: 'Verified Attendance',
            description: 'Cryptographically secure attendance marking with wallet signatures. No proxies, no fraud.',
        },
        {
            icon: 'vote',
            title: 'Anonymous Voting',
            description: 'Cast your vote with commit-reveal cryptography. Your choice stays private.',
        },
        {
            icon: 'certificate',
            title: 'NFT Certificates',
            description: 'Earn verifiable credentials as Algorand Standard Assets. Own your achievements.',
        },
        {
            icon: 'feedback',
            title: 'Private Feedback',
            description: 'Submit anonymous feedback with AI sentiment analysis. Your voice matters.',
        },
    ];

    const stats = [
        { value: '100%', label: 'Verifiable' },
        { value: '0%', label: 'Fraud' },
        { value: '<1s', label: 'Confirmation' },
        { value: '∞', label: 'Transparency' },
    ];

    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="landing__hero">
                <div className="landing__hero-content">
                    <div className="landing__hero-badge">
                        <Icon name="blockchain" size="sm" />
                        <Text variant="caption">Powered by Algorand</Text>
                    </div>

                    <Text as="h1" variant="display" className="landing__title">
                        Campus Management,
                        <span className="landing__title-gradient"> Reimagined.</span>
                    </Text>

                    <Text variant="body" color="secondary" className="landing__subtitle">
                        Replace trust with verification. Handle attendance, voting, feedback,
                        and certificates with cryptographic security and complete privacy.
                    </Text>

                    <div className="landing__hero-actions">
                        {isConnected ? (
                            <>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    rightIcon={<Icon name="arrowRight" size="md" />}
                                    as={Link}
                                    to="/student"
                                >
                                    Go to Dashboard
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    as={Link}
                                    to="/organizer"
                                >
                                    Organizer Portal
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                size="lg"
                                leftIcon={<Icon name="wallet" size="md" />}
                                onClick={connectWallet}
                            >
                                Connect Wallet to Start
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="landing__stats">
                    {stats.map((stat, index) => (
                        <div key={index} className="landing__stat">
                            <Text variant="h2" color="brand" className="landing__stat-value">
                                {stat.value}
                            </Text>
                            <Text variant="caption" color="tertiary">
                                {stat.label}
                            </Text>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="landing__features">
                <div className="landing__section-header">
                    <Text as="h2" variant="h2">
                        Everything you need, on-chain.
                    </Text>
                    <Text variant="body" color="secondary">
                        A complete campus management system with blockchain verification at its core.
                    </Text>
                </div>

                <div className="landing__feature-grid">
                    {features.map((feature, index) => (
                        <Card key={index} variant="outlined" className="landing__feature-card">
                            <CardBody>
                                <div className="landing__feature-icon">
                                    <Icon name={feature.icon} size="lg" />
                                </div>
                                <Text as="h3" variant="h4" className="landing__feature-title">
                                    {feature.title}
                                </Text>
                                <Text variant="body-sm" color="secondary">
                                    {feature.description}
                                </Text>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing__cta">
                <Card variant="filled" className="landing__cta-card">
                    <CardBody>
                        <Stack direction="vertical" gap="5" align="center">
                            <Text as="h2" variant="h3" align="center">
                                Ready to get started?
                            </Text>
                            <Text variant="body" color="secondary" align="center">
                                Connect your Algorand wallet and join the future of campus management.
                            </Text>
                            {!isConnected && (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    leftIcon={<Icon name="wallet" size="md" />}
                                    onClick={connectWallet}
                                >
                                    Connect Wallet
                                </Button>
                            )}
                        </Stack>
                    </CardBody>
                </Card>
            </section>

            {/* Footer */}
            <footer className="landing__footer">
                <div className="landing__footer-content">
                    <div className="landing__footer-brand">
                        <div className="landing__footer-logo">
                            <Icon name="blockchain" size="md" />
                        </div>
                        <Text variant="h5">CCMS</Text>
                    </div>
                    <Text variant="caption" color="tertiary">
                        Built on Algorand TestNet • Secured by PyTeal Smart Contracts
                    </Text>
                </div>
            </footer>
        </div>
    );
}
