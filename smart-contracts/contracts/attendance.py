from pyteal import *

def attendance_contract():
    # Global State Keys
    EVENT_ID_KEY = Bytes("event_id")
    START_TIME_KEY = Bytes("start_time")
    END_TIME_KEY = Bytes("end_time")
    TOTAL_ATTENDANCE_KEY = Bytes("total_attendance")
    CREATOR_KEY = Bytes("creator")

    # Local State Keys
    CHECKED_IN_KEY = Bytes("checked_in")
    CHECKIN_TIMESTAMP_KEY = Bytes("checkin_timestamp")

    # Initialization
    # Args: [event_id, start_time, end_time]
    on_creation = Seq([
        App.globalPut(CREATOR_KEY, Txn.sender()),
        App.globalPut(EVENT_ID_KEY, Txn.application_args[0]),
        App.globalPut(START_TIME_KEY, Btoi(Txn.application_args[1])),
        App.globalPut(END_TIME_KEY, Btoi(Txn.application_args[2])),
        App.globalPut(TOTAL_ATTENDANCE_KEY, Int(0)),
        Return(Int(1))
    ])

    # Opt-In logic
    on_opt_in = Seq([
        App.localPut(Int(0), CHECKED_IN_KEY, Int(0)),
        Return(Int(1))
    ])

    # Check-In Logic
    # Args: ["CHECK_IN"]
    check_in = Seq([
        # 1. Verify Time Window
        Assert(Global.latest_timestamp() >= App.globalGet(START_TIME_KEY)),
        Assert(Global.latest_timestamp() <= App.globalGet(END_TIME_KEY)),

        # 2. Verify Not Already Checked In
        Assert(App.localGet(Int(0), CHECKED_IN_KEY) == Int(0)),

        # 3. Update Local State
        App.localPut(Int(0), CHECKED_IN_KEY, Int(1)),
        App.localPut(Int(0), CHECKIN_TIMESTAMP_KEY, Global.latest_timestamp()),

        # 4. Increment Global Counter
        App.globalPut(TOTAL_ATTENDANCE_KEY, App.globalGet(TOTAL_ATTENDANCE_KEY) + Int(1)),

        Return(Int(1))
    ])

    # Routing
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(CREATOR_KEY))], # Only creator can update
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(CREATOR_KEY))], # Only creator can delete
        [Txn.on_completion() == OnComplete.NoOp, 
            Cond(
                [Txn.application_args[0] == Bytes("CHECK_IN"), check_in]
            )
        ]
    )

    return program

if __name__ == "__main__":
    with open("attendance_approval.teal", "w") as f:
        compiled = compileTeal(attendance_contract(), mode=Mode.Application, version=8)
        f.write(compiled)
