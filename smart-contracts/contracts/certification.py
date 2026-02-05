from pyteal import *

def certification_contract():
    # Global state keys
    CREATOR_KEY = Bytes("creator")
    COURSE_ID_KEY = Bytes("course_id")
    ATTENDANCE_REQUIRED_KEY = Bytes("attendance_required")
    CERT_ASSET_ID_KEY = Bytes("cert_asset_id")

    # Local state keys
    ATTENDED_COUNT_KEY = Bytes("attended_count")
    CERT_ISSUED_KEY = Bytes("cert_issued")

    # Initialization
    # Args: [course_id, attendance_required, asset_id]
    on_creation = Seq([
        App.globalPut(CREATOR_KEY, Txn.sender()),
        App.globalPut(COURSE_ID_KEY, Txn.application_args[0]),
        App.globalPut(ATTENDANCE_REQUIRED_KEY, Btoi(Txn.application_args[1])),
        App.globalPut(CERT_ASSET_ID_KEY, Btoi(Txn.application_args[2])),
        Return(Int(1))
    ])

    # Opt-In
    on_opt_in = Seq([
        App.localPut(Int(0), ATTENDED_COUNT_KEY, Int(0)),
        App.localPut(Int(0), CERT_ISSUED_KEY, Int(0)),
        Return(Int(1))
    ])

    # Log Attendance (Increment Counter)
    # Only callable by Admin/Creator for simplicity in this hackathon model, OR
    # could be linked to the attendance contract via group transaction checks.
    # Here we assume the Creator (Backend) calls this after validating attendance elsewhere.
    increment_attendance = Seq([
        Assert(Txn.sender() == App.globalGet(CREATOR_KEY)), # Only creator can increment for now
        
        # Target account passed in accounts array
        App.localPut(Int(1), ATTENDED_COUNT_KEY, App.localGet(Int(1), ATTENDED_COUNT_KEY) + Int(1)),
        Return(Int(1))
    ])

    # Issue Certificate
    # Callable by User if threshold met
    target_asset = App.globalGet(CERT_ASSET_ID_KEY)
    
    issue_cert = Seq([
        # 1. Verify Attendance
        Assert(App.localGet(Int(0), ATTENDED_COUNT_KEY) >= App.globalGet(ATTENDANCE_REQUIRED_KEY)),

        # 2. Verify Not Already Issued
        Assert(App.localGet(Int(0), CERT_ISSUED_KEY) == Int(0)),

        # 3. Inner Transaction: Asset Transfer
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: target_asset,
            TxnField.asset_amount: Int(1),
            TxnField.asset_receiver: Txn.sender(),
            TxnField.fee: Int(0) # Caller covers fee via pooling or strict handling
        }),
        InnerTxnBuilder.Submit(),

        # 4. Mark as Issued
        App.localPut(Int(0), CERT_ISSUED_KEY, Int(1)),
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
                [Txn.application_args[0] == Bytes("INCREMENT"), increment_attendance],
                [Txn.application_args[0] == Bytes("ISSUE"), issue_cert]
            )
        ]
    )

    return program

if __name__ == "__main__":
    with open("certification_approval.teal", "w") as f:
        compiled = compileTeal(certification_contract(), mode=Mode.Application, version=8)
        f.write(compiled)
