const axios = require('axios')
module.exports = (accessToken, isSandbox) => {
  // https://docs.galaxpay.com.br/autenticacao
  // https://docs.galaxpay.com.br/auth/token

  const headers = {
    'Content-Type': 'application/json'
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken.accessToken}`
  }
  console.log('token ', { headers })
  return axios.create({
    baseURL: `https://api.${isSandbox ? 'sandbox.cloud.' : ''}galaxpay.com.br/v2`,
    headers
  })
}
