interface AdminHeadingProps {
  /** Leading word (e.g. "Tele"). */
  prefix?: string;
  /** Trailing word (e.g. "Products"). */
  word: string;
  /** Optional sub-line under the heading. */
  sub?: string;
}

/**
 * Admin page heading in the TeleFeedback wordmark style, solid violet
 * to match the storefront's TeleProducts-style headings.
 */
export function AdminHeading({ prefix = "Tele", word, sub }: AdminHeadingProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
        {prefix}{word}
      </h1>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </div>
  );
}
