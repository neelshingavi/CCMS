const Sentiment = require('sentiment');
const sentiment = new Sentiment();

class AIService {
    analyzeSentiment(text) {
        const result = sentiment.analyze(text);
        let sentimentLabel = 'neutral';
        if (result.score > 0) sentimentLabel = 'positive';
        if (result.score < 0) sentimentLabel = 'negative';

        return {
            sentiment: sentimentLabel,
            score: result.score,
            comparative: result.comparative
        };
    }

    detectAttendanceAnomaly(attendanceData) {
        // Placeholder for anomaly detection logic
        // e.g., checking for clustering of timestamps
        return { flagged: false, reason: null };
    }
}

module.exports = new AIService();
