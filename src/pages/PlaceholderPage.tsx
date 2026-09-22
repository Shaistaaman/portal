/**
 * Temporary stand-in for pages that haven't been built yet. Renders inline
 * (no forced viewport height) so it composes inside a role layout's <main>;
 * pass `fullScreen` for standalone use outside any layout.
 */
export default function PlaceholderPage({
  title,
  fullScreen = false,
}: {
  title: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? "min-h-screen flex items-center justify-center bg-[#fcfbf9]"
          : "flex items-center justify-center py-24"
      }
    >
      <h1 className="text-2xl text-neutral-900">{title}</h1>
    </div>
  );
}
