# Use Cases

## Create and assign shift

An authenticated manager enters date, time, role, notes, and optional employee. The API validates time, overlap, availability, leave, and active status, then saves. Failure changes nothing.

## Maintain availability

An employee replaces their own seven-day recurring availability. The API validates ownership and time ranges. Managers may read it.

## Request and decide leave

An employee submits a valid inclusive range in PENDING. A manager records APPROVED or REJECTED with reviewer and time.

## View weekly schedule

Managers query all shifts for a week. Employees query only their shifts. Cancelled and unassigned states are distinct.
