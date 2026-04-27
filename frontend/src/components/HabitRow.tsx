import { useState } from 'react'
import type { Habit } from '../types/habit'

interface Props {
  habit: Habit
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit) => Promise<void>
}

export default function HabitRow({ habit, onEdit, onArchive }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const date = new Date(habit.created_at).toLocaleDateString()

  async function handleConfirmArchive() {
    setArchiving(true)
    try {
      await onArchive(habit)
    } finally {
      setArchiving(false)
      setConfirming(false)
    }
  }

  return (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div>
        <span className="fw-medium">{habit.name}</span>
        <small className="text-muted ms-2">{date}</small>
      </div>
      <div className="d-flex gap-2">
        {confirming ? (
          <>
            <button
              className="btn btn-sm btn-warning"
              onClick={handleConfirmArchive}
              disabled={archiving}
            >
              {archiving ? 'Archiving...' : 'Confirm'}
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setConfirming(false)}
              disabled={archiving}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(habit)}>
              Edit
            </button>
            <button className="btn btn-sm btn-outline-warning" onClick={() => setConfirming(true)}>
              Archive
            </button>
          </>
        )}
      </div>
    </div>
  )
}
