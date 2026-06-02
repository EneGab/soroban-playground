# Multisig Wallet

Production-ready multi-signature wallet contract for decentralized governance
on Soroban. Provides M-of-N approval over arbitrary operations with optional
time-locked execution, confirmation revocation, and strict owner / threshold
invariants.

## Features

- **Configurable M-of-N threshold** (e.g. 2-of-3, 3-of-5).
- **Time-locked execution** with `[min_delay, max_delay]` window.
- **Queued transactions** with cancellation and confirmation revocation.
- **Strict owner / threshold invariants** — threshold is never allowed to
  exceed the current owner count, and the owner count is never allowed to
  drop below the current threshold.
- **Standard event emission** for off-chain indexers and UIs:
  - `Init` – wallet initialised
  - `OwnerAdd` – owner added (`OwnerAddition`)
  - `OwnerRem` – owner removed (`OwnerRemoval`)
  - `ThreshChg` – threshold changed (`ThresholdChange`)
  - `DelayChg` – delay window changed (`DelayChange`)
  - `Submit` – transaction submitted (`Submission`)
  - `Confirm` – transaction confirmed (`Confirmation`)
  - `Revoke` – confirmation revoked (`Revocation`)
  - `Execute` – transaction executed (`Execution`)
  - `Cancel` – transaction cancelled (`Cancellation`)

## API

```text
initialize(owners, threshold, min_delay, max_delay)

add_owner(caller, new_owner)
remove_owner(caller, owner)
change_threshold(caller, new_threshold)
update_delays(caller, min_delay, max_delay)

submit_transaction(proposer, target, value, data, delay)
confirm_transaction(owner, tx_id)
revoke_confirmation(owner, tx_id)
execute_transaction(caller, tx_id)
cancel_transaction(caller, tx_id)

get_owners()
get_owner_count()
is_owner(addr)
get_threshold()
get_min_delay()
get_max_delay()
get_transaction(tx_id)
get_transaction_count()
is_confirmed(tx_id, owner)
```

## Lifecycle

1. Deploy + call `initialize` with the initial owners, threshold, and
   delay window.
2. Owners call `submit_transaction` to queue an operation.
3. Distinct owners call `confirm_transaction` until the threshold is met.
4. After `delay` seconds have elapsed, any owner calls `execute_transaction`.
5. `cancel_transaction` or `revoke_confirmation` can abort the flow at any
   point before execution.

## Storage

- **Instance**:
  - `Initialized` – init guard flag
  - `Threshold` – current approval threshold
  - `MinDelay` / `MaxDelay` – delay window bounds
  - `OwnerCount` – number of current owners
  - `TxCount` – monotonic transaction id counter
- **Persistent**:
  - `OwnerAt(u32)` – owner address at index `u32` (dense, swap-on-remove)
  - `IsOwner(Address)` – boolean membership flag
  - `Transaction(u32)` – full transaction record
  - `Confirmation(u32, Address)` – boolean confirmation flag

## Errors

| Variant | Code | Description |
|--------|------|-------------|
| `AlreadyInitialized` | 1 | `initialize` called twice |
| `NotInitialized` | 2 | method called before `initialize` |
| `Unauthorized` | 3 | caller is not an owner |
| `OwnerRequired` | 4 | `initialize` called with empty owners |
| `OwnerExists` | 5 | `add_owner` with an existing owner |
| `OwnerNotFound` | 6 | `remove_owner` on a non-owner |
| `DuplicateOwner` | 7 | `initialize` owners list contains duplicates |
| `SelfRemoval` | 8 | owner tries to remove themselves |
| `InvalidThreshold` | 9 | threshold is 0 or greater than owner count |
| `InvalidDelay` | 10 | delay window is inverted or out of bounds |
| `InvalidValue` | 11 | `submit_transaction` with negative value |
| `EmptyData` | 12 | `submit_transaction` with empty data |
| `DataTooLong` | 13 | `submit_transaction` data exceeds 256 bytes |
| `TransactionNotFound` | 14 | operation on unknown transaction id |
| `AlreadyConfirmed` | 15 | duplicate `confirm_transaction` |
| `NotConfirmed` | 16 | `revoke_confirmation` on a non-confirmer |
| `WrongStatus` | 17 | operation invalid for the current transaction status |
| `DelayNotElapsed` | 18 | `execute_transaction` before the required delay |

## Example

```rust
// 2-of-3 with a 10 second minimum delay.
let owners = vec![env, alice.clone(), bob.clone(), carol.clone()];
client.initialize(&owners, &2, &10, &86_400);

// Alice proposes a transfer of 100 XLM to a recipient.
let id = client.submit_transaction(
    &alice,
    &recipient,
    &100_000_000,        // 100 XLM in stroops
    &String::from_str(&env, "Q4 grant"),
    &10,
);

// Bob confirms → threshold of 2 met → status becomes Ready.
client.confirm_transaction(&bob, &id);

// Wait 10 seconds, then anyone (e.g. Carol) executes.
client.execute_transaction(&carol, &id);
```

## Testing

```bash
cargo test -p soroban-multisig-wallet
```

The test suite covers 90+ cases spanning initialisation, owner management,
threshold / delay changes, transaction lifecycle, confirmation revocation,
and integration scenarios.
