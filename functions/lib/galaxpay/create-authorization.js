module.exports = (hashLogin, isSandbox, hashPartner) => new Promise((resolve, reject) => {
  // https://docs.galaxpay.com.br/autenticacao
  // https://docs.galaxpay.com.br/auth/token
  let accessToken
  const axios = require('./create-axios')(accessToken, isSandbox)
  const request = isRetry => {
    const headers = { Authorization: `Basic ${hashLogin}` }

    console.log('> hash Partner: ', hashPartner, ' isSandBox ', isSandbox)
    if (hashPartner && hashPartner !== '' && !isSandbox) {
      headers.AuthorizationPartner = hashPartner
    }

    axios.post('/token', {
      grant_type: 'authorization_code',
      scope: 'customers.read customers.write plans.read plans.write transactions.read transactions.write webhooks.write cards.read cards.write card-brands.read subscriptions.read subscriptions.write charges.read charges.write boletos.read'
    }, { headers })
      .then(({ data }) => resolve(data.access_token))
      .catch(err => {
        console.log('> Err ', err)
        if (!isRetry && err.response && err.response.status >= 429) {
          setTimeout(() => request(true), 7000)
        }
        reject(err)
      })
  }
  console.log('> hashLogin ', hashLogin, ' > isSandBox ', isSandbox)
  if (hashLogin && isSandbox) {
    request()
  }
})
