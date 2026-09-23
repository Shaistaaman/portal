import { useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import {
  EMPTY_FINANCIAL_FORM_VALUES,
  FINANCIAL_CATEGORIES,
  MONTH_NAMES,
  type FinancialRecordFormValues,
} from "./types";
import { AGENT_TAG_OPTIONS, OWNER_TAG_OPTIONS } from "./tagOptions";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);

export interface AddFinancialRecordFormProps {
  onSubmit: (values: FinancialRecordFormValues) => void;
  onCancel: () => void;
}

export default function AddFinancialRecordForm({
  onSubmit,
  onCancel,
}: AddFinancialRecordFormProps) {
  const [values, setValues] = useState<FinancialRecordFormValues>(
    EMPTY_FINANCIAL_FORM_VALUES,
  );
  const [errors, setErrors] = useState<string[]>([]);

  const update = <K extends keyof FinancialRecordFormValues>(
    key: K,
    value: FinancialRecordFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handleFile = (file: File | null) => {
    if (!file) return;
    // Store-not-parse: capture only the file name for the record. Real
    // upload goes through an S3 presigned PUT once the backend exists.
    update("fileName", file.name);
  };

  const validate = (): string[] => {
    const problems: string[] = [];
    if (!values.fileName) problems.push("Upload a file.");
    if (!values.title.trim()) problems.push("Title is required.");
    if (!values.category) problems.push("Select a category.");
    return problems;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const problems = validate();
    setErrors(problems);
    if (problems.length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 space-y-1">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <Field label="File">
        {values.fileName ? (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border border-neutral-300 rounded-lg text-sm text-neutral-800">
            <span className="truncate">{values.fileName}</span>
            <button
              type="button"
              onClick={() => update("fileName", "")}
              aria-label="Remove file"
              className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="financial-file-upload"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer"
          >
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-sm">Click to upload or drag and drop</span>
            <span className="text-xs text-neutral-400 mt-1">
              Excel or CSV — XLSX, XLS, CSV (Max 10MB)
            </span>
            <input
              id="financial-file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </Field>

      <Field label="Title / Label">
        <input
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. July 2026 Revenue Summary"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Period — Month">
          <select
            value={values.periodMonth}
            onChange={(e) => update("periodMonth", Number(e.target.value))}
            className={inputClass}
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Period — Year">
          <select
            value={values.periodYear}
            onChange={(e) => update("periodYear", Number(e.target.value))}
            className={inputClass}
          >
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select
            value={values.category}
            onChange={(e) =>
              update(
                "category",
                e.target.value as FinancialRecordFormValues["category"],
              )
            }
            className={inputClass}
          >
            <option value="">Select a category</option>
            {FINANCIAL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tag to (optional)">
        <select
          value={values.tagUserId}
          onChange={(e) => update("tagUserId", e.target.value)}
          className={inputClass}
        >
          <option value="">Not tagged (admin-only record)</option>
          <optgroup label="Owners">
            {OWNER_TAG_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Agents">
            {AGENT_TAG_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </optgroup>
        </select>
        <p className="text-xs text-neutral-500 mt-1">
          The tagged owner or agent will be able to view this record in their
          own financials.
        </p>
      </Field>

      <Field label="Notes (optional)">
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          placeholder="Any context for this record..."
          className={inputClass}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Save Record
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
