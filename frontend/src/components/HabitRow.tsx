import type { Habit } from '../types/habit'

interface Props {
  habit: Habit
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit) => void
}

export default function HabitRow({ habit, onEdit, onArchive }: Props) {
  const date = new Date(habit.created_at).toLocaleDateString()

  return (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div>
        <span className="fw-medium">{habit.name}</span>
        <small className="text-muted ms-2">{date}</small>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(habit)}>
          Edit
        </button>
        <button className="btn btn-sm btn-outline-warning" onClick={() => onArchive(habit)}>
          Archive
        </button>
      </div>
    </div>
  )
}
