const jwt = require('jsonwebtoken')
const prisma = require('./utils/prisma')

const allowedLvl = (level) => {
  if (level === 'admin') {
    return ['admin']
  }
  if (level === 'shopOwner') {
    return ['admin', 'shopOwner']
  }
  if (level === 'customer') {
    return ['admin', 'customer','shopOwner']
  }
}

const isAllowedLvl = (minLevel, usertype) =>
  allowedLvl(minLevel).includes(usertype)

const verifyJWTWithRole = (minRole = 'customer') => {
  return async (req, res, next) => {
    const token = req.cookies?.token
    if (token) {
      try {
        const user = jwt.verify(
          token,
          `${process.env.JWT_SECRET || 'secret'}`
        )
        if (!isAllowedLvl(minRole, user.usertype)) {
          return res.sendStatus(403)
        }
        const existingUser = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { isDeleted: true },
        })
        if (!existingUser || existingUser.isDeleted) {
          return res.sendStatus(401)
        }
        req.user = user
        console.log('by user', user.email)
        next()
      } catch (err) {
        res.cookies('token', '', { maxAge: 0 })
        return res.sendStatus(403)
      }
    } else {
      res.sendStatus(401)
    }
  }
}

module.exports = { verifyJWTWithRole, isAllowedLvl }
