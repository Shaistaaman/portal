import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AddFinancialRecordForm from "@/features/financials/AddFinancialRecordForm";

export default function AdminAddFinancialRecordPage() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-950 mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-semibold text-neutral-950 mb-2">Add File</h1>
      <p className="text-neutral-600 mb-8">
        Upload a financial document for record keeping. The file is stored for
        reference only — its contents are not read or reported on.
      </p>

      <AddFinancialRecordForm
        onSubmit={() => {
          // TODO(AWS integration): upload the file via an S3 presigned PUT
          // and POST the metadata record to admin-fn.
          navigate("/admin/financial");
        }}
        onCancel={() => navigate("/admin/financial")}
      />
    </div>
  );
}
