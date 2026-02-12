from algopy import *
from algopy.arc4 import abimethod


class Staking(ARC4Contract):
    """
    Lightweight DeFi Staking Contract for Campus Credit Token (CCT).

    Users deposit (stake) CCT tokens to earn governance weight multipliers.
    The contract holds the CCT ASA in escrow and tracks each user's staked
    balance via local state.

    Governance integration:
        staked_balance >= governance_threshold  →  vote_weight = 2
        staked_balance <  governance_threshold  →  vote_weight = 1

    This is a minimal staking mechanism — no time-lock, no yield farming.
    Designed to be composable with the Reputation contract.
    """

    # ── Global State ──────────────────────────────────────────────────
    cct_asset_id: UInt64
    total_staked: UInt64
    governance_threshold: UInt64
    initialized: UInt64

    # ── Local State (per user) ────────────────────────────────────────
    staked_balance: LocalState[UInt64]

    def __init__(self) -> None:
        self.cct_asset_id = UInt64(0)
        self.total_staked = UInt64(0)
        self.governance_threshold = UInt64(10)  # default: 10 CCT for 2x vote weight
        self.initialized = UInt64(0)
        self.staked_balance = LocalState(UInt64, key="stk_bal")

    # ── Opt-In Handler ────────────────────────────────────────────────
    @abimethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """User opts in; initializes staked balance to zero."""
        self.staked_balance[Txn.sender] = UInt64(0)

    # ── Initialize ────────────────────────────────────────────────────
    @abimethod()
    def initialize(self, cct_asset_id: UInt64, governance_threshold: UInt64) -> None:
        """
        One-time setup: registers the CCT ASA and sets governance threshold.
        Only callable by creator. The contract must also be funded and opted
        in to the CCT asset before users can deposit.
        """
        assert Txn.sender == Global.creator_address, "Only creator can initialize"
        assert self.initialized == UInt64(0), "Already initialized"

        self.cct_asset_id = cct_asset_id
        self.governance_threshold = governance_threshold
        self.initialized = UInt64(1)

        # Opt the contract into the CCT asset so it can receive transfers
        itxn.AssetTransfer(
            xfer_asset=cct_asset_id,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
            fee=0,
        ).submit()

    # ── Stake CCT ─────────────────────────────────────────────────────
    @abimethod()
    def stake(self, deposit_txn: gtxn.AssetTransferTransaction) -> UInt64:
        """
        User stakes CCT tokens by sending an ASA transfer grouped with this
        app call.

        Returns the user's new staked balance.
        """
        assert self.initialized == UInt64(1), "Contract not initialized"
        assert deposit_txn.xfer_asset == self.cct_asset_id, "Wrong asset"
        assert deposit_txn.asset_receiver == Global.current_application_address, "Must send to contract"
        assert deposit_txn.asset_amount > 0, "Must stake positive amount"

        self.staked_balance[Txn.sender] = (
            self.staked_balance[Txn.sender] + deposit_txn.asset_amount
        )
        self.total_staked += deposit_txn.asset_amount
        return self.staked_balance[Txn.sender]

    # ── Withdraw CCT ──────────────────────────────────────────────────
    @abimethod()
    def withdraw(self, amount: UInt64) -> UInt64:
        """
        User withdraws staked CCT. Sends tokens back from contract escrow.

        Returns the user's remaining staked balance.
        """
        assert self.initialized == UInt64(1), "Contract not initialized"
        assert amount > 0, "Withdraw amount must be positive"
        assert self.staked_balance[Txn.sender] >= amount, "Insufficient staked balance"

        # Transfer CCT back to user
        itxn.AssetTransfer(
            xfer_asset=self.cct_asset_id,
            asset_receiver=Txn.sender,
            asset_amount=amount,
            fee=0,
        ).submit()

        self.staked_balance[Txn.sender] = self.staked_balance[Txn.sender] - amount
        self.total_staked -= amount
        return self.staked_balance[Txn.sender]

    # ── Get Stake Balance ─────────────────────────────────────────────
    @abimethod()
    def get_stake(self, user: Account) -> UInt64:
        """Returns the staked CCT balance for a user."""
        return self.staked_balance[user]

    # ── Get Governance Vote Weight ────────────────────────────────────
    @abimethod()
    def get_vote_weight(self, user: Account) -> UInt64:
        """
        Returns the governance vote weight multiplier for a user.
        2x if staked >= threshold, 1x otherwise.
        """
        staked = self.staked_balance[user]
        if staked >= self.governance_threshold:
            return UInt64(2)
        return UInt64(1)
