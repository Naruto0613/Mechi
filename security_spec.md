# Security Specification - Mechi

## Data Invariants
1. A user profile MUST belong to the authenticated UID.
2. XP and Streaks can only be incremented, not set to arbitrary large values by the user (enforced by `increment` but limited by client-side logic for now).
3. Content (Vocabulary, Lessons) is READ-ONLY for all users.

## The Dirty Dozen Payloads (Test cases)
1. Write to `users/other_uid` -> DENIED.
2. Read `users/other_uid` -> DENIED.
3. Update `users/my_uid` setting `totalXp` to -100 -> DENIED (should be whitelisted for positive changes or handled by backend, client is allowed to update currently).
4. Delete `vocabulary/item` -> DENIED.
5. Create `lessons/fake_lesson` -> DENIED.
6. List `users` -> DENIED.
7. Write to `users/my_uid` without `uid` field -> DENIED.
8. Update `users/my_uid` and change `uid` field -> DENIED.

## Relationship Mapping
- `User` profiles are isolated by UID.
- `Vocabulary` and `Lessons` are global public resources.
