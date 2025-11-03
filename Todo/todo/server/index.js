import express from 'express'
import cors from 'cors'
import pkg from 'pg'

const port = 3001
const { Pool } = pkg
const app = express()

app.use(cors())
app.use(express.json())

const openDb = () => {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'todo',
    password: 'Grass25',
    port: 5432
  })
  return pool
}

app.get('/', (req, res) => {
  const pool = openDb()
  pool.query('SELECT * FROM task', (err, result) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({error: err.message})
    }
    res.status(200).json(result.rows)
  })
})

app.post('/create', (req, res) => {
  const { task } = req.body
  
  if (!task || !task.description) {
    return res.status(400).json({ error: 'Task description is required' })
  }

  const pool = openDb()
  pool.query(
    'INSERT INTO task (description) VALUES ($1) RETURNING *',
    [task.description],
    (err, result) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: err.message })
      }
      res.status(201).json(result.rows[0])
    }
  )
})

app.delete('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id)
  
  const pool = openDb()
  pool.query(
    'DELETE FROM task WHERE id = $1 RETURNING id',
    [id],
    (err, result) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: err.message })
      }
      res.status(200).json(result.rows[0])
    }
  )
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})