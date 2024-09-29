const express = require('express')
const router = express.Router()
const {
  fetchUsers,
  updateUserType,
  userType
} = require('@/controllers/user/user-controller')
const { verifyJWTWithRole } = require('@/middleware')

router.get('/fetchusers', verifyJWTWithRole(), fetchUsers)
router.post('/updateUserType', verifyJWTWithRole('admin'), updateUserType)
router.get('/:email', verifyJWTWithRole(), userType)
module.exports = router
