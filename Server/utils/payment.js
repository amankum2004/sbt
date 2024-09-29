// const crypto = require('crypto')
// require('dotenv').config()
// const resHashKey = `${process.env.RES_HASH_KEY}`

// const req_enc_key = `${process.env.REQ_ENC_KEY}`
// const req_salt = `${process.env.REQ_SALT}`
// const res_dec_key = `${process.env.RES_DEC_KEY}`
// const res_salt = `${process.env.RES_SALT}`

// const algorithm = 'aes-256-cbc'
// const password = Buffer.from(req_enc_key, 'utf8')
// const salt = Buffer.from(req_salt, 'utf8')
// const respassword = Buffer.from(res_dec_key, 'utf8')
// const ressalt = Buffer.from(res_salt, 'utf8')
// const iv = Buffer.from(
//   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
//   'utf8'
// )

// const encrypt = (text) => {
//   var derivedKey = crypto.pbkdf2Sync(password, salt, 65536, 32, 'sha512')
//   const cipher = crypto.createCipheriv(algorithm, derivedKey, iv)
//   let encrypted = cipher.update(text)
//   encrypted = Buffer.concat([encrypted, cipher.final()])
//   return `${encrypted.toString('hex')}`
// }

// const decrypt = (text) => {
//   const encryptedText = Buffer.from(text, 'hex')
//   var derivedKey = crypto.pbkdf2Sync(respassword, ressalt, 65536, 32, 'sha512')
//   const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv)
//   let decrypted = decipher.update(encryptedText)
//   decrypted = Buffer.concat([decrypted, decipher.final()])
//   return decrypted.toString()
// }

// const generateSignature = (json) => {
//   var signatureString =
//     json.merchDetails.merchId.toString() +
//     json.payDetails.atomTxnId +
//     json.merchDetails.merchTxnId.toString() +
//     json.payDetails.totalAmount.toFixed(2).toString() +
//     json.responseDetails.statusCode.toString() +
//     json.payModeSpecificData.subChannel[0].toString() +
//     json.payModeSpecificData.bankDetails.bankTxnId.toString()
//   var hmac = crypto.createHmac('sha512', resHashKey)
//   data = hmac.update(signatureString)
//   gen_hmac = data.digest('hex')
//   return gen_hmac
// }

// module.exports = {
//   encrypt,
//   decrypt,
//   generateSignature
// }
