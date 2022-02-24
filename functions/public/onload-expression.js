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
        expiresAt: card.month.toString() + card.year.toString(),
        cvv: card.cvc
      })
      window.galaxpay.hasCreditCard(galaxpayCard, function (hash) {
        return hash
      }, function (error) {
        return error
      })
        .then(resolve)
        .catch(reject)
    })
  }
}())
