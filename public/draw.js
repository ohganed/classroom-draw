export function randomNumber(next = () => crypto.getRandomValues(new Uint32Array(1))[0], count = 40) {
  if (!Number.isInteger(count) || count < 1 || count > 99) throw new RangeError("人数は1〜99人です");
  // Reject the incomplete bucket so every number has exactly the same probability.
  const limit = Math.floor(2 ** 32 / count) * count;
  let value;
  do { value = next(); } while (value >= limit);
  return value % count + 1;
}
export function buildSchedule(duration = 8000) {
  if (![3000, 5000, 8000].includes(duration)) throw new RangeError("抽選時間は3・5・8秒です");
  const times = [0];
  let time = 0;
  while (true) {
    const next = time + 45 + 800 * (time / duration) ** 2;
    if (next >= duration - 700) break;
    times.push(next);
    time = next;
  }
  times.push(duration);
  return times;
}
export function frameAt(elapsed, schedule) {
  let index = 0;
  while (index + 1 < schedule.length && schedule[index + 1] <= elapsed) index++;
  return { index, done: elapsed >= schedule[schedule.length - 1] };
}
