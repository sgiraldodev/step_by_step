'use client';

import { useState } from 'react';
import { Check, RotateCcw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Task } from '@/modules/focus/tasks';
import type { TaskBatchAction } from '@/modules/focus/task-batch';
import ConfirmDeleteDialog from './confirm-delete-dialog';
import styles from './task-bulk-actions.module.css';

export default function TaskBulkActions({
  selected,
  busy,
  activeTaskId,
  onAction,
  onClear,
}: {
  selected: Task[];
  busy: boolean;
  activeTaskId?: number;
  onAction: (action: TaskBatchAction) => Promise<void>;
  onClear: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const hasFinished = selected.some((task) => task.status === 'Terminada');
  const hasInProgress = selected.some((task) => task.status === 'En Progreso');
  const hasActive = selected.some((task) => task.id === activeTaskId);
  return (
    <div className={styles.bar}>
      <div
        role="group"
        aria-label="Acciones para las tareas seleccionadas"
        className={styles.controls}
      >
        <span role="status" className={styles.count}>
          {selected.length} seleccionadas
        </span>
        <div className={styles.actions}>
          <Button
            type="button"
            size="sm"
            aria-label="Completar seleccionadas"
            title="Completar seleccionadas"
            disabled={busy || hasActive || selected.every((task) => task.status === 'Terminada')}
            onClick={() => void onAction('complete')}
            className={styles.action}
          >
            <Check size={16} aria-hidden="true" /> <span>Completar</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Volver a pendientes"
            title="Volver a pendientes"
            disabled={busy || hasActive || hasInProgress || !hasFinished}
            onClick={() => void onAction('restore')}
            className={styles.action}
          >
            <RotateCcw size={16} aria-hidden="true" /> <span>Restaurar</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            aria-label="Eliminar seleccionadas"
            title="Eliminar seleccionadas"
            disabled={busy || hasFinished}
            onClick={() => setConfirming(true)}
            className={styles.action}
          >
            <Trash2 size={16} aria-hidden="true" /> <span>Eliminar</span>
          </Button>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={styles.clear}
          aria-label="Cancelar selección"
          title="Cancelar selección"
          disabled={busy}
          onClick={onClear}
        >
          <X size={16} aria-hidden="true" />
        </Button>
      </div>
      {hasActive && (
        <p className={styles.help}>
          Resuelve el temporizador abierto antes de cambiar el estado de esta selección.
        </p>
      )}
      {hasInProgress && !hasActive && (
        <p className={styles.help}>
          Para volver a pendiente una tarea en progreso, usa Cambiar de tarea en el reloj.
        </p>
      )}
      {hasFinished && (
        <p className={styles.help}>
          Para eliminar tareas terminadas, primero devuélvelas a pendientes.
        </p>
      )}
      {confirming && (
        <ConfirmDeleteDialog
          title="Eliminar tareas seleccionadas"
          description={`Se eliminarán ${selected.length} tareas y todo su tiempo registrado. Esta acción no se puede deshacer. ¿Deseas continuar?`}
          busy={busy}
          onConfirm={() => onAction('delete')}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
