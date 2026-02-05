from pyteal import *

def voting_contract():
    # On creation
    on_creation = Seq([
        App.globalPut(Bytes("creator"), Txn.sender()),
        App.globalPut(Bytes("voting_open"), Int(1)),
        App.globalPut(Bytes("option1"), Int(0)),
        App.globalPut(Bytes("option2"), Int(0)),
        App.globalPut(Bytes("option3"), Int(0)),
        App.globalPut(Bytes("end_time"), Btoi(Txn.application_args[0])),
        Return(Int(1))
    ])

    is_creator = Txn.sender() == App.globalGet(Bytes("creator"))
    
    # Helper for choice
    choice = Btoi(Txn.application_args[1])

    # Cast vote function
    cast_vote = Seq([
        # Check if voting is open
        Assert(App.globalGet(Bytes("voting_open")) == Int(1)),
        
        # Check if not already voted
        Assert(App.localGet(Int(0), Bytes("voted")) == Int(0)),
        
        # Check if before end time
        Assert(Global.latest_timestamp() < App.globalGet(Bytes("end_time"))),
        
        # Validate choice and update globals
        If(choice == Int(1))
            .Then(App.globalPut(Bytes("option1"), App.globalGet(Bytes("option1")) + Int(1)))
            .ElseIf(choice == Int(2))
            .Then(App.globalPut(Bytes("option2"), App.globalGet(Bytes("option2")) + Int(1)))
            .ElseIf(choice == Int(3))
            .Then(App.globalPut(Bytes("option3"), App.globalGet(Bytes("option3")) + Int(1)))
            .Else(Return(Int(0))),
        
        # Mark as voted
        App.localPut(Int(0), Bytes("voted"), Int(1)),
        
        Return(Int(1))
    ])
    
    # Close voting function
    close_voting = Seq([
        Assert(is_creator),
        App.globalPut(Bytes("voting_open"), Int(0)),
        Return(Int(1))
    ])
    
    # Get results function
    get_results = Seq([
        # Return all counts - implicitly available via global state query, just approve logic here
        Return(Int(1))
    ])

    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.NoOp,
            Cond(
                [Txn.application_args[0] == Bytes("cast_vote"), cast_vote],
                [Txn.application_args[0] == Bytes("close_voting"), close_voting],
                [Txn.application_args[0] == Bytes("get_results"), get_results]
            )
        ]
    )
    
    return program

if __name__ == "__main__":
    with open("voting_contract.teal", "w") as f:
        compiled = compileTeal(voting_contract(), mode=Mode.Application, version=5)
        f.write(compiled)
