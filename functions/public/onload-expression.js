;(function () {
  window._galaxyHashcard = function (card) {
    return new Promise(function (resolve, reject) {
      // https://docs.galaxpay.com.br/tokenizacao-cartao-js
      const token = window._galaxPayPublicToken
      const environment = !window._galaxPaySandbox
      var galaxPay = new GalaxPay(token, environment)
      const galaxpayCard = galaxPay.newCard({
        number: card.number,
        holder: card.name,
        expiresAt: '20' + card.year.toString() + '-' + card.month.toString(),
        cvv: card.cvc
      })
      console.log(galaxpayCard)
      galaxPay.hashCreditCard(galaxpayCard, function (hash) {
        return hash
      }, function (error) {
        return error
      })
        .then(resolve)
        .catch(reject)
    })
  }
}())
