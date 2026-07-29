export function normalizeBlockedKeyword(keyword: string): string {
  return keyword.normalize("NFKC").trim().toLowerCase();
}

export function titleMatchesBlockedKeyword(title: string, keywords: readonly string[]): boolean {
  const normalizedTitle = title.normalize("NFKC").toLowerCase();
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeBlockedKeyword(keyword);
    return normalizedKeyword.length > 0 && normalizedTitle.includes(normalizedKeyword);
  });
}
