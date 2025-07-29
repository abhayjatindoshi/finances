export async function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function pickRandomByHash<T>(hash: string | undefined, arr: T[]): T {
  if (!hash) {
    // Return first item if hash is undefined
    return arr[0];
  }
  const hashInt = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return arr[hashInt % arr.length];
}