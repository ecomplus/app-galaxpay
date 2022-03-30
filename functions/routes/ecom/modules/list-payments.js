const { hostingUri } = require('../../../__env')
const fs = require('fs')
const path = require('path')
const { parsePeriodicity } = require('./../../../lib/galaxpay/parse-to-ecom')
const { handleGateway, discountPlan } = require('../../../lib/payments/handle-plans')

exports.post = ({ appSdk }, req, res) => {
  /**
   * Requests coming from Modules API have two object properties on body: `params` and `application`.
   * `application` is a copy of your app installed by the merchant,
   * including the properties `data` and `hidden_data` with admin settings configured values.
   * JSON Schema reference for the List Payments module objects:
   * `params`: https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
   * `response`: https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
   *
   * Examples in published apps:
   * https://github.com/ecomplus/app-pagarme/blob/master/functions/routes/ecom/modules/list-payments.js
   * https://github.com/ecomplus/app-custom-payment/blob/master/functions/routes/ecom/modules/list-payments.js
   */

  const { params, application } = req.body
  const { storeId } = req
  // setup basic required response object
  const response = {
    payment_gateways: []
  }
  // merge all app options configured by merchant
  const appData = Object.assign({}, application.data, application.hidden_data)

  /* DO THE STUFF HERE TO FILL RESPONSE OBJECT WITH PAYMENT GATEWAYS */

  /**
   * Sample snippets:

  // add new payment method option
  response.payment_gateways.push({
    intermediator: {
      code: 'paupay',
      link: 'https://www.palpay.com.br',
      name: 'paupay'
    },
    payment_url: 'https://www.palpay.com.br/',
    type: 'payment',
    payment_method: {
      code: 'banking_billet',
      name: 'Boleto Bancário'
    },
    label: 'Boleto Bancário',
    expiration_date: appData.expiration_date || 14
  })

  */
  let amount = params.amount || {}

  if (!appData.galaxpay_id || !appData.galaxpay_hash) {
    return res.status(409).send({
      error: 'NO_GALAXPAY_KEYS',
      message: 'GalaxPay ID e/ou GalaxPay Hash da API indefinido(s) (lojista deve configurar o aplicativo)'
    })
  }
  const isSandbox = appData.galaxpay_sandbox

  // common payment methods data
  const intermediator = {
    name: 'GalaxPay',
    link: `https://api.${isSandbox ? 'sandbox.cloud.' : ''}galaxpay.com.br/v2`,
    code: 'galaxpay_app'
  }
  const paymentTypes = []
  if ((appData.plan_recurrence && !appData.plan_recurrence.disable) || appData.plans) {
    paymentTypes.push('recurrence')
  }

  // setup payment gateway objects
  ;['credit_card', 'banking_billet'].forEach(paymentMethod => {
    paymentTypes.forEach(type => {
      const methodConfig = appData[paymentMethod] || {}
      if (!methodConfig.disable) {
        const plans = handleGateway(appData)
        console.log('> store ', storeId)
        plans.forEach(plan => {
          console.log('> test ', plan.periodicity)

          const isCreditCard = paymentMethod === 'credit_card'
          let label = methodConfig.label || (isCreditCard ? 'Cartão de crédito' : 'Boleto bancário')

          const periodicity = parsePeriodicity(plan.periodicity)
          const planName = plan.label ? plan.label : 'Plano'

          if (type === 'recurrence' && planName) {
            label = planName + ' ' + periodicity + ' ' + label
          }
          const gateway = {
            label,
            icon: methodConfig.icon,
            text: methodConfig.text,
            payment_method: {
              code: paymentMethod,
              name: `${label} - ${intermediator.name}`
            },
            type,
            intermediator
          }

          if (isCreditCard) {
            if (!gateway.icon) {
              gateway.icon = `${hostingUri}/credit-card.png`
            }
            // https://docs.galaxpay.com.br/tokenizacao-cartao-js
            gateway.js_client = {
              script_uri: 'https://js.galaxpay.com.br/checkout.min.js',
              onload_expression: `window._galaxPayPublicToken="${appData.galaxpay_public_token}";  window._galaxPaySandbox="${appData.galaxpay_sandbox}";` +
                fs.readFileSync(path.join(__dirname, '../../../public/onload-expression.js'), 'utf8'),
              cc_hash: {
                function: '_galaxyHashcard',
                is_promise: true
              }
            }
          }
          const discount = discountPlan(label, plan.discount, amount)
          console.log('> discount ', discount)
          // amount = discount.amount
          // gateway.discount = plan.discount
          // response.discount_option = discount.discountOption
          response.payment_gateways.push(gateway)
        })
      }
    })
  })
  res.send(response)
}
