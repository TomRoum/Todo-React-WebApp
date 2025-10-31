import express from 'express'
import cors from 'cors'
import pkg from 'pg'

const port = 3001
const { Pool } = pkg
const app = express()

app.use(cors())

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
      console.error('Database error:', err)  // ADD THIS - logs full error to console
      return res.status(500).json({error: err.message})
    }
    res.status(200).json(result.rows)
  })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})