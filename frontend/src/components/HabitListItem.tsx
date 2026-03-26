import type { Habit } from '../types/habit'

interface Props {
  habit: Habit
  index: number
}

export default function HabitListItem({ habit, index }: Props) {
  return (
    <div className="d-flex align-items-center py-2 border-bottom">
      <span className="text-muted me-3" style={{ minWidth: '1.5rem' }}>{index}.</span>
      <span>{habit.name}</span>
    </div>
  )
}
