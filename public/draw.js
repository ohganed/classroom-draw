export function randomNumber(next = () => crypto.getRandomValues(new Uint32Array(1))[0], count = 40) {
  if (!Number.isInteger(count) || count < 1 || count > 99) throw new RangeError("人数は1〜99人です");
  // Reject the incomplete bucket so every number has exactly the same probability.
  const limit = Math.floor(2 ** 32 / count) * count;
  let value;
  do { value = next(); } while (value >= limit);
  return value % count + 1;
}
export function buildSchedule() {
  const times = [0];
  let time = 0;
  while (true) {
    const next = time + 45 + 800 * (time / 8000) ** 2;
    if (next >= 7300) break;
    times.push(next);
    time = next;
  }
  times.push(8000);
  return times;
}
export function frameAt(elapsed, schedule) {
  let index = 0;
  while (index + 1 < schedule.length && schedule[index + 1] <= elapsed) index++;
  return { index, done: elapsed >= 8000 };
}
