/* Simple To-Do app using localStorage
   Junior-style: many comments, straightforward functions, TODOs for improvements
*/

const STORAGE_KEY = 'todo_tasks_v1' // change key when data model changes

// DOM elements
const form = document.getElementById('task-form')
const input = document.getElementById('task-input')
const listEl = document.getElementById('task-list')
const countEl = document.getElementById('count')
const filterButtons = document.querySelectorAll('.filter-btn')
const clearCompletedBtn = document.getElementById('clear-completed')

// In-memory list (kept in sync with localStorage)
let tasks = []
let filter = 'all' // one of: all, active, completed

// Load tasks from localStorage on start
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) tasks = parsed
  } catch (err) {
    // If parsing fails, just start fresh (junior-friendly)
    console.error('Failed to load tasks', err)
    tasks = []
  }
}

// Save tasks to localStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (err) {
    console.error('Failed to save tasks', err)
  }
}

// Create a new task object
function createTask(text) {
  return {
    id: `${Date.now()}_${Math.floor(Math.random()*10000)}`, // simple unique id
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  }
}

// Render tasks according to current filter
function render() {
  // Clear list
  listEl.innerHTML = ''

  // Filter tasks
  const visible = tasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
  })

  // Build DOM elements
  visible.forEach(task => {
    const li = document.createElement('li')
    li.className = 'task-item' + (task.completed ? ' completed' : '')
    li.dataset.id = task.id

    // Checkbox
    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.checked = task.completed
    cb.addEventListener('change', () => toggleComplete(task.id))

    // Text container (supports edit on double click)
    const textDiv = document.createElement('div')
    textDiv.className = 'text'
    textDiv.textContent = task.text
    textDiv.title = 'Double-click to edit'
    textDiv.addEventListener('dblclick', () => startEdit(task, textDiv))

    // Timestamp small
    const ts = document.createElement('small')
    ts.className = 'muted'
    // show only date/time simple format
    ts.textContent = new Date(task.createdAt).toLocaleString()

    // Edit button
    const editBtn = document.createElement('button')
    editBtn.title = 'Edit'
    editBtn.innerHTML = '✏️'
    editBtn.addEventListener('click', () => startEdit(task, textDiv))

    // Delete button
    const delBtn = document.createElement('button')
    delBtn.title = 'Delete'
    delBtn.innerHTML = '🗑️'
    delBtn.addEventListener('click', () => deleteTask(task.id))

    // Append children
    li.appendChild(cb)
    li.appendChild(textDiv)
    li.appendChild(ts)
    li.appendChild(editBtn)
    li.appendChild(delBtn)

    listEl.appendChild(li)
  })

  // Update count
  const remaining = tasks.filter(t => !t.completed).length
  countEl.textContent = `${remaining} task(s) left`
}

// Toggle completed state
function toggleComplete(id) {
  const t = tasks.find(x => x.id === id)
  if (!t) return
  t.completed = !t.completed
  saveTasks()
  render()
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id)
  saveTasks()
  render()
}

// Start in-place edit: replace text with input
function startEdit(task, textDiv) {
  const inputEdit = document.createElement('input')
  inputEdit.type = 'text'
  inputEdit.className = 'edit-input'
  inputEdit.value = task.text

  // Replace textDiv content with input
  textDiv.innerHTML = ''
  textDiv.appendChild(inputEdit)
  inputEdit.focus()
  // Move cursor to end
  inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length)

  function finish(save) {
    if (save) {
      const val = inputEdit.value.trim()
      if (val.length === 0) {
        // If empty, treat as delete (simple policy)
        deleteTask(task.id)
        return
      }
      task.text = val
      saveTasks()
      render()
    } else {
      render()
    }
  }

  inputEdit.addEventListener('blur', () => finish(true))
  inputEdit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true)
    if (e.key === 'Escape') finish(false)
  })
}

// Add a new task (from form)
function addTask(text) {
  const t = createTask(text)
  tasks.unshift(t) // newest first
  saveTasks()
  render()
}

// Clear completed tasks
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed)
  saveTasks()
  render()
}

// Setup filter buttons
function setupFilters() {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      filter = btn.dataset.filter
      render()
    })
  })
}

// Initialize app
function init() {
  loadTasks()
  setupFilters()
  render()

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) return
    addTask(text)
    input.value = ''
    input.focus()
  })

  // Clear completed
  clearCompletedBtn.addEventListener('click', () => {
    clearCompleted()
  })
}

// Run
init()

/* TODO:
 - Add persistence versioning / migration if storage schema changes
 - Add drag-and-drop reorder (for later)
 - Add categories / due dates / reminders
 - Add tests (jest) for logic functions
*/
