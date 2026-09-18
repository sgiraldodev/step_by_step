'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import {
  tasksApi,
  routinesApi,
  tagsApi,
  type Task,
  type Routine,
  type Tag,
} from '@/modules/focus/tasks';
import { businessDay, type Timer } from '@/modules/focus/timer';

export function useFocusData(
  timer: Timer | null,
  setTimer: Dispatch<SetStateAction<Timer | null>>,
  timeZone: string,
  setTimeZone: Dispatch<SetStateAction<string>>,
  setError: Dispatch<SetStateAction<string>>,
  lock: RefObject<boolean>,
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [day, setDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const timerRef = useRef<Timer | null>(null);
  timerRef.current = timer;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ordinary, daily, labels] = await Promise.all([
        tasksApi.list(),
        routinesApi.list(),
        tagsApi.list(),
      ]);
      setTags(labels);
      const items = [...ordinary, ...daily.today_tasks];
      const session = timerRef.current;
      // A block started before midnight can finish without losing its effort.
      if (session && !items.some((task) => task.id === session.taskId)) {
        try {
          const active = await tasksApi.get(session.taskId);
          if (active.status === 'En Progreso' || session.phase === 'decision') {
            if (
              session.phase === 'rest' &&
              active.routine_date &&
              active.routine_date !== daily.date
            )
              setTimer(null);
            else items.push(active);
          }
        } catch {
          /* A removed task is handled by the session reconciliation below. */
        }
      }
      setTasks(items);
      setRoutines(daily.items);
      setDay(daily.date);
      setTimeZone(daily.time_zone);
      setDataLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.');
    } finally {
      setLoading(false);
    }
  }, [setTimer, setTimeZone, setError]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    function checkDay() {
      const currentDay = businessDay(timeZone);
      if (day && day !== currentDay && !lock.current && !loading) void load();
    }
    const interval = setInterval(checkDay, 30000);
    window.addEventListener('focus', checkDay);
    document.addEventListener('visibilitychange', checkDay);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDay);
      document.removeEventListener('visibilitychange', checkDay);
    };
  }, [day, timeZone, loading, load, lock]);

  return { tasks, setTasks, routines, tags, setTags, day, loading, dataLoaded, load };
}
