interface AdminHeadingProps {
  /** Leading word rendered in solid color (e.g. "Tele"). */
  prefix?: string;
  /** Trailing word rendered with the brand gradient (e.g. "Products"). */
  word: string;
  /** Optional sub-line under the heading. */
  sub?: string;
}

/**
 * Admin page heading in the TeleFeedback wordmark style
 * ("Tele" + gradient word), sized down a notch for dashboard use.
 */
export function AdminHeading({ prefix = "Tele", word, sub }: AdminHeadingProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        {prefix}
        <span className="gradient-text">{word}</span>
      </h1>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </div>
  );
}
