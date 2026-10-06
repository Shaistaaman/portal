/**
 * Financials is an admin-only record-keeping feature: admins upload Excel/CSV
 * files with metadata for filtering. The files are stored and re-downloadable
 * but NOT parsed — the portal never reads the numbers inside (see
 * Project_Specification.md §4.6). Real file storage is a backend concern (S3
 * presigned upload); mocked locally for now.
 */

export type FinancialCategory =
  "Revenue" | "Payouts" | "Expenses" | "Taxes" | "Other";

export const FINANCIAL_CATEGORIES: FinancialCategory[] = [
  "Revenue",
  "Payouts",
  "Expenses",
  "Taxes",
  "Other",
];

export interface FinancialRecord {
  id: string;
  title: string;
  category: FinancialCategory;
  /** Period the record covers. */
  periodMonth: number; // 1-12
  periodYear: number;
  notes: string;
  fileName: string;
  /** Human-readable size, e.g. "48 KB". */
  fileSize: string;
  uploadedBy: string;
  /** ISO date (YYYY-MM-DD). */
  uploadedAt: string;
  /**
   * The owner or agent this record is tagged to — they can view (only)
   * their own tagged records. Empty string = not tagged to anyone (admin
   * internal record). `tagUserName`/`tagUserRole` are denormalized for
   * display/filtering.
   */
  tagUserId: string;
  tagUserName: string;
  tagUserRole: "owner" | "agent" | "";
}

export interface FinancialRecordFormValues {
  title: string;
  category: FinancialCategory | "";
  periodMonth: number;
  periodYear: number;
  notes: string;
  fileName: string;
  tagUserId: string;
}

const now = new Date();

export const EMPTY_FINANCIAL_FORM_VALUES: FinancialRecordFormValues = {
  title: "",
  category: "",
  periodMonth: now.getMonth() + 1,
  periodYear: now.getFullYear(),
  notes: "",
  fileName: "",
  tagUserId: "",
};

/** An owner/agent option for the "Tag to" selector. */
export interface TagOption {
  id: string;
  name: string;
  role: "owner" | "agent";
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatPeriod(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? ""} ${year}`;
}
