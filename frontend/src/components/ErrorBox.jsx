export default function ErrorBox({ message }) {
  if (!message) return null;
  return <div className="rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">{message}</div>;
}
