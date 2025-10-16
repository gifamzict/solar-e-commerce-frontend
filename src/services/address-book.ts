// Lightweight local storage address book until API is ready
// Replace implementation with real HTTP calls later.

export type SavedAddress = {
  id: string;
  label?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  created_at: string;
};

const STORAGE_KEY = 'gtech_saved_addresses_v1';

const safeParse = (val: string | null): SavedAddress[] => {
  try {
    if (!val) return [];
    const data = JSON.parse(val);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const persist = (arr: SavedAddress[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
};

const genId = () => {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `addr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

export function listSavedAddresses(): SavedAddress[] {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function addSavedAddress(input: Omit<SavedAddress, 'id' | 'created_at'>): SavedAddress {
  const all = listSavedAddresses();
  const entry: SavedAddress = { id: genId(), created_at: new Date().toISOString(), ...input };
  all.unshift(entry);
  persist(all);
  return entry;
}

export function removeSavedAddress(id: string) {
  const all = listSavedAddresses();
  const next = all.filter(a => a.id !== id);
  persist(next);
}

export function clearAllSavedAddresses() {
  persist([]);
}

export function setSavedAddressesList(addresses: SavedAddress[]) {
  persist(addresses.map(a => ({
    id: a.id,
    label: a.label,
    first_name: a.first_name,
    last_name: a.last_name,
    email: a.email,
    phone: a.phone,
    address: a.address,
    city: a.city,
    state: a.state,
    created_at: a.created_at || new Date().toISOString(),
  })));
}
