import type { Habit } from '../types/habit'

interface Props {
  habit: Habit
  onRestore: (habit: Habit) => void
}

export default function ArchivedHabitRow({ habit, onRestore }: Props) {
  const date = new Date(habit.created_at).toLocaleDateString()

  return (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div>
        <span className="fw-medium text-muted">{habit.name}</span>
        <small className="text-muted ms-2">{date}</small>
      </div>
      <div>
        <button className="btn btn-sm btn-outline-success" onClick={() => onRestore(habit)}>
          Restore
        </button>
      </div>
    </div>
  )
}
