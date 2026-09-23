/**
 * Agent profile completion state management.
 * 
 * For demo: uses DEMO_AGENT_PROFILE_INCOMPLETE flag.
 * For production: will read from auth context (checking if specific fields are empty).
 * 
 * Persistence: demo mode resets on page refresh (not persisted).
 */

/**
 * Demo flag: set to true to simulate incomplete agent profile on first login.
 * In production, this will be determined by checking auth context for empty fields.
 */
export const DEMO_AGENT_PROFILE_INCOMPLETE = true;

/**
 * Demo agent ID (Marco Bianchi) matching the mock dataset.
 */
export const DEMO_AGENT_ID = "3";

/**
 * Storage key for profile completion flag (for demo mode).
 * In production, this state would live in auth context, not localStorage.
 */
const PROFILE_COMPLETION_KEY = `agent_${DEMO_AGENT_ID}_profile_confirmed`;

/**
 * Check if agent profile is complete.
 * 
 * Logic:
 * 1. If demo flag is off, profile is always complete.
 * 2. If demo flag is on and sessionStorage has confirmation, profile is complete.
 * 3. Otherwise, profile is incomplete.
 * 
 * Note: Using sessionStorage (not localStorage) so it resets on page refresh (demo behavior).
 */
export function isAgentProfileComplete(): boolean {
  if (!DEMO_AGENT_PROFILE_INCOMPLETE) {
    return true;
  }
  // Check sessionStorage for completion flag
  return sessionStorage.getItem(PROFILE_COMPLETION_KEY) === "true";
}

/**
 * Mark agent profile as complete.
 * Stores flag in sessionStorage (resets on refresh for demo mode).
 */
export function confirmAgentProfileComplete(): void {
  sessionStorage.setItem(PROFILE_COMPLETION_KEY, "true");
}

/**
 * Reset profile completion (for demo/testing).
 */
export function resetAgentProfileCompletion(): void {
  sessionStorage.removeItem(PROFILE_COMPLETION_KEY);
}
