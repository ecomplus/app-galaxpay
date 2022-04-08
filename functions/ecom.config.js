/* eslint-disable comma-dangle, no-multi-spaces, key-spacing */

/**
 * Edit base E-Com Plus Application object here.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/applications/
 */

const app = {
  app_id: 123188,
  title: 'Galax Pay',
  slug: 'galaxpay',
  type: 'external',
  state: 'active',
  authentication: true,

  /**
   * Uncomment modules above to work with E-Com Plus Mods API on Storefront.
   * Ref.: https://developers.e-com.plus/modules-api/
   */
  modules: {
    /**
     * Triggered to calculate shipping options, must return values and deadlines.
     * Start editing `routes/ecom/modules/calculate-shipping.js`
     */
    // calculate_shipping:   { enabled: true },

    /**
     * Triggered to validate and apply discount value, must return discount and conditions.
     * Start editing `routes/ecom/modules/apply-discount.js`
     */
    // apply_discount:       { enabled: true },

    /**
     * Triggered when listing payments, must return available payment methods.
     * Start editing `routes/ecom/modules/list-payments.js`
     */
    list_payments:        { enabled: true },

    /**
     * Triggered when order is being closed, must create payment transaction and return info.
     * Start editing `routes/ecom/modules/create-transaction.js`
     */
    create_transaction:   { enabled: true },
  },

  /**
   * Uncomment only the resources/methods your app may need to consume through Store API.
   */
  auth_scope: {
    'stores/me': [
      'GET'            // Read store info
    ],
    procedures: [
      'POST'           // Create procedures to receive webhooks
    ],
    products: [
      // 'GET',           // Read products with public and private fields
      // 'POST',          // Create products
      // 'PATCH',         // Edit products
      // 'PUT',           // Overwrite products
      // 'DELETE',        // Delete products
    ],
    brands: [
      // 'GET',           // List/read brands with public and private fields
      // 'POST',          // Create brands
      // 'PATCH',         // Edit brands
      // 'PUT',           // Overwrite brands
      // 'DELETE',        // Delete brands
    ],
    categories: [
      // 'GET',           // List/read categories with public and private fields
      // 'POST',          // Create categories
      // 'PATCH',         // Edit categories
      // 'PUT',           // Overwrite categories
      // 'DELETE',        // Delete categories
    ],
    customers: [
      // 'GET',           // List/read customers
      // 'POST',          // Create customers
      // 'PATCH',         // Edit customers
      // 'PUT',           // Overwrite customers
      // 'DELETE',        // Delete customers
    ],
    orders: [
      'GET',           // List/read orders with public and private fields
      'POST',          // Create orders
      'PATCH',         // Edit orders
      // 'PUT',           // Overwrite orders
      // 'DELETE',        // Delete orders
    ],
    carts: [
      // 'GET',           // List all carts (no auth needed to read specific cart only)
      // 'POST',          // Create carts
      // 'PATCH',         // Edit carts
      // 'PUT',           // Overwrite carts
      // 'DELETE',        // Delete carts
    ],

    /**
     * Prefer using 'fulfillments' and 'payment_history' subresources to manipulate update order status.
     */
    'orders/fulfillments': [
      // 'GET',           // List/read order fulfillment and tracking events
      // 'POST',          // Create fulfillment event with new status
      // 'DELETE',        // Delete fulfillment event
    ],
    'orders/payments_history': [
      // 'GET',           // List/read order payments history events
      'POST',          // Create payments history entry with new status
      // 'DELETE',        // Delete payments history entry
    ],

    /**
     * Set above 'quantity' and 'price' subresources if you don't need access for full product document.
     * Stock and price management only.
     */
    'products/quantity': [
      // 'GET',           // Read product available quantity
      // 'PUT',           // Set product stock quantity
    ],
    'products/variations/quantity': [
      // 'GET',           // Read variaton available quantity
      // 'PUT',           // Set variation stock quantity
    ],
    'products/price': [
      // 'GET',           // Read product current sale price
      // 'PUT',           // Set product sale price
    ],
    'products/variations/price': [
      // 'GET',           // Read variation current sale price
      // 'PUT',           // Set variation sale price
    ],

    /**
     * You can also set any other valid resource/subresource combination.
     * Ref.: https://developers.e-com.plus/docs/api/#/store/
     */
  },

  admin_settings: {
    galaxpay_id: {
      schema: {
        type: 'string',
        maxLength: 255,
        title: 'Galax ID',
        description: 'Seu ID de acesso a API do Galaxpay, solicitação via suporte https://docs.galaxpay.com.br/suporte'
      },
      hide: true
    },
    galaxpay_hash: {
      schema: {
        type: 'string',
        maxLength: 255,
        title: 'Galax Hash',
        description: 'Seu hash de acesso a API do Galaxpay, solicitação via suporte https://docs.galaxpay.com.br/suporte'
      },
      hide: true
    },
    galaxpay_sandbox: {
      schema: {
        type: 'boolean',
        title: 'Galaxpay Sandbox',
        description: 'Galaxpay API sandbox env'
      },
      hide: true
    },
    galaxpay_public_token: {
      schema: {
        type: 'string',
        maxLength: 255,
        title: 'Galax Public Token',
        description: 'Seu Public Token para Tokenização de Cartão, disponivél no Dashbord do GalaxPay, sessão de modulos, configuração de WebServices'
      },
      hide: false
    },
    galaxpay_subscription_label: {
      schema: {
        type: 'string',
        maxLength: 50,
        title: 'Rótulo para assinatura',
        description: 'Exibido para os clientes junto ao nome da forma de pagamento',
        default: 'Assinatura'
      },
      hide: false
    },
    credit_card: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          disable: {
            type: 'boolean',
            title: 'Desabilitar cartão',
            description: 'Desabilitar pagamento com cartão via Galaxpay'
          },
          label: {
            type: 'string',
            maxLength: 50,
            title: 'Rótulo',
            description: 'Nome da forma de pagamento exibido para os clientes',
            default: 'Cartão de crédito'
          },
          text: {
            type: 'string',
            maxLength: 1000,
            title: 'Descrição',
            description: 'Texto auxiliar sobre a forma de pagamento, pode conter tags HTML'
          },
          icon: {
            type: 'string',
            maxLength: 255,
            format: 'uri',
            title: 'Ícone',
            description: 'Ícone customizado para a forma de pagamento, URL da imagem'
          }
        },
        title: 'Cartão de crédito',
        description: 'Configurações adicionais para cartão de crédito'
      },
      hide: false
    },
    banking_billet: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          disable: {
            type: 'boolean',
            title: 'Desabilitar boleto',
            description: 'Desabilitar pagamento com boleto bancário via Galaxpay'
          },
          label: {
            type: 'string',
            maxLength: 50,
            title: 'Rótulo',
            description: 'Nome da forma de pagamento exibido para os clientes',
            default: 'Boleto bancário'
          },
          text: {
            type: 'string',
            maxLength: 1000,
            title: 'Descrição',
            description: 'Texto auxiliar sobre a forma de pagamento, pode conter tags HTML'
          },
          icon: {
            type: 'string',
            maxLength: 255,
            format: 'uri',
            title: 'Ícone',
            description: 'Ícone customizado para a forma de pagamento, URL da imagem'
          },
          add_days: {
            type: 'integer',
            default: 0,
            title: 'Prazo',
            description: 'Prazo em DIAS para o primeiro pagamento'
          }
        },
        title: 'Boleto bancário',
        description: 'Configurações adicionais para boleto bancário'
      },
      hide: false
    },
    pix: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          disable: {
            type: 'boolean',
            default: true,
            title: 'Desabilitar PIX',
            description: 'Desabilitar pagamento com PIX via Galaxpay'
          },
          label: {
            type: 'string',
            maxLength: 50,
            title: 'Rótulo',
            description: 'Nome da forma de pagamento exibido para os clientes',
            default: 'PIX'
          },
        }
      }
    },
    plan_recurrence: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          disable: {
            type: 'boolean',
            title: 'Desabilitar plano de recorrência',
            description: 'Desabilitar recorrência via Galaxpay'
          },
          periodicity: {
            type: 'string',
            enum: [
              'Semanal',
              'Quinzenal',
              'Mensal',
              'Bimestral',
              'Trimestral',
              'Semestral',
              'Anual'
            ],
            default: 'Mensal',
            title: 'Periodicidade da recorrência',
            description: 'Definir a periodicidade da recorrência. Ex.: quinzenal, mensal, anual '
          },
          quantity: {
            type: 'number',
            default: 0,
            title: 'Quantidade da recorrência',
            description: 'Definir a quantidade da recorrência. Para as assinaturas continuar criando transações indefinidamente até ser canceladas, difina valor 0. OBS.: Valores diferente de 0 (zero) não disponivél no momento'
          },
        },
        title: 'Plano de recorrência',
        description: 'Configurações para cobranças por recorrência'
      },
      hide: false
    },
    plans: {
      schema: {
        title: 'Planos de Recorrência - (Não Disponível)',
        description: 'Criar tipos de planos para recorrência. OBS: Funcionalidade ainda não disponível para uso',
        type: 'array',
        maxItems: 10,
        items: {
          title: 'Plano',
          type: 'object',
          minProperties: 1,
          properties: {
            label: {
              type: 'string',
              maxLength: 100,
              title: 'Plano',
              description: 'Texto definir um nome para o plano'
            },
            periodicity: {
              type: 'string',
              enum: [
                'Semanal',
                'Quinzenal',
                'Mensal',
                'Bimestral',
                'Trimestral',
                'Semestral',
                'Anual'
              ],
              default: 'Mensal',
              title: 'Periodicidade da recorrência',
              description: 'Definir a periodicidade da recorrência. Ex.: quinzenal, mensal, anual '
            },
            quantity: {
              type: 'number',
              default: 0,
              title: 'Quantidade da recorrência',
              description: 'Definir a quantidade da recorrência. Para as assinaturas continuar criando transações indefinidamente até ser canceladas, difina valor 0'
            },
            discount: {
              title: 'Desconto',
              type: 'object',
              required: [
                'value'
              ],
              properties: {
                percentage: {
                  type: 'boolean',
                  default: false,
                  title: 'Desconto percentual'
                },
                value: {
                  type: 'number',
                  minimum: -99999999,
                  maximum: 99999999,
                  title: 'Valor do desconto',
                  description: 'Valor percentual/fixo do desconto ou acréscimo (negativo)'
                },
                apply_at: {
                  type: 'string',
                  enum: [
                    'total',
                    'subtotal',
                    'frete'
                  ],
                  default: 'subtotal',
                  title: 'Aplicar desconto em',
                  description: 'Em qual valor o desconto deverá ser aplicado no checkout'
                }
              }
            }
          }
        }
      }
    }

    /**
     * JSON schema based fields to be configured by merchant and saved to app `data` / `hidden_data`, such as:

    webhook_uri: {
      schema: {
        type: 'string',
        maxLength: 255,
        format: 'uri',
        title: 'Notifications URI',
        description: 'Unique notifications URI available on your Custom App dashboard'
      },
      hide: true
    }

     token: {
       schema: {
         type: 'string',
         maxLength: 50,
         title: 'App token'
       },
       hide: true
     },
     opt_in: {
       schema: {
         type: 'boolean',
         default: false,
         title: 'Some config option'
       },
       hide: false
     },

     */
  }
}

/**
 * List of Procedures to be created on each store after app installation.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/procedures/
 */

const procedures = []

// Uncomment and edit code above to configure `triggers` and receive respective `webhooks`:

const { baseUri } = require('./__env')

procedures.push({
  title: app.title,

  triggers: [
    // Receive notifications when order status are set or changed:
    {
      resource: 'orders',
      field: 'status',
    },
  ],

  webhooks: [
    {
      api: {
        external_api: {
          uri: `${baseUri}/ecom/webhook`
        }
      },
      method: 'POST'
    }
  ]
})

//  You may also edit `routes/ecom/webhook.js` to treat notifications properly.

exports.app = app

exports.procedures = procedures
