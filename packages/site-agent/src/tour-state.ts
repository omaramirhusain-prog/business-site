/** Shared flag so voice hook does not speak over an active guided tour. */

let tourActive = false;

export function setTourActive(active: boolean) {
  tourActive = active;
}

export function isTourActive() {
  return tourActive;
}
