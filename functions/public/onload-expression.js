;(function () {
  window._galaxyHashcard = function (card) {
    return new Promise(function (resolve, reject) {
      // https://docs.galaxpay.com.br/tokenizacao-cartao-js
      const token = window._galaxPayPublicToken
      const environment = !window._galaxPaySandbox
      const galaxpay = new GalaxPay(token, environment)
      const galaxpayCard = galaxpay.newCard({
        number: card.number,
        holder: card.name,
        expiresAt: '20' + card.year.toString() + '-' + card.month.toString(),
        cvv: card.cvc
      })
      galaxpay.hashCreditCard(galaxpayCard, function (hash) {
        console.log('hash OK')
        return hash
      }, function (error) {
        console.log('Erro hash')
        return error
      })
        .then(resolve)
        .catch(reject)
    })
  }
}())
