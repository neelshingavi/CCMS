import { useParams } from 'react-router-dom';
import { PageContainer } from '../ui/layouts/PageContainer';
import { Text } from '../ui/primitives/Text';
import { Stack } from '../ui/primitives/Stack';
import { Card, CardBody } from '../ui/components/Card';
import { Icon } from '../ui/components/Icon';
import { Badge } from '../ui/components/Badge';
import './Voting.css';

export default function Voting() {
    const { electionId } = useParams();

    return (
        <PageContainer
            title="Voting"
            subtitle="Cast your vote anonymously using commit-reveal cryptography"
        >
            <Card variant="outlined" padding="8" className="coming-soon">
                <CardBody>
                    <Stack direction="vertical" gap="5" align="center">
                        <div className="coming-soon__icon">
                            <Icon name="vote" size="xl" />
                        </div>
                        <Badge variant="primary" size="lg">Coming Soon</Badge>
                        <Text as="h2" variant="h3" align="center">
                            Anonymous Voting
                        </Text>
                        <Text variant="body" color="secondary" align="center" className="coming-soon__text">
                            Cast your vote with complete privacy using commit-reveal cryptography.
                            Your choice stays anonymous until the reveal phase.
                        </Text>

                        <div className="coming-soon__features">
                            <div className="coming-soon__feature">
                                <Icon name="checkCircle" size="sm" color="success" />
                                <Text variant="body-sm">Commit-Reveal Protocol</Text>
                            </div>
                            <div className="coming-soon__feature">
                                <Icon name="checkCircle" size="sm" color="success" />
                                <Text variant="body-sm">Anonymous Voting</Text>
                            </div>
                            <div className="coming-soon__feature">
                                <Icon name="checkCircle" size="sm" color="success" />
                                <Text variant="body-sm">On-Chain Verification</Text>
                            </div>
                        </div>
                    </Stack>
                </CardBody>
            </Card>
        </PageContainer>
    );
}
