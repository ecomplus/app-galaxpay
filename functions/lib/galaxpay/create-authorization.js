const axios = require('axios')

module.exports = async (galaxpay_id,galaxpay_hash, isSandbox) => { 
  // https://docs.galaxpay.com.br/autenticacao
  //https://docs.galaxpay.com.br/auth/token
  let data_token
  await axios({
    url: `https://api.${isSandbox ? 'sandbox.cloud.':'' }galaxpay.com.br/v2/token`,
    method: 'post',
    headers : {
      Authorization: 'Basic ' + Buffer.from(`${galaxpay_id}:${galaxpay_hash}`).toString('base64')
    },
    data: {
      grant_type: 'authorization_code',
      scope: 'customers.read customers.write plans.read plans.write transactions.read transactions.write webhooks.write cards.read cards.write card-brands.read subscriptions.read subscriptions.write charges.read charges.write boletos.read'
    }
  })
    .then(({ data }) => {
      data_token = {
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in
      }
    })
    .catch(err => {
      console.log(err)
   })

   return data_token
}
