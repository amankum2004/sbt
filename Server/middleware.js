const jwt = require('jsonwebtoken')

const allowedLvl = (level) => {
  if (level === 'admin') {
    return ['admin']
  }
  if (level === 'shopOwner') {
    return ['admin', 'shopOwner']
  }
  if (level === 'customer') {
    return ['admin', 'customer']
  }
//   if (level === 'ticketvolunteer') {
//     return ['admin', 'volunteer', 'movievolunteer', 'ticketvolunteer']
//   }
//   return ['admin', 'volunteer', 'movievolunteer', 'ticketvolunteer', 'standard']
}

const isAllowedLvl = (minLevel, userType) =>
  allowedLvl(minLevel).includes(userType)

const verifyJWTWithRole = (minRole = 'customer') => {
  return (req, res, next) => {
    const token = req.cookies?.token
    if (token) {
      jwt.verify(
        token,
        `${process.env.JWT_SECRET || 'secret'}`,
        (err, user) => {
          if (err) {
            res.cookies('token', '', { maxAge: 0 })
            return res.sendStatus(403)
          }
          if (!isAllowedLvl(minRole, user.usertype)) {
            return res.sendStatus(403)
          }
          req.user = user
          console.log('by user', user.email)
          next()
        }
      )
    } else {
      res.sendStatus(401)
    }
  }
}

module.exports = { verifyJWTWithRole, isAllowedLvl }
