// src/contexts/TaskContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'

const TaskContext = createContext()

export function useTask() {
  return useContext(TaskContext)
}

export function TaskProvider({ children }) {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Listen to tasks in real-time
  useEffect(() => {
    if (!currentUser) {
      setTasks([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const taskList = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
            return timeB - timeA
          })
        setTasks(taskList)
        setLoading(false)
      },
      (err) => {
        console.error('Task listener error:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [currentUser])

  // Listen to categories in real-time
  useEffect(() => {
    if (!currentUser) {
      setCategories([])
      return
    }

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        setCategories(list)
      },
      (err) => {
        console.error('Category listener error:', err)
      }
    )

    return unsubscribe
  }, [currentUser])

  async function addTask(taskData) {
    return addDoc(collection(db, 'tasks'), {
      ...taskData,
      subtasks: taskData.subtasks || [],
      userId: currentUser.uid,
      status: taskData.status || 'todo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateTask(taskId, taskData) {
    const taskRef = doc(db, 'tasks', taskId)
    return updateDoc(taskRef, {
      ...taskData,
      subtasks: taskData.subtasks || [],
      updatedAt: serverTimestamp(),
    })
  }

  async function deleteTask(taskId) {
    return deleteDoc(doc(db, 'tasks', taskId))
  }

  async function updateTaskStatus(taskId, status) {
    return updateDoc(doc(db, 'tasks', taskId), {
      status,
      updatedAt: serverTimestamp(),
    })
  }

  // Toggle single subtask status
  async function toggleSubtask(taskId, subtaskId) {
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask) return

    const currentSubtasks = targetTask.subtasks || []
    const updatedSubtasks = currentSubtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )

    // If all subtasks are completed and there is at least 1 subtask, auto mark task as done
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed)
    const newStatus = allDone && targetTask.status !== 'done' ? 'done' : targetTask.status

    const taskRef = doc(db, 'tasks', taskId)
    return updateDoc(taskRef, {
      subtasks: updatedSubtasks,
      status: newStatus,
      updatedAt: serverTimestamp(),
    })
  }

  // Add a subtask to an existing task
  async function addSubtaskToTask(taskId, text) {
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask) return

    const newSubtask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text: text.trim(),
      completed: false,
    }

    const updatedSubtasks = [...(targetTask.subtasks || []), newSubtask]
    const taskRef = doc(db, 'tasks', taskId)
    return updateDoc(taskRef, {
      subtasks: updatedSubtasks,
      updatedAt: serverTimestamp(),
    })
  }

  // Delete a subtask from an existing task
  async function removeSubtaskFromTask(taskId, subtaskId) {
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask) return

    const updatedSubtasks = (targetTask.subtasks || []).filter((st) => st.id !== subtaskId)
    const taskRef = doc(db, 'tasks', taskId)
    return updateDoc(taskRef, {
      subtasks: updatedSubtasks,
      updatedAt: serverTimestamp(),
    })
  }

  // Category CRUD
  async function addCategory(name, color) {
    return addDoc(collection(db, 'categories'), {
      name,
      color,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteCategory(categoryId) {
    return deleteDoc(doc(db, 'categories', categoryId))
  }

  // Calculate total subtasks metrics
  let totalSubtasks = 0
  let completedSubtasks = 0
  tasks.forEach((t) => {
    if (Array.isArray(t.subtasks)) {
      totalSubtasks += t.subtasks.length
      completedSubtasks += t.subtasks.filter((st) => st.completed).length
    }
  })

  // Stats derived from tasks
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'inprogress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'
    ).length,
    totalSubtasks,
    completedSubtasks,
    subtaskRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0,
  }

  const value = {
    tasks,
    categories,
    loading,
    stats,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    toggleSubtask,
    addSubtaskToTask,
    removeSubtaskFromTask,
    addCategory,
    deleteCategory,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
