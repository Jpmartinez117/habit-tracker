# uGoal — Test Plan

Manual test plan covering the full surface of the application. Each test row
documents an action and its expected result. Where useful, a "How to verify"
note references the underlying mechanism (SQL constraint, FastAPI dependency,
Pydantic field, etc.).

**Priority cases for demo day:** 1.13, 2.4, 4.4, 5.5, 5.8, 7.5, 8.6, 9.6, 10.1, 11.3.

---

## 1. Registration

| # | Test | Expected |
|---|---|---|
| 1.1 | Open `/`, click "Get Started" | Lands on Register page |
| 1.2 | Submit empty form | Four red errors: "Username is required", "Email is required", "Password is required", "Please confirm your password" |
| 1.3 | Type `a` in username | Live error: "Username must be at least 3 characters" |
| 1.4 | Continue typing to `abc` | Error clears |
| 1.5 | Backspace username to empty | Error clears (no "required" until submit) |
| 1.6 | Type `alex` in email | Live error: "Enter a valid email address" |
| 1.7 | Type `alex@example.com` | Error clears |
| 1.8 | Backspace email to `alex@example` | Error returns |
| 1.9 | Type `pass123` in password | Live error: "Password must be at least 8 characters" |
| 1.10 | Type `password123` | Error clears |
| 1.11 | Confirm password with `password124` | Live error: "Passwords do not match" |
| 1.12 | Change password field to `password124` | Confirm field error auto-clears |
| 1.13 | Submit valid form | Redirects to Login page, no error |
| 1.14 | Register with an existing email | Red alert: "User with this email or username already exists" |
| 1.15 | Register with an existing username | Same 400 error |
| 1.16 | Click "Login" link at bottom | Navigates to Login page |

## 2. Login

| # | Test | Expected |
|---|---|---|
| 2.1 | Submit with empty fields | HTML5 required-field block (form uses `required` attrs) |
| 2.2 | Login with wrong password | Red alert: "Invalid email or password" |
| 2.3 | Login with unknown email | Same 401 error message |
| 2.4 | Login with valid credentials | Redirects to Dashboard |
| 2.5 | Login twice in a row on consecutive days | `login_streak` increments by 1 |
| 2.6 | Login with a 2-day gap | `login_streak` resets to 1 |
| 2.7 | Login multiple times same day | `login_streak` unchanged |
| 2.8 | Click "Register" link | Navigates to Register page |

## 3. Session / Auth Persistence

| # | Test | Expected |
|---|---|---|
| 3.1 | After login, refresh the page | Stays on Dashboard, user still logged in |
| 3.2 | Open DevTools → Application → localStorage | Contains `access_token` |
| 3.3 | Delete the token from localStorage and refresh | Returns to Landing (or Login) page |
| 3.4 | Wait 60 minutes, then click any nav action | Auto-logged out, redirected to Login |
| 3.5 | Manually edit the token's `exp` claim to be in the past | Next API call triggers auto-logout |
| 3.6 | Click Logout | localStorage cleared, redirected to Login |

## 4. Dashboard

| # | Test | Expected |
|---|---|---|
| 4.1 | Logged-in dashboard | Shows "Welcome, {username}" header |
| 4.2 | Live clock | Updates every second |
| 4.3 | Progress bar | Shows "Goals completed today / total" matching actual habit count |
| 4.4 | Complete all goals via Logging page, return to Dashboard | Banner appears: "All goals completed today — great work!" |
| 4.5 | Mood label | Shows logged mood (e.g., "Good") or italic "Not logged" |
| 4.6 | Right panel — Active Goals | Matches number of active habits |
| 4.7 | Right panel — Consecutive days | Matches `login_streak` |
| 4.8 | Click Log + | Navigates to Logging page |
| 4.9 | Click Data | Navigates to Data page |
| 4.10 | Click Manage | Navigates to Manage Goals page |

## 5. Manage Goals — Active Habits

