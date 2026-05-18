const STORAGE_KEY = 'preseediq_form_data';

export function saveFormData(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

export function loadFormData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearFormData() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

export function purgeUserSession() {
  sessionStorage.clear();
  window.location.href = '/step/1';
}
