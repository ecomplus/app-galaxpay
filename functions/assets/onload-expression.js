; (function () {
  window._galaxyHashcard = function (card) {
    return new Promise(function (resolve, reject) {
      // https://docs.galaxpay.com.br/tokenizacao-cartao-js
      const token = window._galaxPayPublicToken
      // const environment = false // !window._galaxPaySandbox // false = sandbox, true = production
      const isSandbox = window._galaxPaySandbox
      const galaxPay = new GalaxPay(token)
      if (isSandbox) {
        galaxPay._setApiUrl('https://api.sandbox.cloud.galaxpay.com.br/v2')
      }
      const galaxpayCard = galaxPay.newCard({
        number: card.number,
        holder: card.name,
        expiresAt: '20' + card.year.toString() + '-' + card.month.toString(),
        cvv: card.cvc
      })
      galaxPay.hashCreditCard(galaxpayCard, function (hash) {
        resolve(hash)
      }, function (error) {
        reject(error)
      })
    })
  }
}())
