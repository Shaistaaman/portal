import type { ManagedUser } from "./types";

/**
 * Single shared mock dataset for User Management, used by both the list
 * view and the edit form's lookup-by-id. Ported from apps/portal's
 * user-management pages, which had two separate, unsynced inline mock
 * arrays (`DUMMY_USERS` in the list page, `SAMPLE_USERS` in the edit
 * page) — that split was a bug, not a feature, so this is one list.
 * Replace with a real API call once admin-fn exists (see
 * Context_Instruction.md §3/§8).
 */
export const MOCK_USERS: ManagedUser[] = [
  {
    id: "1",
    fullName: "Martina Vance",
    email: "martina@skylifemanagement.com",
    phone: "+39 345 123 4567",
    role: "admin",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
  },
  {
    id: "2",
    fullName: "Giulia Romano",
    email: "giulia.romano@example.com",
    phone: "+39 348 234 5678",
    role: "owner",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
  },
  {
    id: "3",
    fullName: "Marco Bianchi",
    email: "marco.bianchi@skylifeagency.com",
    phone: "+39 340 345 6789",
    role: "agent",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
    agencyName: "Bianchi Luxury Estates",
    licenseNumber: "AG-2024-00317",
    aboutAgency:
      "Boutique agency specializing in luxury coastal and countryside properties across Tuscany.",
    latitude: "43.7696",
    longitude: "11.2558",
    rejectionReason:
      "License number could not be verified against the regional registry. Please re-check and resubmit.",
  },
  {
    id: "4",
    fullName: "Sofia Conti",
    email: "sofia.conti@example.com",
    phone: "+39 331 456 7890",
    role: "client",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&auto=format&fit=crop",
  },
  {
    id: "5",
    fullName: "Luca Ferrari",
    email: "luca.ferrari@example.com",
    phone: "+39 333 567 8901",
    role: "client",
    status: "inactive",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
  },
  {
    id: "6",
    fullName: "Elena Ricci",
    email: "elena.ricci@example.com",
    phone: "+39 347 678 9012",
    role: "owner",
    status: "inactive",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
  },
  {
    id: "7",
    fullName: "Davide Moretti",
    email: "davide.moretti@skylifeagency.com",
    phone: "+39 349 789 0123",
    role: "agent",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop",
    agencyName: "Moretti & Partners",
    licenseNumber: "AG-2023-00142",
    aboutAgency: "Full-service agency covering the Amalfi Coast.",
    latitude: "40.6333",
    longitude: "14.6029",
  },
  {
    id: "8",
    fullName: "Chiara Colombo",
    email: "chiara.colombo@example.com",
    phone: "+39 342 890 1234",
    role: "client",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop",
  },
  {
    id: "9",
    fullName: "Alessandro Barbieri",
    email: "alessandro.barbieri@example.com",
    phone: "+39 335 901 2345",
    role: "owner",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=256&auto=format&fit=crop",
  },
  {
    id: "10",
    fullName: "Valentina Greco",
    email: "valentina.greco@example.com",
    phone: "+39 366 012 3456",
    role: "admin",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=256&auto=format&fit=crop",
  },
];

export function findMockUserById(id: string): ManagedUser | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}
