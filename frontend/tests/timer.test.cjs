const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const compiled = ts.transpileModule(fs.readFileSync('src/modules/focus/timer.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const timerModule = new Module('timer');
timerModule._compile(compiled, 'timer.js');
const {
  advanceTimer,
  investedSeconds,
  businessDay,
  makeTimer,
  togglePause,
  validSettings,
  WORK_SECONDS,
  REST_SECONDS,
} = timerModule.exports;

const work = makeTimer(1, 'work');
assert.equal(work.remaining, WORK_SECONDS);
const decision = advanceTimer(work, work.deadline + 30000);
assert.equal(decision.phase, 'decision');
assert.equal(decision.remaining, 0);
assert.equal(decision.operationId, work.operationId);
assert.equal(advanceTimer(decision, Date.now() + 999999), decision);

const paused = togglePause(work);
assert.equal(paused.paused, true);
assert.equal(paused.deadline, null);
assert.equal(advanceTimer(paused, Date.now() + 999999), paused);
const resumed = togglePause(paused);
assert.equal(resumed.paused, false);
assert.equal(resumed.remaining, paused.remaining);
assert.ok(Math.abs(resumed.deadline - Date.now() - resumed.remaining * 1000) < 50);

const rest = makeTimer(1, 'rest');
assert.equal(rest.remaining, REST_SECONDS);
const next = advanceTimer(rest, rest.deadline + 999999);
assert.equal(next.phase, 'work');
assert.equal(next.remaining, WORK_SECONDS);
assert.notEqual(next.operationId, rest.operationId);
const expired = { ...work, deadline: Date.now() - 10 };
assert.equal(togglePause(expired).phase, 'decision');
console.log('Timer tests passed: work, decision, rest, pause, resume and overdue deadlines.');
const settings = { workMinutes: 45, restMinutes: 10 };
assert.ok(validSettings(settings));
for (const invalid of [
  null,
  {},
  { workMinutes: 0, restMinutes: 5 },
  { workMinutes: 181, restMinutes: 5 },
  { workMinutes: 25.5, restMinutes: 5 },
  { workMinutes: 30, restMinutes: 61 },
])
  assert.equal(validSettings(invalid), false);
const customWork = makeTimer(2, 'work', settings);
assert.equal(customWork.remaining, 45 * 60);
assert.equal(customWork.duration, 45 * 60);
const customRest = makeTimer(2, 'rest', settings);
assert.equal(customRest.remaining, 10 * 60);
const updatedSettings = { workMinutes: 20, restMinutes: 3 };
const ongoing = advanceTimer(customWork, customWork.deadline - 1000, updatedSettings);
assert.equal(ongoing.duration, 45 * 60);
assert.equal(ongoing.remaining, 1);
const nextCustom = advanceTimer(customRest, customRest.deadline, updatedSettings);
assert.equal(nextCustom.remaining, 20 * 60);
assert.equal(nextCustom.duration, 20 * 60);
assert.equal(
  togglePause({ ...customRest, deadline: Date.now() - 1 }, updatedSettings).duration,
  20 * 60,
);
console.log(
  'Settings tests passed: validation, custom durations and changes applied to future blocks.',
);
assert.equal(businessDay('America/Bogota', new Date('2026-09-18T04:59:59Z')), '2026-09-17');
assert.equal(businessDay('America/Bogota', new Date('2026-09-18T05:00:00Z')), '2026-09-18');
const dailyRest = { ...makeTimer(2, 'rest', settings), routineDate: '2026-09-17' };
assert.equal(advanceTimer(dailyRest, dailyRest.deadline, settings).routineDate, '2026-09-17');
console.log('Daily clock tests passed: Colombia midnight and daily session metadata.');
const actualNow = Date.now;
try {
  let clock = 100000;
  Date.now = () => clock;
  let measured = makeTimer(3, 'work', { workMinutes: 45, restMinutes: 5 });
  clock += 125500;
  assert.equal(investedSeconds(measured), 125);
  measured = togglePause(measured);
  clock += 600000;
  assert.equal(investedSeconds(measured), 125);
  measured = togglePause(measured);
  clock += 30500;
  assert.equal(investedSeconds(measured), 156);
  const saved = { ...measured, resolvedSeconds: 156 };
  clock += 60000;
  assert.equal(investedSeconds(saved), 156);
  const ended = advanceTimer(measured, measured.deadline);
  assert.equal(investedSeconds(ended), 2700);
  console.log(
    'Effort tests passed: early finish, exact pause/resume, custom duration and stable retry.',
  );
} finally {
  Date.now = actualNow;
}
