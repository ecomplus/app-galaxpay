
const authorization = require('./create-authorization')
const axios = require('axios')

module.exports = async (galaxpay_id,galaxpay_hash, isSandbox) => { 
  // https://docs.galaxpay.com.br/autenticacao
  //https://docs.galaxpay.com.br/auth/token
  
  const galaxpay_access_token = await authorization(galaxpay_id,galaxpay_hash,isSandbox)
    
  return axios.create({
    baseURL : `https://api.${isSandbox ? 'sandbox.cloud.':''}galaxpay.com.br/v2`,
    headers: {
      Authorization : `${galaxpay_access_token.token_type} ${galaxpay_access_token.access_token}`
    }
  })

}