| # | Test | Expected |
|---|---|---|
| 5.1 | Empty name → Create | Error: "Goal name cannot be empty" |
| 5.2 | Whitespace-only name → Create | Same error (server trims) |
| 5.3 | Valid name → Create | Habit appears in Active list immediately |
| 5.4 | Press Enter in name field | Same as clicking Create |
| 5.5 | Create with duplicate name | Error: "An active goal with this name already exists" |
| 5.6 | Create with a name matching an archived habit | **Succeeds** (archived names allowed) |
| 5.7 | Click Edit → change name → Save | Habit row updates with new name |
| 5.8 | Edit a habit to a name matching another **active** habit | Modal shows: "An active goal with this name already exists" |
| 5.9 | Edit a habit to its own current name (no rename) | Saves without error |
| 5.10 | Edit description and frequency | Persists |
| 5.11 | Edit target_count to 0 | Server rejects (`gt=0`) |
| 5.12 | Click Archive | First click shows Confirm/Cancel buttons |
| 5.13 | Click Confirm | Habit moves to Archived section |
| 5.14 | Click Cancel | Returns to default Edit/Archive buttons, no archive |
| 5.15 | Click outside the edit modal | Modal closes without saving |
| 5.16 | Click the modal's X close button | Modal closes |

## 6. Manage Goals — Archived

| # | Test | Expected |
|---|---|---|
| 6.1 | No archived habits | Shows "No archived goals." |
| 6.2 | Click Restore on an archived habit | Moves back to Active section |
| 6.3 | Archived habit name re-used as a new active name | Both coexist |

## 7. Logging Page

