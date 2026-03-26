import { useEffect, useState } from 'react'
import type { Habit } from '../types/habit'
import {
  getHabits,
  getArchivedHabits,
  createHabit,
  updateHabit,
  archiveHabit,
  restoreHabit,
} from '../services/habitService'
import HabitRow from '../components/HabitRow'
import ArchivedHabitRow from '../components/ArchivedHabitRow'
import type { Page } from '../App'

interface Props {
  navigate: (page: Page) => void
}

export default function ManageHabitsPage({ navigate }: Props) {
  const [activeHabits, setActiveHabits] = useState<Habit[]>([])
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [error, setError] = useState('')

  // Edit modal state
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editFrequency, setEditFrequency] = useState('daily')
  const [editTargetCount, setEditTargetCount] = useState(1)
  const [editError, setEditError] = useState('')

  async function fetchAll() {
    try {
      const [active, archived] = await Promise.all([getHabits(), getArchivedHabits()])
      setActiveHabits(active)
      setArchivedHabits(archived)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load habits')
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  async function handleCreate() {
    const name = newHabitName.trim()
    if (!name) return
    setError('')
    try {
      await createHabit({ name, frequency: 'daily', target_count: 1 })
      setNewHabitName('')
      await fetchAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create goal')
    }
  }

  async function handleArchive(habit: Habit) {
    setError('')
    try {
      await archiveHabit(habit.id)
      await fetchAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to archive goal')
    }
  }

  async function handleRestore(habit: Habit) {
    setError('')
    try {
      await restoreHabit(habit.id)
      await fetchAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to restore goal')
    }
  }

  function handleOpenEdit(habit: Habit) {
    setEditingHabit(habit)
    setEditName(habit.name)
    setEditDescription(habit.description ?? '')
    setEditFrequency(habit.frequency)
    setEditTargetCount(habit.target_count ?? 1)
    setEditError('')
  }

  function handleCloseEdit() {
    setEditingHabit(null)
  }

  async function handleSaveEdit() {
    if (!editingHabit) return
    setEditError('')
    try {
      await updateHabit(editingHabit.id, {
        name: editName,
        description: editDescription || undefined,
        frequency: editFrequency,
        target_count: editTargetCount,
      })
      setEditingHabit(null)
      await fetchAll()
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update goal')
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '720px' }}>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Manage Goals</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('dashboard')}>
          Back
        </button>
      </div>

      {/* Global error */}
      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      {/* Create row */}
      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="New goal name"
          value={newHabitName}
          onChange={e => setNewHabitName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button className="btn btn-primary" onClick={handleCreate}>
          Create
        </button>
      </div>

      {/* Active section */}
      <div className="mb-4">
        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Active
        </h6>
        {activeHabits.length === 0 ? (
          <p className="text-muted small">No active goals.</p>
        ) : (
          activeHabits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onEdit={handleOpenEdit}
              onArchive={handleArchive}
            />
          ))
        )}
      </div>

      {/* Archived section */}
      <div>
        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Archived
        </h6>
        {archivedHabits.length === 0 ? (
          <p className="text-muted small">No archived goals.</p>
        ) : (
          archivedHabits.map(habit => (
            <ArchivedHabitRow
              key={habit.id}
              habit={habit}
              onRestore={handleRestore}
            />
          ))
        )}
      </div>

      {/* Edit modal */}
      {editingHabit && (
        <>
          <div className="modal d-block" tabIndex={-1} onClick={handleCloseEdit}>
            <div className="modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Goal</h5>
                  <button type="button" className="btn-close" onClick={handleCloseEdit} />
                </div>
                <div className="modal-body">
                  {editError && (
                    <div className="alert alert-danger py-2" role="alert">
                      {editError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Frequency</label>
                    <select
                      className="form-select"
                      value={editFrequency}
                      onChange={e => setEditFrequency(e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Target Count</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      value={editTargetCount}
                      onChange={e => setEditTargetCount(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={handleCloseEdit}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveEdit}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  )
}
