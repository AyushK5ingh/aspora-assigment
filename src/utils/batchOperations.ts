export async function batchAssignRole(
  memberIds: number[],
  role: string,
  updateFn: (id: number, role: string) => Promise<void>,
  onSuccess: () => void,
  onError: (msg: string) => void
): Promise<void> {
  const promises = memberIds.map(id => updateFn(id, role));
  const results = await Promise.allSettled(promises);
  const failed = results.filter(r => r.status === 'rejected').length;
  
  if (failed > 0) {
    onError(`${failed} items failed to save.`);
  } else {
    onSuccess();
  }
}

export async function batchToggleBookmark(
  memberIds: number[],
  bookmarked: boolean,
  updateFn: (id: number, bookmarked: boolean) => Promise<void>,
  onComplete: (succeeded: number, failed: number) => void
): Promise<void> {
  let succeeded = 0;
  let failed = 0;

  for (const id of memberIds) {
    try {
      await updateFn(id, bookmarked);
      succeeded++;
    } catch {
      failed++;
    }
  }

  onComplete(succeeded, failed);
}
