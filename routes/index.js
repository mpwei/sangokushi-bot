const express = require('express')
const router = express.Router()

router.get('/', function(req, res) {
  return res.status(401).send({
    code: 401,
    message: 'Forbidden'
  })
})

module.exports = router
