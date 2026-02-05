from pyteal import *

def attendance_contract():
    # On creation, store event times
    on_creation = Seq([
        App.globalPut(Bytes("creator"), Txn.sender()),
        App.globalPut(Bytes("start_time"), Btoi(Txn.application_args[0])),
        App.globalPut(Bytes("end_time"), Btoi(Txn.application_args[1])),
        App.globalPut(Bytes("total_attendance"), Int(0)),
        Return(Int(1))
    ])

    # Check if caller is the creator
    is_creator = Txn.sender() == App.globalGet(Bytes("creator"))

    # Helper for current time
    current_time = Global.latest_timestamp()

    # Mark attendance function
    mark_attendance = Seq([
        # Check if already attended
        Assert(App.localGet(Int(0), Bytes("attended")) == Int(0)),
        
        # Check if within time window
        Assert(current_time >= App.globalGet(Bytes("start_time"))),
        Assert(current_time <= App.globalGet(Bytes("end_time"))),
        
        # Mark as attended
        App.localPut(Int(0), Bytes("attended"), Int(1)),
        
        # Increment total attendance
        App.globalPut(
            Bytes("total_attendance"),
            App.globalGet(Bytes("total_attendance")) + Int(1)
        ),
        
        Return(Int(1))
    ])

    # Get attendance count function
    get_attendance = Seq([
        App.localGet(Int(0), Bytes("attended")),
        Return(Int(1))
    ])

    # Handle different transactions
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_creator)],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_creator)],
        [Txn.on_completion() == OnComplete.NoOp, 
            Cond(
                [Txn.application_args[0] == Bytes("mark_attendance"), mark_attendance],
                [Txn.application_args[0] == Bytes("get_attendance"), get_attendance]
            )
        ]
    )

    return program

if __name__ == "__main__":
    with open("attendance_contract.teal", "w") as f:
        compiled = compileTeal(attendance_contract(), mode=Mode.Application, version=5)
        f.write(compiled)