| # | Test | Expected |
|---|---|---|
| 7.1 | Open Logging page | Shows today's date in header (long format) |
| 7.2 | No active habits | Shows "No active goals. Add some in Manage." |
| 7.3 | Toggle a habit on → Save | Habit log created (visible in DB / today's logs) |
| 7.4 | Re-open Logging page | Toggle is pre-checked for habits logged today |
| 7.5 | Uncheck a previously-logged habit → Save | DELETE fires, log removed |
| 7.6 | Click mood emoji (1–5) | Button styled as primary, others outline |
| 7.7 | Save with mood selected | Mood row created; "Saved: {date}" banner |
| 7.8 | Re-open Logging | Mood selection persists from earlier |
| 7.9 | Re-submit same selections | Upsert — no duplicates in DB |
| 7.10 | Save with no habits and no mood selected | Save button still works; nothing breaks |
| 7.11 | Click Back | Returns to Dashboard |
| 7.12 | Open Swagger `/docs` → POST `/habit-logs` with `log_date` in the future | 422 "Cannot log for a future date" |
| 7.13 | Same with `log_date` before habit's `created_at` | 422 "Cannot log for a date before the goal was created" |
| 7.14 | POST `/mood-logs` with `mood_score=6` | 422 from Pydantic (`le=5`) |
| 7.15 | POST `/mood-logs` with `mood_score=0` | 422 from Pydantic (`ge=1`) |

## 8. Data Page — Overall View

| # | Test | Expected |
|---|---|---|
| 8.1 | New user with no habits | Shows "No goals yet — go create one" |
| 8.2 | Overall mode default | Toggle says Overall, heatmap renders, left panel disabled (low opacity) |
| 8.3 | Heatmap cell colors | Empty (gray), light → dark green based on % |
| 8.4 | Future days in current month | Empty cell, no fill |
| 8.5 | Days before any habit existed | Empty cell |
| 8.6 | Archived habits exist | **Not** counted in Overall metrics or heatmap |
| 8.7 | Active Goals metric | Matches non-archived count |
| 8.8 | This Week / Last Week / Week Change | Percentages computed correctly for current month |
| 8.9 | Avg Mood metric | Displays mean of moods for the month; italic "No mood logged" if none |
| 8.10 | Click ← to previous month | Heatmap loads previous month, metrics swap to "That Month" view (no This/Last Week rows) |
| 8.11 | Click → at current month | Button disabled |
| 8.12 | Future month query via direct API | 422 "month cannot be in the future" |
| 8.13 | Malformed month (e.g., `?month=2026/05`) | 422 "month must be in YYYY-MM format" |

## 9. Data Page — Individual View

| # | Test | Expected |
|---|---|---|
| 9.1 | Toggle to Individual | Left panel becomes interactive, first active habit auto-selected |
| 9.2 | Click an active habit | Calendar + metrics update for that habit |
| 9.3 | Click an archived habit | Calendar + metrics show (read-only history) |
| 9.4 | Today logged completed | Green cell with white text |
| 9.5 | Day in past, missed | Red cell with white text |
| 9.6 | Day before creation | Empty cell, black number |
| 9.7 | Day in future | Empty cell, black number |
| 9.8 | Day not logged but user logged other habits | Gray (`bg-secondary bg-opacity-25`) |
| 9.9 | Completion % | Equals `total_completed / days_since_created * 100` (rounded) |
| 9.10 | Current Streak | Counts consecutive completed days ending today |
| 9.11 | Month nav back | Calendar shows past month; metrics swap to "Completed / Missed / Completion %" only |
| 9.12 | Switch back to current month | Full metric set returns including Week change |

## 10. Demo Data (Seeded)

| # | Test | Expected |
|---|---|---|
| 10.1 | Login as `demo@ugoal.app` / `demo1234` | Lands on populated Dashboard |
| 10.2 | Dashboard shows 4 active goals | Correct |
| 10.3 | Overall heatmap | 14 days of varied green shades |
| 10.4 | Individual: Exercise | Completion ~71%, mix of green and red cells |
| 10.5 | Individual: Read | Completion ~78% |
| 10.6 | Individual: Meditate | Completion ~57% |
| 10.7 | Individual: Drink water | Completion ~93% |
| 10.8 | Re-run `python seed_data.py` | Wipes and reseeds; data identical |
| 10.9 | Other users' data untouched by re-seed | Confirmed |

## 11. Cross-User Isolation

| # | Test | Expected |
|---|---|---|
| 11.1 | User A logs in, creates habits | User B sees none of them |
| 11.2 | User A's JWT used by another browser, then User B logs in | Each user only sees their own data |
| 11.3 | Direct API call: `PATCH /habits/{id}` for a habit owned by another user | 404 "Goal not found" (no info leak) |
| 11.4 | `DELETE /habit-logs/{habit_id}/{log_date}` for another user's habit | 404 |
| 11.5 | `GET /habit-logs/{habit_id}/summary` for another user's habit | 404 |

## 12. CORS / Network

| # | Test | Expected |
|---|---|---|
| 12.1 | Frontend on 5173, backend on 8000 | All API calls succeed |
| 12.2 | Frontend on a different port (e.g., 5174) | Browser blocks calls with CORS error in console |
| 12.3 | API call with no token | 401 (HTTPBearer raises) |
| 12.4 | API call with malformed Bearer token | 401 "Invalid or expired token" |
| 12.5 | API call with expired token | 401 → frontend auto-logs out and redirects |
| 12.6 | Backend offline | Frontend shows "Network error. Please check your connection." |
| 12.7 | API hung > 10s | Frontend shows "Request timed out. Please check your connection." |

## 13. Database Integrity

| # | Test | Expected |
|---|---|---|
| 13.1 | Delete a user (via direct SQL) | Their habits, habit_logs, and mood_logs cascade-delete |
| 13.2 | Delete a habit | Its habit_logs cascade-delete |
| 13.3 | Two users with same username | Insert fails (UNIQUE constraint) |
| 13.4 | Two users with same email | Insert fails (UNIQUE constraint) |
| 13.5 | `notes` column accepts 255 chars | Stores successfully |
| 13.6 | `notes` with 256 chars | Truncates or errors (DB-dependent) |
| 13.7 | `mood_score = 3` | Stores; label "Okay" set by service |

## 14. Setup / Deliverables

| # | Test | Expected |
|---|---|---|
| 14.1 | Fresh MySQL → `mysql < init_db.sql` | Database `habit_tracker` created |
| 14.2 | `python create_tables.py` | All 4 tables created, no errors |
| 14.3 | `python seed_data.py` | Demo user + 4 habits + 42 logs + 10 moods |
| 14.4 | `pip install -r requirements.txt` in fresh venv | All packages install successfully |
| 14.5 | `npm install && npm run dev` in `frontend/` | Vite serves at 5173 |
| 14.6 | Follow README from top to bottom on clean machine | App fully functional |
