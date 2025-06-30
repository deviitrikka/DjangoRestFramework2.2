import React, { useEffect, useState } from 'react'
import API from '../api'
import './ProjectList.css'

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const [isOpenDialog, setOpenDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    API.get('projects/').then(res => setProjects(res.data.results))
  }, [])

  const handleCreateProject = async () => {
    try {
      const response = await API.post('projects/', { title, description });
      setProjects(prev => [response.data, ...prev]);
      closeDialog();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async () => {
    try {
      const response = await API.patch(`projects/${editId}/`, { title, description });
      setProjects(prev => prev.map(p => p.id === editId ? response.data : p));
      closeDialog();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`projects/${id}/`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const openDialog = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setOpenDialog(true);
  }

  const openEditDialog = (project) => {
    setEditId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setOpenDialog(true);
  }

  const closeDialog = () => {
    setOpenDialog(false);
    setTitle('');
    setDescription('');
    setEditId(null);
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h2 style={{ margin: 0 }}>Projects</h2>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="open-dialog-btn"
            onClick={openDialog}
            style={{ alignSelf: 'flex-start' }}
          >
            Add New Project
          </button>
        </div>
      </div>
      {isOpenDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2>{editId ? 'Update Project' : 'Create New Project'}</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
            />
            <div className="button-group">
              {editId ? (
                <button style={{backgroundColor:'#ffb74d'}} onClick={handleUpdateProject}>Update Project</button>
              ) : (
                <button style={{backgroundColor:'#ffb74d'}} onClick={handleCreateProject}>Create Project</button>
              )}
              <button onClick={closeDialog}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ul>
        {Array.isArray(projects) && projects.map(p => (
          <li key={p.id}>
            <div>
              <strong>{p.title}</strong>
              <div style={{ color: '#666', fontSize: '0.95em', marginTop: 4 }}>{p.description}</div>
              <button style={{backgroundColor:'green', color:'white'}} onClick={() => openEditDialog(p)}>Update</button>
              <button style={{marginLeft:8}} onClick={() => handleDeleteProject(p.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
