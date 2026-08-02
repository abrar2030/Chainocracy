// Generates a unique electoral ID so it no longer needs to be entered by
// the person registering. Format matches the project's existing examples
// (3 letters + 6 digits, e.g. "ABC123456").
export function generateElectoralId(): string {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return `${letters}${digits}`;
}
