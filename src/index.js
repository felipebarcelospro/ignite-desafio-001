const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(401).send({ error: 'User not found' })
  }

  request.loggedUser = user
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(user => user.username === username)

  if(userAlreadyExists) {
    return response.status(400).send({ error: 'User already exists' })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)
  
  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { loggedUser } = request

  return response.json(loggedUser.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username)

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  users[userIndex].todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { username } = request.headers
  const { loggedUser } = request

  const userIndex = users.findIndex(user => user.username === username)
  const todoIndex = loggedUser.todos.findIndex(todo => todo.id === id)

  if(!users[userIndex].todos[todoIndex]) {
    return response.status(404).send({ error: 'Todo not found' })
  }
  
  users[userIndex].todos[todoIndex].title = title
  users[userIndex].todos[todoIndex].deadline = deadline

  return response.status(201).send(users[userIndex].todos[todoIndex])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const { loggedUser } = request

  const userIndex = users.findIndex(user => user.username === username)
  const todoIndex = loggedUser.todos.findIndex(todo => todo.id === id)

  if(!users[userIndex].todos[todoIndex]) {
    return response.status(404).send({ error: 'Todo not found' })
  }
  
  users[userIndex].todos[todoIndex].done = true

  return response.status(201).send(users[userIndex].todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const { loggedUser } = request

  const userIndex = users.findIndex(user => user.username === username)
  const todoIndex = loggedUser.todos.findIndex(todo => todo.id === id)

  if(!users[userIndex].todos[todoIndex]) {
    return response.status(404).send({ error: 'Todo not found' })
  }
  
  users[userIndex].todos.splice(todoIndex, 1)

  return response.status(204).send()
});

module.exports = app;