export function watchLaterActionLabel(saved: boolean): string {
  return saved ? "Remove from Watch later" : "Save to Watch later";
}

export function watchLaterResultLabel(saved: boolean): string {
  return saved ? "Saved to Watch later" : "Removed from Watch later";
}
