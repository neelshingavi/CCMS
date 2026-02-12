from algopy import *
from algopy.arc4 import abimethod


class Reputation(ARC4Contract):
    """
    On-Chain Reputation Contract for CCMS.

    Tracks per-user reputation scores derived from four campus activity pillars:
    attendance, voting, feedback quality, and certification achievements.

    Global state holds configurable weights per pillar and a total user counter.
    Local state (per opted-in account) holds individual pillar scores and the
    computed composite reputation score.

    Only the designated admin (contract creator) can update user scores,
    ensuring the backend service account is the single trusted writer.
    """

    # ── Global State ──────────────────────────────────────────────────
    total_users: UInt64
    reputation_weight_attendance: UInt64
    reputation_weight_voting: UInt64
    reputation_weight_feedback: UInt64
    reputation_weight_certification: UInt64
    initialized: UInt64  # 0 = not init, 1 = init

    # ── Local State (per user) ────────────────────────────────────────
    reputation_score: LocalState[UInt64]
    attendance_score: LocalState[UInt64]
    voting_score: LocalState[UInt64]
    feedback_score: LocalState[UInt64]
    certification_score: LocalState[UInt64]

    def __init__(self) -> None:
        self.total_users = UInt64(0)
        self.reputation_weight_attendance = UInt64(0)
        self.reputation_weight_voting = UInt64(0)
        self.reputation_weight_feedback = UInt64(0)
        self.reputation_weight_certification = UInt64(0)
        self.initialized = UInt64(0)
        # Local state declarations
        self.reputation_score = LocalState(UInt64, key="rep_score")
        self.attendance_score = LocalState(UInt64, key="att_score")
        self.voting_score = LocalState(UInt64, key="vot_score")
        self.feedback_score = LocalState(UInt64, key="fdb_score")
        self.certification_score = LocalState(UInt64, key="cer_score")

    # ── Opt-In Handler ────────────────────────────────────────────────
    @abimethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """Allows a user to opt in; initializes their local state to zero."""
        self.reputation_score[Txn.sender] = UInt64(0)
        self.attendance_score[Txn.sender] = UInt64(0)
        self.voting_score[Txn.sender] = UInt64(0)
        self.feedback_score[Txn.sender] = UInt64(0)
        self.certification_score[Txn.sender] = UInt64(0)
        self.total_users += UInt64(1)

    # ── Initialize (one-time setup) ───────────────────────────────────
    @abimethod()
    def initialize(
        self,
        weight_attendance: UInt64,
        weight_voting: UInt64,
        weight_feedback: UInt64,
        weight_certification: UInt64,
    ) -> None:
        """
        Set the reputation weight multipliers. Callable only once, only by creator.

        Suggested defaults: attendance=30, voting=25, feedback=20, certification=25
        These weights determine how each pillar contributes to the composite score.
        """
        assert Txn.sender == Global.creator_address, "Only creator can initialize"
        assert self.initialized == UInt64(0), "Already initialized"

        self.reputation_weight_attendance = weight_attendance
        self.reputation_weight_voting = weight_voting
        self.reputation_weight_feedback = weight_feedback
        self.reputation_weight_certification = weight_certification
        self.initialized = UInt64(1)

    # ── Update User Score ─────────────────────────────────────────────
    @abimethod()
    def update_user_score(
        self,
        user: Account,
        attendance_delta: UInt64,
        voting_delta: UInt64,
        feedback_delta: UInt64,
        certification_delta: UInt64,
    ) -> UInt64:
        """
        Adds delta values to a user's pillar scores and recomputes the composite
        reputation score.  Only callable by the contract creator (backend service
        account).

        Returns the new composite reputation score.
        """
        assert Txn.sender == Global.creator_address, "Only admin can update scores"
        assert self.initialized == UInt64(1), "Contract not initialized"

        # Accumulate deltas
        self.attendance_score[user] = self.attendance_score[user] + attendance_delta
        self.voting_score[user] = self.voting_score[user] + voting_delta
        self.feedback_score[user] = self.feedback_score[user] + feedback_delta
        self.certification_score[user] = self.certification_score[user] + certification_delta

        # Recompute weighted composite score
        new_reputation = (
            self.attendance_score[user] * self.reputation_weight_attendance
            + self.voting_score[user] * self.reputation_weight_voting
            + self.feedback_score[user] * self.reputation_weight_feedback
            + self.certification_score[user] * self.reputation_weight_certification
        )

        self.reputation_score[user] = new_reputation
        return new_reputation

    # ── Read Reputation (view-like) ───────────────────────────────────
    @abimethod()
    def get_reputation(self, user: Account) -> UInt64:
        """Returns the composite reputation score for a given user."""
        return self.reputation_score[user]

    # ── Read Individual Scores ────────────────────────────────────────
    @abimethod()
    def get_all_scores(
        self, user: Account
    ) -> tuple[UInt64, UInt64, UInt64, UInt64, UInt64]:
        """
        Returns all five scores for a user:
        (reputation, attendance, voting, feedback, certification)
        """
        return (
            self.reputation_score[user],
            self.attendance_score[user],
            self.voting_score[user],
            self.feedback_score[user],
            self.certification_score[user],
        )
