const HashService = require('../services/hash.service');

describe('HashService', () => {
    describe('hashWallet', () => {
        it('should produce consistent hash for same input', () => {
            const wallet = 'TESTWALLETADDRESS1234567890123456789012345678901234';
            const hash1 = HashService.hashWallet(wallet);
            const hash2 = HashService.hashWallet(wallet);

            expect(hash1).toBe(hash2);
        });

        it('should produce different hashes for different wallets', () => {
            const wallet1 = 'WALLET1ADDRESS12345678901234567890123456789012345678';
            const wallet2 = 'WALLET2ADDRESS12345678901234567890123456789012345678';

            const hash1 = HashService.hashWallet(wallet1);
            const hash2 = HashService.hashWallet(wallet2);

            expect(hash1).not.toBe(hash2);
        });

        it('should produce 64-character hex string', () => {
            const wallet = 'TESTWALLETADDRESS1234567890123456789012345678901234';
            const hash = HashService.hashWallet(wallet);

            expect(hash).toHaveLength(64);
            expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
        });
    });

    describe('createVoteCommitment', () => {
        it('should produce different commitments with different nonces', () => {
            const choice = 'option1';
            const wallet = 'TESTWALLETADDRESS1234567890123456789012345678901234';

            const commitment1 = HashService.createVoteCommitment(choice, wallet, 'nonce1');
            const commitment2 = HashService.createVoteCommitment(choice, wallet, 'nonce2');

            expect(commitment1).not.toBe(commitment2);
        });

        it('should be deterministic with same inputs', () => {
            const choice = 'option1';
            const wallet = 'TESTWALLETADDRESS1234567890123456789012345678901234';
            const nonce = 'fixed-nonce';

            const commitment1 = HashService.createVoteCommitment(choice, wallet, nonce);
            const commitment2 = HashService.createVoteCommitment(choice, wallet, nonce);

            expect(commitment1).toBe(commitment2);
        });
    });

    describe('verifyHash', () => {
        it('should verify correct hash', () => {
            const original = 'TESTWALLETADDRESS1234567890123456789012345678901234';
            const hash = HashService.hashWallet(original);

            expect(HashService.verifyHash(original, hash)).toBe(true);
        });

        it('should reject incorrect hash', () => {
            const original = 'TESTWALLETADDRESS1234567890123456789012345678901234';
            const wrongHash = 'wronghash1234567890123456789012345678901234567890123456789012';

            expect(HashService.verifyHash(original, wrongHash)).toBe(false);
        });
    });
});
