from pyteal import *

def voting_contract():
    # Global state
    ELECTION_ID_KEY = Bytes("election_id")
    START_TIME_KEY = Bytes("start_time")
    END_TIME_KEY = Bytes("end_time")
    OPTION_COUNT_KEY = Bytes("option_count")
    CREATOR_KEY = Bytes("creator")

    # Local state
    HAS_VOTED_KEY = Bytes("has_voted")
    VOTE_COMMITMENT_KEY = Bytes("vote_commitment")

    # Initialization
    # Args: [election_id, start_time, end_time, option_count]
    on_creation = Seq([
        App.globalPut(CREATOR_KEY, Txn.sender()),
        App.globalPut(ELECTION_ID_KEY, Txn.application_args[0]),
        App.globalPut(START_TIME_KEY, Btoi(Txn.application_args[1])),
        App.globalPut(END_TIME_KEY, Btoi(Txn.application_args[2])),
        App.globalPut(OPTION_COUNT_KEY, Btoi(Txn.application_args[3])),
        Return(Int(1))
    ])

    # Opt-In
    on_opt_in = Seq([
        App.localPut(Int(0), HAS_VOTED_KEY, Int(0)),
        Return(Int(1))
    ])

    # Vote Logic
    # Args: ["VOTE", vote_commitment_hash]
    # The commitment is a hash (e.g., SHA256(choice + salt))
    vote_commitment = Txn.application_args[1]
    
    cast_vote = Seq([
        # 1. Verify Time Window
        Assert(Global.latest_timestamp() >= App.globalGet(START_TIME_KEY)),
        Assert(Global.latest_timestamp() <= App.globalGet(END_TIME_KEY)),

        # 2. Verify Not Already Voted
        Assert(App.localGet(Int(0), HAS_VOTED_KEY) == Int(0)),

        # 3. Store Vote
        App.localPut(Int(0), VOTE_COMMITMENT_KEY, vote_commitment),
        App.localPut(Int(0), HAS_VOTED_KEY, Int(1)),

        # Note: We do NOT increment global counters here to preserve anonymity & scalability constraints
        # Tallying would happen off-chain or via a separate designated tally transaction/contract reading local states
        
        Return(Int(1))
    ])

    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(CREATOR_KEY))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(CREATOR_KEY))],
        [Txn.on_completion() == OnComplete.NoOp, 
            Cond(
                [Txn.application_args[0] == Bytes("VOTE"), cast_vote]
            )
        ]
    )

    return program

if __name__ == "__main__":
    with open("voting_approval.teal", "w") as f:
        compiled = compileTeal(voting_contract(), mode=Mode.Application, version=8)
        f.write(compiled)
