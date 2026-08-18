import express from 'express'
import db from './db.js';

const server = express()
console.log(process.env.PORT);



const port = process.env.PORT || 3000
server.listen(port, ()=>console.log(`http://localhost:${port}`))