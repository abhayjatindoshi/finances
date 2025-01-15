export async function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function pickRandomByHash<T>(hash: string, arr: T[]): T {
  const hashInt = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return arr[hashInt % arr.length];
}