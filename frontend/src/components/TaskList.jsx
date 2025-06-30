import React, { useEffect, useState } from 'react'
import API from '../api'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [contributors, setContributors] = useState([])
  const [projects, setProjects] = useState([])
  const [assignments, setAssignments] = useState({})
  const [isOpenDialog, setOpenDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', due_date: '', assigned_to: '', project: '' })
  const isAdmin = localStorage.getItem('role') === 'admin'
  const isContributor = localStorage.getItem('role') === 'contributor'

  useEffect(() => {
    if (isAdmin) {
      API.get('tasks/').then(res => setTasks(res.data.results))
      API.get('contributors/').then(res => setContributors(res.data))
      API.get('projects/').then(res => setProjects(res.data.results || res.data))
    } else if (isContributor) {
      API.get('tasks/').then(res => setTasks(res.data.results))
    }
  }, [isAdmin, isContributor])

  const handleAssign = async () => {
    if (!form.title || !form.due_date || !form.assigned_to || !form.project) {
      alert('Title, due date, project, and contributor are required!')
      return
    }
    try {
      const res = await API.post('assign-task/', {
        title: form.title,
        description: form.description,
        due_date: form.due_date,
        contributor_id: Number(form.assigned_to),
        project_id: Number(form.project)
      })
      setTasks(prev => [
        {
          id: res.data.task_id,
          title: form.title,
          description: form.description,
          due_date: form.due_date,
          assigned_to: contributors.find(c => c.id === Number(form.assigned_to)),
          project: projects.find(p => p.id === Number(form.project)),
          status: 'todo'
        },
        ...prev
      ])
      closeDialog()
      alert('Task assigned!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign task.')
    }
  }

  const openCreateDialog = () => {
    setEditId(null)
    setForm({ title: '', description: '', status: 'todo', due_date: '', assigned_to: '', project: '' })
    setOpenDialog(true)
  }

  const openEditDialog = (task) => {
    setEditId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date,
      assigned_to: task.assigned_to && typeof task.assigned_to === 'object' ? task.assigned_to.id : task.assigned_to,
      project: task.project && typeof task.project === 'object' ? task.project.id : task.project
    })
    setOpenDialog(true)
  }

  const closeDialog = () => {
    setOpenDialog(false)
    setEditId(null)
    setForm({ title: '', description: '', status: 'todo', due_date: '', assigned_to: '', project: '' })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleUpdateTask = async () => {
    try {
      // Ensure assigned_to is sent as a number
      const payload = {
        ...form,
        assigned_to: Number(form.assigned_to),
        project: Number(form.project)
      }
      const res = await API.patch(`tasks/${editId}/`, payload)
      // Use assigned_to_detail for display
      const updatedTask = {
        ...res.data,
        assigned_to: res.data.assigned_to_detail || res.data.assigned_to,
        project: projects.find(p => Number(p.id) === (typeof res.data.project === 'object' ? res.data.project.id : Number(res.data.project))) || res.data.project
      }
      setTasks(prev => prev.map(t => t.id === editId ? updatedTask : t))
      closeDialog()
      alert('Task updated!');
    } catch (err) {
      alert('Failed to update task.')
    }
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await API.delete(`tasks/${id}/`)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert('Failed to delete task.')
    }
  }

  // Contributor: allow status update
  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await API.patch(`tasks/${task.id}/`, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: res.data.status } : t))
    } catch (err) {
      alert('Failed to update status.')
    }
  }

  return (
    <div>
      <h2>Tasks</h2>
      {isAdmin && (
        <button style={{ marginBottom: 16 }} onClick={openCreateDialog}>New Task</button>
      )}
      {isOpenDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2>{editId ? 'Update Task' : 'Assign New Task'}</h2>
            <input name="title" type="text" placeholder="Title" value={form.title} onChange={handleFormChange} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleFormChange} />
            <select name="status" value={form.status} onChange={handleFormChange}>
              <option value="todo">todo</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
            <input name="due_date" type="date" value={form.due_date} onChange={handleFormChange} />
            <select name="assigned_to" value={form.assigned_to} onChange={handleFormChange}>
              <option value="">Assign to...</option>
              {contributors.map(c => (
                <option key={c.id} value={c.id}>{c.username}</option>
              ))}
            </select>
            <select name="project" value={form.project} onChange={handleFormChange}>
              <option value="">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <div style={{ marginTop: 12 }}>
              {editId ? (
                <button style={{backgroundColor:'#ffb74d'}} onClick={handleUpdateTask}>Update Task</button>
              ) : (
                <button style={{backgroundColor:'#ffb74d'}} onClick={handleAssign}>Assign Task</button>
              )}
              <button style={{ marginLeft: 8 }} onClick={closeDialog}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ul>
        {tasks.map(task => {
          let contributorName = ''
          if (task.assigned_to && typeof task.assigned_to === 'object' && task.assigned_to.username) {
            contributorName = task.assigned_to.username
          } else if (task.assigned_to_detail && task.assigned_to_detail.username) {
            contributorName = task.assigned_to_detail.username
          } else if (task.assigned_to) {
            const found = contributors.find(c => c.id === (typeof task.assigned_to === 'object' ? task.assigned_to.id : task.assigned_to))
            contributorName = found ? found.username : task.assigned_to
          }
          let dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : ''
          return (
            <li key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <span style={{ marginLeft: 12, color: '#888' }}>{task.status}</span>
                <span style={{ marginLeft: 12, color: '#555' }}>Assigned to: {contributorName || 'Unassigned'}</span>
                <span style={{ marginLeft: 12, color: '#555' }}>Due: {dueDate}</span>
                {isAdmin && (
                  <>
                    <button style={{ marginLeft: 8, backgroundColor: 'green', color: 'white' }} onClick={() => openEditDialog(task)}>Update</button>
                    <button style={{ marginLeft: 8 }} onClick={() => handleDeleteTask(task.id)}>Delete</button>
                  </>
                )}
                {isContributor && (
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task, e.target.value)}
                    style={{ marginLeft: 12 }}
                  >
                    <option value="todo">todo</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                  </select>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
