# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/ecomplus/application-starter/compare/v1.1.2...v2.0.0) (2023-06-07)


### ⚠ BREAKING CHANGES

* updating app authentication scope and procedures

* feat(webhook ecom): Update subscription with product value/quantity

* fix(webhook ecom): remove unnecessary logs

* fix(webhook ecom): remove unnecessary logs

* fix(webhook ecom): remove unnecessary comments

* fix(webhook galaxpay): On new order set stock status on item as pending

* fix(update subscription): Updates signature in galaxpay and saves items in firebase if there is a value change

* fix(webhook ecom): fix the query and remove unnecessary logs

* fix(webhook ecom): correct the query and remove unnecessary comments

* Update functions/ecom.config.js

[skip ci]

* fix(Webhook ecom): Fix product variation search error

* fix(webhook ecom): Check the values before any changes

### Features

* update subscription value on items quantity/price change ([#59](https://github.com/ecomplus/application-starter/issues/59)) ([15883b0](https://github.com/ecomplus/application-starter/commit/15883b0008ef697acec19ce7c0abd56edc2b9a3b))
* **update-subscription:** receive item edit webhook to change subscription ([4cc2b50](https://github.com/ecomplus/application-starter/commit/4cc2b50e06fdbba796a5655a2fd900b039693f23))


### Bug Fixes

* **deps:** update all non-major ([81e5381](https://github.com/ecomplus/application-starter/commit/81e538178395dc127e9987d676f82254b7852fd6))
* **deps:** update all non-major ([5ec6117](https://github.com/ecomplus/application-starter/commit/5ec6117a0de03668c371f32fe5d0368ddf72f277))
* **deps:** update all non-major ([dc51e58](https://github.com/ecomplus/application-starter/commit/dc51e58f0e5104b248904ecbf42aca1d63c65863))
* **deps:** update all non-major ([e6a8f96](https://github.com/ecomplus/application-starter/commit/e6a8f9682ce1103988610577208db9938ddaf1b9))
* **deps:** update dependency firebase-tools to ^11.16.0 ([58e7712](https://github.com/ecomplus/application-starter/commit/58e771241625641b21ff1720d85c17d49e7ee08f))
* **discount:** fix discount duplication ([3b6ed01](https://github.com/ecomplus/application-starter/commit/3b6ed019e516433447e8344bbd18e6c74e649b09))
* **logs:** correction in logs for refactoring and correction of refactoring searches ([bce5dc8](https://github.com/ecomplus/application-starter/commit/bce5dc8386e0bab873dffead509dfcb71843da5e))
* **update-subscription:** check the value before updating subscription after payment of the first installment ([776e204](https://github.com/ecomplus/application-starter/commit/776e2044313a4bb572c97a5dd70c1a692697ef6d))
* **update-subscription:** remove variable isSandbox and check value before updating ([cdb40b1](https://github.com/ecomplus/application-starter/commit/cdb40b12cbf8fb89336f658fe98546ad438d7b94))
* **webhook-ecom:** improved logging in case of ecom cancellation error for galaxpay ([4180cdc](https://github.com/ecomplus/application-starter/commit/4180cdc3e179ba961351c6c44b3f8b1244d5a01a))
* **webhook-ecom:** Url correction for editing the signature in galaxpay ([ce80e63](https://github.com/ecomplus/application-starter/commit/ce80e636e1441ad4d6adb827f6d0fd3ec03630f3))
* **webhook-galaxpay:** validate order search ([760d80c](https://github.com/ecomplus/application-starter/commit/760d80c1adca1015b305eb99cf5684cb10d9ae68))
* **webhook-galaxy:** Starts creating new orders only if status is paid, renames functions ([5c6fadd](https://github.com/ecomplus/application-starter/commit/5c6fadd359f81e4f64741496817063191a9dacd3))
* **webhook-galaxy:** Starts creating new orders only if status is paid, renames functions ([0e00843](https://github.com/ecomplus/application-starter/commit/0e008430cc80617b8b214efcd631fea59c9af0ea))
* **webhook-utils:** Add confirmHash check or check status in galaxPay and use randomObjectId for id ([ef78830](https://github.com/ecomplus/application-starter/commit/ef78830b9fb2f2f55004f18c13f09a25771eb2a3))
* **webhook:** Add verification of galaxPaySubscriptionId ([4047d68](https://github.com/ecomplus/application-starter/commit/4047d6812681df4fc426a06f40b632e2a487e5a2))
* **webhook:** adds a little delay to get the order ([f84d14f](https://github.com/ecomplus/application-starter/commit/f84d14f73317056c656303134628d532e0b6ef0f))
* **webhook:** Check transaction date to insert in payment history ([14429e0](https://github.com/ecomplus/application-starter/commit/14429e0bb7480abf54aa41db0ee66a7f6a2aec04))
* **webhook:** check transaction status and subscription before in galaxpay and cancel subscription with webhook if needed ([f8c9ba9](https://github.com/ecomplus/application-starter/commit/f8c9ba950d190326f37dd76e2fab2109fa96b6f0))
* **webhook:** Condition not to update canceled subscription ([3a219a0](https://github.com/ecomplus/application-starter/commit/3a219a01fc4474252d4e540ce1f21e40ed54f89f))
* **webhook:** Create payment history if there is no previous transaction ([0bd8792](https://github.com/ecomplus/application-starter/commit/0bd8792c2a36728b07b5cca8c71a8fb1bfe75a8e))
* **webhook:** fix log ([a845cee](https://github.com/ecomplus/application-starter/commit/a845cee0f4b3f95442f031c84207bb980ae924ac))
* **webhook:** fix to not try to edit canceled order and prevent addTransaction retries ([18b5cfe](https://github.com/ecomplus/application-starter/commit/18b5cfe5f8aae29f559b91e28a969ddc2324982f))
* **webhook:** fix url for id update ([9e805c8](https://github.com/ecomplus/application-starter/commit/9e805c88687d06726c319ca06cf78fbcb2874d5c))
* **webhook:** fix when updating canceled payment ([93fcdb2](https://github.com/ecomplus/application-starter/commit/93fcdb254290d817ecba4f061d310ca598b357f4))
* **webhook:** Handle error message in storeAPi webhook ([2636fc0](https://github.com/ecomplus/application-starter/commit/2636fc0c63a25c3ac13946a27bca56ab4989473d))
* **webhook:** handle exception when order does not exist ([4baf5ac](https://github.com/ecomplus/application-starter/commit/4baf5ace2f72b1029d09227a388ebc13b086efe0))
* **webhook:** make sure the order was found before trying to cancel ([536d782](https://github.com/ecomplus/application-starter/commit/536d782d8d8026bdc35f18783fbcaf78be6b8833))
* **webhook:** Printing wrong variable ([6120f6e](https://github.com/ecomplus/application-starter/commit/6120f6e62e03e99efc7af0df973be0529636bdbe))
* **webhook:** remove parse from status coming from webhook ([b9f3d10](https://github.com/ecomplus/application-starter/commit/b9f3d106971ff7132ebf4c21e90bad6ef13434b6))
* **webhook:** Remove some unnecessary logs ([60c1640](https://github.com/ecomplus/application-starter/commit/60c16402960380e65238ec05b0ab536ac10cccc9))
* **webhooks-utils:** Fix long try/catch block and semantics ([135191b](https://github.com/ecomplus/application-starter/commit/135191b149d18c479a495313c8721327f1b8cb29))
* **webhooks:** Add log for update order ([883f3c4](https://github.com/ecomplus/application-starter/commit/883f3c4d238d0ffa5f7129905c7e5f1ee33ee902))
* **webhook:** Update logs ([26f8c11](https://github.com/ecomplus/application-starter/commit/26f8c11acb4a7c3fe51cefcf25738b189a0d93d1))
* **webhook:** Update logs ([f435fd4](https://github.com/ecomplus/application-starter/commit/f435fd4f202eed7459b4ccf5bc8ac284b3b5310b))
* **webhook:** Update logs ([6ecf88f](https://github.com/ecomplus/application-starter/commit/6ecf88fff06128305e3d69b9223636e77717c6aa))
* **webhook:** Update logs ([7853af6](https://github.com/ecomplus/application-starter/commit/7853af6ea22793f4347971d874ddda761d18f5b4))

### [1.1.2](https://github.com/ecomplus/application-starter/compare/v1.1.0...v1.1.2) (2022-09-09)


### Bug Fixes

* **List Payments:** add minimum amount setting in payment methods to list payments ([028c174](https://github.com/ecomplus/app-galaxpay/commit/028c174b37294b9780319cc049e02e4730003257))


### [1.1.1](https://github.com/ecomplus/application-starter/compare/v1.1.0...v1.1.1) (2022-07-15)


### Bug Fixes

* **Add Transaction:** add function check payday ([74f6e9f](https://github.com/ecomplus/application-starter/commit/74f6e9f25135a436abb6c608b6bf3f3911625648))
* **Create Axios:** remove URL sandBox ([4cc99b8](https://github.com/ecomplus/application-starter/commit/4cc99b80a57423669e92f3662873753b997ac400))
* **Create new Order:** sintax date for request api ([6db4995](https://github.com/ecomplus/application-starter/commit/6db49959873ad573c017a81e3d89951ae4daaed0))
* **deps:** update all non-major ([d6de2fb](https://github.com/ecomplus/application-starter/commit/d6de2fb144b22ca4a1749e09ddbf134ab0d3e9f3))
* **deps:** update dependency firebase-admin to v11 ([#30](https://github.com/ecomplus/application-starter/issues/30)) [skip ci] ([0eb9379](https://github.com/ecomplus/application-starter/commit/0eb9379ef311b4ceec18fa0406a0b365b11bae77))
* **deps:** update dependency firebase-tools to v11 ([#27](https://github.com/ecomplus/application-starter/issues/27)) [skip ci] ([0f5654c](https://github.com/ecomplus/application-starter/commit/0f5654c4f41f0aa1b0b7d1196eea0aa57535e8b3))
* **Discount:** remove discount in Subscription GalaxPay ([aa9fc4b](https://github.com/ecomplus/application-starter/commit/aa9fc4be6bcf96aa36f60987508481e80f07ab68))
* **discount:** remove discount in Subscription GalaxPay ([#31](https://github.com/ecomplus/application-starter/issues/31)) [skip ci] ([ad4adb3](https://github.com/ecomplus/application-starter/commit/ad4adb3a4375096374dde5429c2aa2bc7e5756d1))
* **List Payments:** remove URL sandBox ([545e739](https://github.com/ecomplus/application-starter/commit/545e739375a3b74b3f114795f7116a36a8208d3f))
* **Onload Expression:** remove var sandBox ([573e7e8](https://github.com/ecomplus/application-starter/commit/573e7e8939e3bbfdc6b7f134087bc57c803e23cf))
* **webhook galaxPay:** check status, update order ([fddd7f1](https://github.com/ecomplus/application-starter/commit/fddd7f1d1342bff6c3de5de7760079c515c1d10b))
* **webhook GalaxPay:** Modify rule, create order in API if status different from notSend ([53dd0e3](https://github.com/ecomplus/application-starter/commit/53dd0e3cf36f9b25f99fa2438cbca095c2ba50ee))
* **Webhook galaxy:** update check payday ([e5f5080](https://github.com/ecomplus/application-starter/commit/e5f508044e45d50e83fd8ad7c7b947cab737a385))

## [1.1.0](https://github.com/ecomplus/application-starter/compare/v1.0.0...v1.1.0) (2022-04-21)


### Features

* **PIX:** add pix payment method ([1400463](https://github.com/ecomplus/application-starter/commit/14004639d185dff0f2f3c6e7c8b89a38bdfdec94))
* **PIX:** create payment Pix in config ([5ba21d5](https://github.com/ecomplus/application-starter/commit/5ba21d508054aad9670cf508d5412a9feb81f000))
* **Plans:** create plans in config ([fadc18d](https://github.com/ecomplus/application-starter/commit/fadc18d58d55e6ad1a32ae6d09c337b3852ed240))


### Bug Fixes

* **config:** add frist payment deadline ([2bed697](https://github.com/ecomplus/application-starter/commit/2bed697549e383bff76ab5f15f24b4fdd26f1144))
* **config:** string corretion frist payment ([34c3e24](https://github.com/ecomplus/application-starter/commit/34c3e246a29a43be8cd8558e5ef4831fddbcd50b))
* **ecom config:** back subscription_label ([ec3a3ab](https://github.com/ecomplus/application-starter/commit/ec3a3abf45c820161e7c1ec109fa3052f3faa926))
* **ecom config:** remove plan_recorrence and subscription_label ([e1b58b3](https://github.com/ecomplus/application-starter/commit/e1b58b359d91cb55c21563f79e35bc68f05d7287))
* **list-payments:** fix credit card icon uri ([17b38ee](https://github.com/ecomplus/application-starter/commit/17b38ee0aa9b150fd2bc2a7bd09f9978cc45dd3c))
* **periodicity name:** alter name periodicity and create parse ([7e0fc7e](https://github.com/ecomplus/application-starter/commit/7e0fc7e5c3279863df4a40167a194f4e784b9800))

## 1.0.0 (2022-03-29)


### Bug Fixes

* **acessToken:** add console log ([5a2131e](https://github.com/ecomplus/application-starter/commit/5a2131e42b6f0998ff1525a9cb76aa7e5be2f8d2))
* **acessToken:** propriety accessToken firebase ([2a1d94b](https://github.com/ecomplus/application-starter/commit/2a1d94b983681cc073bf7e21b4d830aec48c2c02))
* **acessToken:** propriety in create axios ([317946c](https://github.com/ecomplus/application-starter/commit/317946cd059f9f3a1c2f7635398d2486a188e414))
* **acessToken:** remove proprity accessToken in create axios ([e0c24ed](https://github.com/ecomplus/application-starter/commit/e0c24ed99245255dac7ef3231e8c521b74d7a780))
* **authoriation:** verifing time AcessToken ([a8be46c](https://github.com/ecomplus/application-starter/commit/a8be46cd9d1eed88d3c3b2a649117824c8a700d0))
* **authoriation:** verifing time token ([49305fa](https://github.com/ecomplus/application-starter/commit/49305fadf9effb64f4b6da12e7e72aa9cfa1b9c4))
* **authorizatio:** create request authorization and token ([9b1f0e7](https://github.com/ecomplus/application-starter/commit/9b1f0e73015b6ba5109c93a8f1e58aa9dedb5ba7))
* **authorization:** verifing bug ([406cbee](https://github.com/ecomplus/application-starter/commit/406cbee15c64b85752b36c57cf5d87a36d0efa55))
* **authorization:** verifing bug ([81c06bb](https://github.com/ecomplus/application-starter/commit/81c06bbc2363323fde1049b96b81352030c5c028))
* **authoriztion:** update authorization, create access token and save firebase ([74fe823](https://github.com/ecomplus/application-starter/commit/74fe823bb3fa6cf27235786d621dd2af094627fa))
* **cancell subscription:** handle error cancell ([1b38b13](https://github.com/ecomplus/application-starter/commit/1b38b13501e530dd8bba51b7374d0a7d0468f824))
* **create subscription:** handle error create subscription production ([ea53071](https://github.com/ecomplus/application-starter/commit/ea53071c2af817e1a357a0783dbc391b0c4d17cb))
* **create transaction:** add flag indetify periodicity ([b080c29](https://github.com/ecomplus/application-starter/commit/b080c2974c4fedeae0a07eabc482da58ebadc948))
* **create transaction:** handle bug ([74e2465](https://github.com/ecomplus/application-starter/commit/74e24655e6b1608a7446ccd5585882795a46fafb))
* **create transaction:** indentify periodicity in transactions notes ([e6c03f1](https://github.com/ecomplus/application-starter/commit/e6c03f1844b878d4b896253ce22f2042637d394c))
* **create transaction:** new test handle bug ([1628de4](https://github.com/ecomplus/application-starter/commit/1628de4a78f0261c864b900e3972007e8a11e5d3))
* **create transaction:** remove function parseId ([395055e](https://github.com/ecomplus/application-starter/commit/395055e0833f536335d0bc126476497692a2879b))
* **create transactions:** remove logs ([355c290](https://github.com/ecomplus/application-starter/commit/355c29066c0cb4fc4575a93abc4fca5de0bb9f0a))
* **create transaction:** test bug ([2317683](https://github.com/ecomplus/application-starter/commit/23176833444032e5dddc77c8700f4bd731b5dcfa))
* **create transaction:** update data create ([b553d16](https://github.com/ecomplus/application-starter/commit/b553d1697d77a6a05269fa9f4024bfb1bc49c18d))
* **create transation:** create transaction firebase ([aca6271](https://github.com/ecomplus/application-starter/commit/aca6271341e02e6cca096e320cfbe52a97663986))
* **create transation:** handle doc firebase ([1b5155a](https://github.com/ecomplus/application-starter/commit/1b5155ab747417f880df1d936e4e1df5cc4d0246))
* **create transation:** handle status transations ([379d89f](https://github.com/ecomplus/application-starter/commit/379d89fd962cfa647fbe70e09a828cce9d266773))
* **create transation:** not handle preAuthorize card ([b959167](https://github.com/ecomplus/application-starter/commit/b959167dd752c7e036e5904e93a0cf3aef72fa15))
* **create transation:** save subscription in firebase for query webohook ([67e2351](https://github.com/ecomplus/application-starter/commit/67e2351c48b4182b885ca4d52846623fbacfabcd))
* **create transation:** save subscription in firebase for query webohook ([2b35ee4](https://github.com/ecomplus/application-starter/commit/2b35ee403dfd1e0144108026ab73c9cd90f07558))
* **create transation:** test create card ([c41a27c](https://github.com/ecomplus/application-starter/commit/c41a27cb48c7193555c9a687d7436cd185b1817b))
* **create transation:** update name proprity card ([9141d36](https://github.com/ecomplus/application-starter/commit/9141d3629da9d905638f58d395bb913408f47118))
* **create transation:** update parse status ([8ab4d56](https://github.com/ecomplus/application-starter/commit/8ab4d56387574285b5ce864a5ef413a4a9f67788))
* **create transation:** verifing card descriptions ([2212b64](https://github.com/ecomplus/application-starter/commit/2212b64c3cd4066b54c2dcd3dbd767f46737eb2d))
* **create transation:** verifing card subscriptions ([62af7e5](https://github.com/ecomplus/application-starter/commit/62af7e517f97365fc9393c2441dee8c1ac71aedb))
* **create transation:** verifing parse status ([dbb9cbc](https://github.com/ecomplus/application-starter/commit/dbb9cbcaa6fab1b9213e23381e73fbaf91d6c9a1))
* **create transation:** virifing parse status ([ac3f1bf](https://github.com/ecomplus/application-starter/commit/ac3f1bffffa0ba1b35238c0d94041d0a2f0dbb23))
* **create-transaction :** send error ([e2ee8ea](https://github.com/ecomplus/application-starter/commit/e2ee8eaa7216d488a3bd758786e92baf96b790e5))
* **create-transaction :** send transaction ([a9533a9](https://github.com/ecomplus/application-starter/commit/a9533a9fb00d885f37bf3aa05e819bfea985ea96))
* **create-transaction :** verifing bug ([fcb2ea7](https://github.com/ecomplus/application-starter/commit/fcb2ea7f7a9178667e077a9de8f7b0b0963d692f))
* **create-transaction :** verifing bug ([d1494f7](https://github.com/ecomplus/application-starter/commit/d1494f7f65e3a46d6d395aae0a186f2b26bc0005))
* **create-transaction :** verifing bug galaxpayAxios ([2e3102e](https://github.com/ecomplus/application-starter/commit/2e3102e733ca3a931f057cadb0cbb3fb3d7b8e6f))
* **create-transaction :** verifing bug response ([e3c16df](https://github.com/ecomplus/application-starter/commit/e3c16dfab9f6e2de2269cd6edd9d91f64b786151))
* **create-transaction:** add field extrafields in subscriptions ([bd3c21d](https://github.com/ecomplus/application-starter/commit/bd3c21d10626efe47e2854d422f87102f63dd5dc))
* **create-transaction:** create subscriptions in galaxpay ([f0f2708](https://github.com/ecomplus/application-starter/commit/f0f2708d941e915e3f6385d08c1b450c0d1ad3ce))
* **create-transaction:** payment method correct creditcard ([9893a70](https://github.com/ecomplus/application-starter/commit/9893a70e25571c5961386baa92c6b07570df797a))
* **create-transaction:** subscription create ([32ee7dc](https://github.com/ecomplus/application-starter/commit/32ee7dc728339d340bddb967d4ffa603a9b88150))
* **create-transaction:** verifing bug ([cf483be](https://github.com/ecomplus/application-starter/commit/cf483be19a5da93e43b9574561884f123bb03c57))
* **deps:** update dependency dotenv to v16 ([#14](https://github.com/ecomplus/application-starter/issues/14)) ([f97ec59](https://github.com/ecomplus/application-starter/commit/f97ec59ce5738716f2bcfb8b2052cddef066355b))
* **galaxPay-webhook:** frist test webook ([1d19e50](https://github.com/ecomplus/application-starter/commit/1d19e50c24bbbe88c698b33be00b8e31a8a35f9d))
* **galaxPay-webhook:** rename route webhooks ([a41f4c4](https://github.com/ecomplus/application-starter/commit/a41f4c4cf964af8276c1756335bce7feed741780))
* **galaxPay-webhook:** verifing response webohook ([6a1a285](https://github.com/ecomplus/application-starter/commit/6a1a285086448f69ce9d657d5f281de1dcd40744))
* **hash card:** back onload path public ([b571bc1](https://github.com/ecomplus/application-starter/commit/b571bc14075825c8d2979dab08b2b2bc41deb77b))
* **hash card:** updade function onload ([c87ce60](https://github.com/ecomplus/application-starter/commit/c87ce602ff9eb71a04da6824930051e7f6e7e43c))
* **hash-card:** add console card test ([f344c31](https://github.com/ecomplus/application-starter/commit/f344c3137f83fdce44c2d36f394a3a87994d168c))
* **hash-card:** move onload path and update config active produce webhooks ([121a4f2](https://github.com/ecomplus/application-starter/commit/121a4f2ee4983b1d8b6ba8e69a9a856139578729))
* **hash-card:** remove  console card test ([f9f2fb1](https://github.com/ecomplus/application-starter/commit/f9f2fb1527719ce2a8af1aab5abe3a752b142122))
* **hash:** back then and cath ([96d08aa](https://github.com/ecomplus/application-starter/commit/96d08aa89c84fad2970726a9fe2758b227dee072))
* **hash:** test hash ([1aa22cb](https://github.com/ecomplus/application-starter/commit/1aa22cba7806f171518a3638ea9c79007d514a97))
* **hash:** update varible function onload ([6b03c8d](https://github.com/ecomplus/application-starter/commit/6b03c8d6eeccafcbbdd7f1861024bfcb6d0a342d))
* **list payments:** indetify periodicity and quantity in subcription ([00c1f76](https://github.com/ecomplus/application-starter/commit/00c1f76605e7b181b85eb22d5649652569c83245))
* **list payments:** remove quantity ([b7a085b](https://github.com/ecomplus/application-starter/commit/b7a085b8eba110a95125dd72e16e8e72b9573b99))
* **list-payments:** init list-payments ([efa5296](https://github.com/ecomplus/application-starter/commit/efa529675e35e7e5e11904502b3eae7f237fa3d6))
* **onload:** expiration date not formated corret and add subscription label config ([b23b718](https://github.com/ecomplus/application-starter/commit/b23b71836c8b75ff44de67597b7b51ecdf6b7ef3))
* **recorrence quantity:** define recorrence unlimited ([fd32ce6](https://github.com/ecomplus/application-starter/commit/fd32ce6379263f94464f98efae1959babd5f9a8c))
* **webhook e-com:** alter verb for delete ([ea8f17e](https://github.com/ecomplus/application-starter/commit/ea8f17ed59509018867905fd063f3d9d52f929bf))
* **webhook e-com:** bug require ([c5ad2e8](https://github.com/ecomplus/application-starter/commit/c5ad2e86ec8d06e7c5e0453179c03de23a1007de))
* **webhook e-com:** cancell subscription galaxPay ([cf34874](https://github.com/ecomplus/application-starter/commit/cf3487444bae9a7f1305ff9df7e79f3330f4aa48))
* **webhook e-com:** Msg sucess cancelled ([9bbcae2](https://github.com/ecomplus/application-starter/commit/9bbcae2a0f894e733f7073f146f0f5978977584d))
* **webhook e-com:** remove console.log ([ecb2895](https://github.com/ecomplus/application-starter/commit/ecb28955c60a5c2c049c937cd774cb0a84a57692))
* **webhook e-com:** test cancell ([c1c5dd7](https://github.com/ecomplus/application-starter/commit/c1c5dd764da2f894898fb973d6af4ce1201fae2c))
* **webhook e-com:** verifing response ([bc9ec3b](https://github.com/ecomplus/application-starter/commit/bc9ec3b18eb533f15d4024b4c20f14aad7506636))
* **webhook e-com:** verify body request ([c315072](https://github.com/ecomplus/application-starter/commit/c315072b6d2f25e0643175ccc3ac22e7def47a35))
* **webhook:** add copy new orders ([55bbff1](https://github.com/ecomplus/application-starter/commit/55bbff1db7a8d6838eac2479461f30504ad73f1c))
* **webhook:** add items in create new order ([e6ba74e](https://github.com/ecomplus/application-starter/commit/e6ba74eff544fc0e6ed5944bd329a00172d6ef23))
* **webhook:** add paymentMethod ([f56bf79](https://github.com/ecomplus/application-starter/commit/f56bf79f4950153ed1923428e50022b4fd7ef041))
* **webhook:** add proprity in body request ([db20811](https://github.com/ecomplus/application-starter/commit/db2081121a37961efe3500679a0090aa3cf642d5))
* **webhook:** add proprity name buyer ([e94f8f6](https://github.com/ecomplus/application-starter/commit/e94f8f6671f37211a545c419742125c5e0b851c6))
* **webhook:** add transaction order ([22fc87a](https://github.com/ecomplus/application-starter/commit/22fc87a071640a751ac1f507d110be07ea4ebdc6))
* **webhook:** add transaction order ([ced690a](https://github.com/ecomplus/application-starter/commit/ced690a9e3cd9ed27c29a9c75c72d7edca963896))
* **webhook:** back debugs ([07cfd9f](https://github.com/ecomplus/application-starter/commit/07cfd9ff0b33981901b5c79985c984a741015eae))
* **webhook:** back logs update status ([18233e4](https://github.com/ecomplus/application-starter/commit/18233e4e1005d2863aa031fbf033d83393e0ce2c))
* **webhook:** back request and path correction parseStatus ([a1e5e62](https://github.com/ecomplus/application-starter/commit/a1e5e626909d79312fc77ed3fffdd751eca2adb5))
* **webhook:** body correction request ([d609782](https://github.com/ecomplus/application-starter/commit/d60978239bf690945d036b57e8c398345b6016b4))
* **webhook:** correction custom field ([6577d05](https://github.com/ecomplus/application-starter/commit/6577d0554e8be1f96a6b71d49ca7f9e5bf90a1c2))
* **webhook:** create new order api ([d56db71](https://github.com/ecomplus/application-starter/commit/d56db71b649589d17dcbb042c480be564288800e))
* **webhook:** create promise find order ([e6bd1d6](https://github.com/ecomplus/application-starter/commit/e6bd1d66a48b0f2125a1351be08dd6592299cbdc))
* **webhook:** create transaction proprity in new order ([80c8d77](https://github.com/ecomplus/application-starter/commit/80c8d77a7bed3445a9865ed6d2a6812208f1fe88))
* **webhook:** custom field ([6cc18b8](https://github.com/ecomplus/application-starter/commit/6cc18b8a6c0a4eb61841e837ab4a96f861be6b7c))
* **webhook:** debug body ([f5f888b](https://github.com/ecomplus/application-starter/commit/f5f888b021db5067c328dd622dfcde1208a1a335))
* **webhook:** edit proprity name buyer ([bbc51ee](https://github.com/ecomplus/application-starter/commit/bbc51ee0fa41c71157b969b5562a246394652e66))
* **webhook:** edit proprity save firebase ([d1dc4e9](https://github.com/ecomplus/application-starter/commit/d1dc4e9a4fa3e927204a9006ee150a1da2850c36))
* **webhook:** err webhook ([f526ce1](https://github.com/ecomplus/application-starter/commit/f526ce103853a46734a80da5007b6773b74d72fd))
* **webhook:** error cancelled subscription ([f34a75f](https://github.com/ecomplus/application-starter/commit/f34a75fb14a2b2cfcf7f6780a239da4ba9c43026))
* **webhook:** find order id ([c5426da](https://github.com/ecomplus/application-starter/commit/c5426da2f2ad0e7d25a1be19879df452e8ce707c))
* **webhook:** get with fields ([b1ab44e](https://github.com/ecomplus/application-starter/commit/b1ab44ea3caa1c2e09088973a81273c2b67b3c0c))
* **webhook:** handle bug create new order ([f323252](https://github.com/ecomplus/application-starter/commit/f3232520b14bc5dd2adeb46d233d9f7b0cc8e0c0))
* **webhook:** handle bug field ([fd466af](https://github.com/ecomplus/application-starter/commit/fd466af9d739a747708a78364ed6bd794ecf3341))
* **webhook:** handle err cancelled dashbord admin ([5c3c047](https://github.com/ecomplus/application-starter/commit/5c3c0479b0f02c788355aeb820667cbd63e1b12b))
* **webhook:** handle error ([93c3ac4](https://github.com/ecomplus/application-starter/commit/93c3ac44d489ea97e6349700b04738430bb50ae2))
* **webhook:** handle error ([eda079b](https://github.com/ecomplus/application-starter/commit/eda079bd6f24f9a86fc4d001085bff49c2b3c51a))
* **webhook:** handle promise find order ([c342978](https://github.com/ecomplus/application-starter/commit/c342978e60be3d71be96a2488408f9842cce82eb))
* **webhook:** handle transactions limited ([2f44915](https://github.com/ecomplus/application-starter/commit/2f449152a502d73005c5b8777768a078e02dc805))
* **webhook:** handle update status transaction ([fd75097](https://github.com/ecomplus/application-starter/commit/fd75097186dd2bc0ebd2deec9696e86f0c260db3))
* **webhook:** heandle error create new order ([6390f42](https://github.com/ecomplus/application-starter/commit/6390f4268ce0837e717b119ebe5246aca72c6b23))
* **webhook:** insert payment link in transaction ([6788369](https://github.com/ecomplus/application-starter/commit/6788369594471446ed56f778b0d7dd705b397162))
* **webhook:** log findOrder ([2c0c415](https://github.com/ecomplus/application-starter/commit/2c0c4158183ba15e14b89f87fabec92ffe0c6ffc))
* **webhook:** modifid status ([c7c2963](https://github.com/ecomplus/application-starter/commit/c7c29636b7b4f75bbb7d7c752069eb7256aa3038))
* **webhook:** name proprity incorrect ([c49bb43](https://github.com/ecomplus/application-starter/commit/c49bb438151e4f23be4fd9cb65a516bacb26b449))
* **webhook:** new debug body ([08a2fff](https://github.com/ecomplus/application-starter/commit/08a2fff68889513e751911370666a58c9fa83028))
* **webhook:** new set timeout ([42b5659](https://github.com/ecomplus/application-starter/commit/42b56593413d44365b0d5679853487aa80a1e9f5))
* **webhook:** new test add transaction ([518b9f6](https://github.com/ecomplus/application-starter/commit/518b9f6234e60037075511a6ed48b9291efd0662))
* **webhook:** new test handle ([01e8125](https://github.com/ecomplus/application-starter/commit/01e812553bfde7a31dc50586caf0a7fa362c4b01))
* **webhook:** new test payment link in transaction ([8404503](https://github.com/ecomplus/application-starter/commit/840450332117d85f9c82369dad52fc94617ca4ad))
* **webhook:** new test promisse in add transaction ([1450cc7](https://github.com/ecomplus/application-starter/commit/1450cc7c60ea8173c5fb30a4f8079d41fae2e145))
* **webhook:** new test request API ([8ba78af](https://github.com/ecomplus/application-starter/commit/8ba78afe00d6fe7dcc2defed0da4696f199e99b6))
* **webhook:** new test request create orders ([e5791b8](https://github.com/ecomplus/application-starter/commit/e5791b88751f53a36b63d59e1957be72a3237c6e))
* **webhook:** new test transaction Update status ([46a2abc](https://github.com/ecomplus/application-starter/commit/46a2abceb797749accf7d1e6c18b8d13ac58a139))
* **webhook:** new test verifing bug ([86025ac](https://github.com/ecomplus/application-starter/commit/86025ac664dc955bd72701d76055bd9e1cf62ab0))
* **webhook:** new verifing payment card in subscriptions ([59e7856](https://github.com/ecomplus/application-starter/commit/59e7856272b564095b195572ca760460dfe384cf))
* **webhook:** not update status, if order is not subscription ([39ba5e0](https://github.com/ecomplus/application-starter/commit/39ba5e05d5c30470dd90a2440dc969a087da8754))
* **webhook:** promisse in add transaction ([40ed846](https://github.com/ecomplus/application-starter/commit/40ed84660e62e863c15dfbbb3e6cc6a961256199))
* **webhook:** promisse in add transaction ([535d926](https://github.com/ecomplus/application-starter/commit/535d926714dbd35e16b08ba6f4e33eb14be54d1d))
* **webhook:** remove debugs ([4200361](https://github.com/ecomplus/application-starter/commit/4200361b763e6492005b7ddc7ddac8b43ff3c901))
* **webhook:** remove intermetiador ([5ab1053](https://github.com/ecomplus/application-starter/commit/5ab10532544b33ed11fe37b43bdfa78005fa78bf))
* **webhook:** remove logs app ([2c2ef9f](https://github.com/ecomplus/application-starter/commit/2c2ef9f0cc744db21d9e401bfe33645616d3badc))
* **webhook:** remove proprity buyer ([2bef3dc](https://github.com/ecomplus/application-starter/commit/2bef3dcbed5a48d6f2639462097925bc1ddb982d))
* **webhook:** remove proprity id in create new order ([fe6aa3b](https://github.com/ecomplus/application-starter/commit/fe6aa3b927a44dcc4e9557e2eda2d8531de49348))
* **webhook:** remove request ([3ad2fc0](https://github.com/ecomplus/application-starter/commit/3ad2fc027716b2724d42c68206c60e7c4198590a))
* **webhook:** remove status and notes ([a120545](https://github.com/ecomplus/application-starter/commit/a1205452540c5e3522e46fc096c17733486ae17d))
* **webhook:** remove status proprity update transaction ([176c455](https://github.com/ecomplus/application-starter/commit/176c455e75771c89ae548550ab093bc017d648ca))
* **webhook:** remove timeout ([6c8f427](https://github.com/ecomplus/application-starter/commit/6c8f4279839ba671011ac36b91a814428ef1dfa6))
* **webhook:** remove transaction order ([00d3944](https://github.com/ecomplus/application-starter/commit/00d3944cba481c51192a8b2a9a0ed0fbb2ed2e76))
* **webhooks:** back functions ([3fa4171](https://github.com/ecomplus/application-starter/commit/3fa417199132c9632493525e7aadc6e76d6470b3))
* **webhooks:** create  transaction in firebase ([45352e8](https://github.com/ecomplus/application-starter/commit/45352e8a046ed01a7beb079e3327b5d10e7eed72))
* **webhooks:** create doc firebase ([568b3dc](https://github.com/ecomplus/application-starter/commit/568b3dced1a27b3b64612377534da5cb624643ea))
* **webhooks:** create transaction in firebase ([e3dfbd1](https://github.com/ecomplus/application-starter/commit/e3dfbd10abbb6ce160058de476eb6ed6853104aa))
* **webhook:** set timeout 1000ms ([27a852c](https://github.com/ecomplus/application-starter/commit/27a852cdf2ee8f3d636d1c127467b739140d100c))
* **webhooks:** find doc firebase ([aec86a5](https://github.com/ecomplus/application-starter/commit/aec86a5e4f45ad2745801d1960d20149417b98af))
* **webhooks:** handle doc firebase ([a9bcc71](https://github.com/ecomplus/application-starter/commit/a9bcc717dc49441dbc784406ab65ec2597bb509b))
* **webhooks:** handle error collection transaction ([0527fee](https://github.com/ecomplus/application-starter/commit/0527fee911058d89ee58be1590c9bf691c497bab))
* **webhooks:** modified status ([ba2ee96](https://github.com/ecomplus/application-starter/commit/ba2ee96bf5b11533e16b5fbd3bfd36ab43d7fa79))
* **webhooks:** modified version package and handle erros webhooks ([e216235](https://github.com/ecomplus/application-starter/commit/e2162356f589f2113b2df4cd16a8d04d9f7bed5c))
* **webhooks:** modifield promise ([fb4927f](https://github.com/ecomplus/application-starter/commit/fb4927f810c7fcdad807760a0fa43a41cf9fa0d3))
* **webhooks:** move status functions ([fa17f8c](https://github.com/ecomplus/application-starter/commit/fa17f8cbba0f3c63c35c343a2170e3a64afff862))
* **webhooks:** new test  params transactions ([a1109ae](https://github.com/ecomplus/application-starter/commit/a1109ae8c590ac86351b6e07941a93a7a27e3694))
* **webhooks:** new test find transaction in firebase ([dbdd599](https://github.com/ecomplus/application-starter/commit/dbdd599d7d060c21f82e4ee2865ec787a53f6b11))
* **webhooks:** new test firebase verifing data transaction collection ([89dbe66](https://github.com/ecomplus/application-starter/commit/89dbe66500656e2be70b6b9882d9f3fab8d8f29b))
* **webhooks:** new test promisse in create doc firebase ([05977c9](https://github.com/ecomplus/application-starter/commit/05977c9e3a92f7ddef3a96cd9c7dde5944c74aa8))
* **webhooks:** new test verifing log ([d6426c4](https://github.com/ecomplus/application-starter/commit/d6426c4ec1349655d41a728b5362c0677ead7622))
* **webhooks:** new test verifing log doc ([904bcf8](https://github.com/ecomplus/application-starter/commit/904bcf8cc0741447100e27478cab8868e4cf649a))
* **webhooks:** new test verifing log doc ([39b3e95](https://github.com/ecomplus/application-starter/commit/39b3e95e7987e5133c31815367b507b706dae6b3))
* **webhooks:** params function ([6fcef8a](https://github.com/ecomplus/application-starter/commit/6fcef8ad7a64f152f010ae4312825e698f2cb89d))
* **webhooks:** remove logs ([c16f360](https://github.com/ecomplus/application-starter/commit/c16f36061279694265030a7c26a25f6867e12a12))
* **webhooks:** test fireBase ([9b040c8](https://github.com/ecomplus/application-starter/commit/9b040c876856c08e0bdeb00d7fc0220a689ab89b))
* **webhooks:** test firebase verifing data ([1c18485](https://github.com/ecomplus/application-starter/commit/1c18485b6d1ee62375a4e002f2d3f0cde48b2e20))
* **webhooks:** test promise ([1176d5a](https://github.com/ecomplus/application-starter/commit/1176d5adc90886d16116a56d48fb1bad7a6c2a9e))
* **webhooks:** test promisse in create doc firebase ([4d64729](https://github.com/ecomplus/application-starter/commit/4d647296a3dd1ea952c99122dac4c59b955d5694))
* **webhooks:** update  params transactions ([4f83086](https://github.com/ecomplus/application-starter/commit/4f83086ee37b55e0ece51797014c06423a8f690d))
* **webhooks:** verifing bug ([d1b9709](https://github.com/ecomplus/application-starter/commit/d1b97094877d5e825c0f9638118b1f27b0450e4f))
* **webhooks:** verifing log ([70549cc](https://github.com/ecomplus/application-starter/commit/70549ccdc4a011ebb04354afca079e93781160bf))
* **webhooks:** verifing params transactions ([93836ed](https://github.com/ecomplus/application-starter/commit/93836ed87f13ca4aafe1ba32506c609ade075d62))
* **webhook:** test add shipping in create new order ([b229ed1](https://github.com/ecomplus/application-starter/commit/b229ed1db9af226c1ce2b87272f79f577b8bf551))
* **webhook:** test add transaction, api response ([51cf00d](https://github.com/ecomplus/application-starter/commit/51cf00d3155c660f1463df8ae3d314d7563ac5dc))
* **webhook:** test body request ([2bd0358](https://github.com/ecomplus/application-starter/commit/2bd0358f431b733e30691c77cf2c9c3f61900bcc))
* **webhook:** test capture subcription ([9f842e2](https://github.com/ecomplus/application-starter/commit/9f842e25a6ef04e3a86690eae786756f44dd61f7))
* **webhook:** test create new orders ([d3d435e](https://github.com/ecomplus/application-starter/commit/d3d435e4fcd8be293de90c2ee46eaafd428eebc7))
* **webhook:** test resp subscriptions ([59d1d3d](https://github.com/ecomplus/application-starter/commit/59d1d3deef43991d2b6d15c1cd862e75584ba205))
* **webhook:** test timeout ([86361e5](https://github.com/ecomplus/application-starter/commit/86361e58071f8ce6bb822cd5f63e9063fc832593))
* **webhook:** test timeout 2000ms ([0aa5618](https://github.com/ecomplus/application-starter/commit/0aa56182f00ae7c33a616d952f7603f9ffce24df))
* **webhook:** test verifing bug ([fc9f1f8](https://github.com/ecomplus/application-starter/commit/fc9f1f820f0230ea4fc91af658cb197f79fff6de))
* **webhook:** test verifing bug ([2c469c1](https://github.com/ecomplus/application-starter/commit/2c469c1ce904a5ddc86740c810af3b73f2f7154f))
* **webhook:** test verifing payday ([4834000](https://github.com/ecomplus/application-starter/commit/48340002b84e1fb455a1d36446aa0f36dc32c3e7))
* **webhook:** test with timeout ([7b6b075](https://github.com/ecomplus/application-starter/commit/7b6b0756f6b713082f1957657d7b647d91f903a1))
* **webhook:** update config webhooks ([7c19543](https://github.com/ecomplus/application-starter/commit/7c19543bab369250d36e03270c9889f8a377fb6d))
* **webhook:** update const transaction id ([fa85997](https://github.com/ecomplus/application-starter/commit/fa859978dd9ee45f8de6bad95a9171551fe512dc))
* **webhook:** update date created ([66c35ef](https://github.com/ecomplus/application-starter/commit/66c35efc0293e2c789ca88196a7c56555b96ff7b))
* **webhook:** update date created and remove log ([78f4aff](https://github.com/ecomplus/application-starter/commit/78f4aff952f6b2a0e0e6bb04f3e8fd3a9fe191c8))
* **webhook:** Update function update status payment ([5b3b735](https://github.com/ecomplus/application-starter/commit/5b3b735f36e2c6a29f48243d582395e9f93f16e4))
* **webhook:** update handle ([743dc58](https://github.com/ecomplus/application-starter/commit/743dc58b013b4821bd18f212f9caa07453e95de2))
* **webhook:** update msg ([04a1b14](https://github.com/ecomplus/application-starter/commit/04a1b1469c68c21f5fb0932bd818545619a95b6a))
* **webhook:** update msg ([d6a931d](https://github.com/ecomplus/application-starter/commit/d6a931d4585611576a24044ed9f335c4a012b810))
* **webhook:** update msg error ([ea52626](https://github.com/ecomplus/application-starter/commit/ea52626521ead65924633f656fe22ec43751b9d7))
* **webhook:** update parserStatus ([ca0c6be](https://github.com/ecomplus/application-starter/commit/ca0c6be5f6332325e32ef5c64aed7e91e7b72ca4))
* **webhook:** update status frist payment ([91c8fd2](https://github.com/ecomplus/application-starter/commit/91c8fd223745fd054e49cd466948ab1ca46a1b79))
* **webhook:** update subscription proprity body ([f342592](https://github.com/ecomplus/application-starter/commit/f3425922f59e1fc10dcd6065f7d0ee92e649d9b5))
* **webhook:** update time  2000ms ([f2bb9f8](https://github.com/ecomplus/application-starter/commit/f2bb9f897721b01a815135f029e6b8bb5dab0884))
* **webhook:** update time  3500ms ([7060390](https://github.com/ecomplus/application-starter/commit/706039026b23a2f341aa8bdb7f4579b0f9bd16c7))
* **webhook:** update transaction proprity in new order ([d781a34](https://github.com/ecomplus/application-starter/commit/d781a343378608c65477c5bb3cbb17a8368aa2be))
* **webhook:** verifing bug ([0432c18](https://github.com/ecomplus/application-starter/commit/0432c1880114bdfe8eca3599f44d2b70b7db683d))
* **webhook:** verifing bug ([c23f90e](https://github.com/ecomplus/application-starter/commit/c23f90eacf10a43957a5222925e099ece811bb85))
* **webhook:** verifing bug ([18d5895](https://github.com/ecomplus/application-starter/commit/18d5895676dccf1fe4ed742b9193b96eb26fee7a))
* **webhook:** verifing bug ([edbcb05](https://github.com/ecomplus/application-starter/commit/edbcb05892d972e75325532e2a78e9d7b342acb0))
* **webhook:** verifing bug deploy ([c934969](https://github.com/ecomplus/application-starter/commit/c934969346f522c3f842f0b66fad80ed671d0005))
* **webhook:** verifing bug status cancelled ([d4b1162](https://github.com/ecomplus/application-starter/commit/d4b1162ed64357fa34815af84ceb97c91e7e65ea))
* **webhook:** verifing financial_status exists ([4a2f22d](https://github.com/ecomplus/application-starter/commit/4a2f22d35af787c57b8265665eb54903a37fe35e))
* **webhook:** verifing handle error ([39a5601](https://github.com/ecomplus/application-starter/commit/39a56010ce75c6da29db0cfbaba2f1ae16584010))
* **webhook:** verifing log err ([f2f495f](https://github.com/ecomplus/application-starter/commit/f2f495fac0a45376530f0a8bd1c74eb29962ceff))
* **webhook:** verifing payment card in subscriptions ([0ae9c55](https://github.com/ecomplus/application-starter/commit/0ae9c555c9b4e2437bfd9646d4d1e155ebab5c47))
* **webhook:** verifing transaction with credit card ([30b44c8](https://github.com/ecomplus/application-starter/commit/30b44c851452008eef37f8a03876f1415bcf832a))

## [1.0.0-starter.24](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.23...v1.0.0-starter.24) (2021-06-24)


### Bug Fixes

* **deps:** update functions non-major dependencies ([dca0a11](https://github.com/ecomplus/application-starter/commit/dca0a113a2da8ae29054d1f4809b83518051cd68))
* **webhooks:** handle auth not found error to prevent webhook retries ([5082a7d](https://github.com/ecomplus/application-starter/commit/5082a7d0a0c5fe53b9529553c14f7e7be16ebf1f))

## [1.0.0-starter.23](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.22...v1.0.0-starter.23) (2021-06-15)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.14.11 ([c7d8cd0](https://github.com/ecomplus/application-starter/commit/c7d8cd021dba0a9b477e234c97e1702f140a8aa8))
* **deps:** update dependency dotenv to v10 ([#90](https://github.com/ecomplus/application-starter/issues/90)) ([47104be](https://github.com/ecomplus/application-starter/commit/47104bef16fd9bb89979d86af709948f156b05a1))

## [1.0.0-starter.22](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.21...v1.0.0-starter.22) (2021-05-07)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.14.10 ([c6f25f2](https://github.com/ecomplus/application-starter/commit/c6f25f233b1870fd27240582ebb080217d59d847))
* **env:** try FIREBASE_CONFIG json when GCLOUD_PROJECT unset ([92cfb16](https://github.com/ecomplus/application-starter/commit/92cfb166a59ef05f67a005fa6ad3b49c69fcb222))

## [1.0.0-starter.21](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.20...v1.0.0-starter.21) (2021-05-07)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.14.9 ([1df5166](https://github.com/ecomplus/application-starter/commit/1df51665bf4ee0baa9edd949d5af942c5a8e26ff))
* **env:** try both GCP_PROJECT and GCLOUD_PROJECT (obsolete) ([9e53963](https://github.com/ecomplus/application-starter/commit/9e53963aa95d79b48fe63528f3f41947f619e9e9))

## [1.0.0-starter.20](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.19...v1.0.0-starter.20) (2021-04-30)

## [1.0.0-starter.19](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.18...v1.0.0-starter.19) (2021-04-05)

## [1.0.0-starter.18](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.17...v1.0.0-starter.18) (2021-04-03)


### Features

* **functions:** using node v12 engine ([96a9ed6](https://github.com/ecomplus/application-starter/commit/96a9ed612555798de9afc21ebd3895bb7fad3ab3))


### Bug Fixes

* **deps:** update all non-major dependencies ([#73](https://github.com/ecomplus/application-starter/issues/73)) ([c90e4bd](https://github.com/ecomplus/application-starter/commit/c90e4bd78172d6736c84dfa39294f411ab81fa19))
* **deps:** update all non-major dependencies ([#75](https://github.com/ecomplus/application-starter/issues/75)) ([37454b3](https://github.com/ecomplus/application-starter/commit/37454b3516e3471d8458e90f3bad09626e545794))

## [1.0.0-starter.17](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.16...v1.0.0-starter.17) (2021-02-14)


### Features

* **modules:** start examples and mocks for discounts and payment modules ([#66](https://github.com/ecomplus/application-starter/issues/66)) ([ec388a8](https://github.com/ecomplus/application-starter/commit/ec388a8cf47603fd15c448d2aae53623cd870c62))
* **update-app-data:** setup commum updateAppData method to store api lib ([888c28f](https://github.com/ecomplus/application-starter/commit/888c28fb64ccab6c2375451c12fffa5955fe277a))


### Bug Fixes

* **deps:** update all non-major dependencies ([#53](https://github.com/ecomplus/application-starter/issues/53)) ([d8b6bf3](https://github.com/ecomplus/application-starter/commit/d8b6bf31f48aa06a7352eb7bf8df52af9e8bdc3a))
* **deps:** update all non-major dependencies ([#54](https://github.com/ecomplus/application-starter/issues/54)) ([46bbafd](https://github.com/ecomplus/application-starter/commit/46bbafd363ddff88b5dc91f858ddc98cf648d232))
* **deps:** update all non-major dependencies ([#55](https://github.com/ecomplus/application-starter/issues/55)) ([470d6ed](https://github.com/ecomplus/application-starter/commit/470d6ed31ea569fa5b19c26dca29b7dcd8c659c9))
* **deps:** update all non-major dependencies ([#56](https://github.com/ecomplus/application-starter/issues/56)) ([a2382fc](https://github.com/ecomplus/application-starter/commit/a2382fc57a80eacf10aa7b1a468780aa9ca28803))
* **deps:** update all non-major dependencies ([#58](https://github.com/ecomplus/application-starter/issues/58)) ([bf4c575](https://github.com/ecomplus/application-starter/commit/bf4c575651ad99ffd6acbace95dc1f5feb419137))
* **deps:** update all non-major dependencies ([#59](https://github.com/ecomplus/application-starter/issues/59)) ([e5545d7](https://github.com/ecomplus/application-starter/commit/e5545d72ad6e2f720f2d12db6b75c7641feba7a2))
* **deps:** update all non-major dependencies ([#68](https://github.com/ecomplus/application-starter/issues/68)) ([40f8c6f](https://github.com/ecomplus/application-starter/commit/40f8c6fa598848a5a53f6b69ba3614e6734801cc))
* **deps:** update all non-major dependencies ([#69](https://github.com/ecomplus/application-starter/issues/69)) ([c01a26b](https://github.com/ecomplus/application-starter/commit/c01a26b5dd94812ca7bc6f317fdcc3074a0ce1a0))
* **deps:** update all non-major dependencies ([#70](https://github.com/ecomplus/application-starter/issues/70)) ([712fdc3](https://github.com/ecomplus/application-starter/commit/712fdc348df22de0825494f92a7696e20fefdf5d))
* **deps:** update dependency firebase-tools to ^9.2.0 ([#65](https://github.com/ecomplus/application-starter/issues/65)) ([eb84885](https://github.com/ecomplus/application-starter/commit/eb848859e7c477d52f1ad2e4b4e70589298acccc))
* **deps:** update dependency firebase-tools to v9 ([#61](https://github.com/ecomplus/application-starter/issues/61)) ([dffdf35](https://github.com/ecomplus/application-starter/commit/dffdf351a41f49b717b6316d351fe53670d5452e))

## [1.0.0-starter.16](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.15...v1.0.0-starter.16) (2020-11-05)


### Bug Fixes

* **deps:** add @google-cloud/firestore v4 as direct dep ([e79b789](https://github.com/ecomplus/application-starter/commit/e79b7899b26e900cccc06e71393838ecce3d2133))
* **deps:** update all non-major dependencies ([#38](https://github.com/ecomplus/application-starter/issues/38)) ([37a3346](https://github.com/ecomplus/application-starter/commit/37a3346de56e7c2d17ab84e732c2211d4683be6d))
* **deps:** update all non-major dependencies ([#41](https://github.com/ecomplus/application-starter/issues/41)) ([77b78ef](https://github.com/ecomplus/application-starter/commit/77b78efbc64bfa32719bcd79ba4ed8da2dc57582))
* **deps:** update all non-major dependencies ([#48](https://github.com/ecomplus/application-starter/issues/48)) ([c0042d8](https://github.com/ecomplus/application-starter/commit/c0042d85f06315ffac6157f485a25fe1e0a13a01))
* **deps:** update all non-major dependencies ([#49](https://github.com/ecomplus/application-starter/issues/49)) ([dc4d847](https://github.com/ecomplus/application-starter/commit/dc4d8477f05d3d4d9b83da21d42c5e394e931c82))
* **deps:** update dependency firebase-admin to ^9.2.0 ([#47](https://github.com/ecomplus/application-starter/issues/47)) ([156714a](https://github.com/ecomplus/application-starter/commit/156714a9f3c0e71f28466efdb850874eaec283b6))
* **refresh-tokens:** add scheduled cloud function to run update ([d338924](https://github.com/ecomplus/application-starter/commit/d33892474a8c0c07bab14791cf9c4417baca00d1))

## [1.0.0-starter.15](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.14...v1.0.0-starter.15) (2020-07-26)


### Bug Fixes

* **deps:** bump @ecomplus/application-sdk@firestore ([fe4fe46](https://github.com/ecomplus/application-starter/commit/fe4fe46c2c4e1dfd21790f8c03a84245cb8fc8f3))
* **deps:** update all non-major dependencies ([#36](https://github.com/ecomplus/application-starter/issues/36)) ([b14f2e9](https://github.com/ecomplus/application-starter/commit/b14f2e9cb56d5b18500b678b074dbdbe099b041a))
* **deps:** update dependency firebase-admin to v9 ([#37](https://github.com/ecomplus/application-starter/issues/37)) ([204df95](https://github.com/ecomplus/application-starter/commit/204df95c37d24c455951081f9186178222097778))

## [1.0.0-starter.14](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.13...v1.0.0-starter.14) (2020-06-30)


### Bug Fixes

* **auth-callback:** check `row.setted_up` in place of 'settep_up' ([e2a73ca](https://github.com/ecomplus/application-starter/commit/e2a73ca029868d9c899d4a1c0d982f1c1ed5829f))
* **deps:** update all non-major dependencies ([#31](https://github.com/ecomplus/application-starter/issues/31)) ([702bee9](https://github.com/ecomplus/application-starter/commit/702bee9a31370579dd7718b5722180e5bb8996e8))
* **deps:** update dependency firebase-functions to ^3.7.0 ([#30](https://github.com/ecomplus/application-starter/issues/30)) ([0f459a3](https://github.com/ecomplus/application-starter/commit/0f459a3ab9fe21f8dc9e9bdfce33c0b6d43e3622))
* **deps:** update dependency firebase-tools to ^8.4.2 ([#29](https://github.com/ecomplus/application-starter/issues/29)) ([cf7e61e](https://github.com/ecomplus/application-starter/commit/cf7e61ef50aa976f33725d855ba19d06a7522fd4))
* **pkg:** update deps, start using node 10 ([172ed7f](https://github.com/ecomplus/application-starter/commit/172ed7f223cd23b9874c5d6209928b7d620b0cf6))

## [1.0.0-starter.13](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.12...v1.0.0-starter.13) (2020-06-03)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.13.0 ([b424410](https://github.com/ecomplus/application-starter/commit/b42441089e7020774c9586ed176e691ef4c755be))
* **refresh-tokens:** force appSdk update tokens task ([139a350](https://github.com/ecomplus/application-starter/commit/139a350c230fa36c37ab83e2debfe979d831cb08))

## [1.0.0-starter.12](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.11...v1.0.0-starter.12) (2020-05-29)


### Bug Fixes

* **deps:** replace @ecomplus/application-sdk to firestore version ([3d2ee85](https://github.com/ecomplus/application-starter/commit/3d2ee85feb2edab77950e5c266514152fbc9674d))
* **deps:** update all non-major dependencies ([#21](https://github.com/ecomplus/application-starter/issues/21)) ([7a370da](https://github.com/ecomplus/application-starter/commit/7a370da11dfd098c0a90da05d39fc62f9264fd63))
* **deps:** update all non-major dependencies ([#26](https://github.com/ecomplus/application-starter/issues/26)) ([e37e0e8](https://github.com/ecomplus/application-starter/commit/e37e0e8151768d79e81f4184ab937ddf9d775a4f))
* **deps:** update dependency uglify-js to ^3.9.2 ([#20](https://github.com/ecomplus/application-starter/issues/20)) ([adccf0a](https://github.com/ecomplus/application-starter/commit/adccf0a2fed37f2ccce57ded20d25af85407ac8a))

## [1.0.0-starter.11](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.10...v1.0.0-starter.11) (2020-04-27)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.11.13 ([70584c2](https://github.com/ecomplus/application-starter/commit/70584c245e97a1b539a3df3f74109f20d9a1fa3c))
* **setup:** ensure enable token updates by default ([67aea0e](https://github.com/ecomplus/application-starter/commit/67aea0eb363be3cc535a0f0f4d1b5b682958f243))

## [1.0.0-starter.10](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.9...v1.0.0-starter.10) (2020-04-27)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.11.11 ([b8217d0](https://github.com/ecomplus/application-starter/commit/b8217d03fe92b5c233615a0b6b4c01d7bad676c2))
* **deps:** update all non-major dependencies ([#19](https://github.com/ecomplus/application-starter/issues/19)) ([a99797a](https://github.com/ecomplus/application-starter/commit/a99797a129d6e2383ef5ef69c06afacd13cccfb0))
* **setup:** do not disable updates on refresh-tokens route ([b983a45](https://github.com/ecomplus/application-starter/commit/b983a45ada5575ee6435f7b3016ef35c28355762))

## [1.0.0-starter.9](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.8...v1.0.0-starter.9) (2020-04-21)


### Bug Fixes

* **deps:** update @ecomplus/application-sdk to v1.11.10 ([8da579c](https://github.com/ecomplus/application-starter/commit/8da579c19c6530e8cc9fd338a07aece1fccc64ff))

## [1.0.0-starter.8](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.7...v1.0.0-starter.8) (2020-04-18)


### Bug Fixes

* **deps:** update all non-major dependencies ([#17](https://github.com/ecomplus/application-starter/issues/17)) ([785064e](https://github.com/ecomplus/application-starter/commit/785064ef5bf06db7c084f9b17b37a6077645735b))

## [1.0.0-starter.7](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.6...v1.0.0-starter.7) (2020-04-07)

## [1.0.0-starter.6](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.5...v1.0.0-starter.6) (2020-04-06)


### Bug Fixes

* **deps:** update all non-major dependencies ([#10](https://github.com/ecomplus/application-starter/issues/10)) ([b3c65e5](https://github.com/ecomplus/application-starter/commit/b3c65e5c7eb89a4825eb47c852ce65293d172314))
* **deps:** update all non-major dependencies ([#13](https://github.com/ecomplus/application-starter/issues/13)) ([33ff19b](https://github.com/ecomplus/application-starter/commit/33ff19bbdad1f34b6d1c255089dc0a0e4092b955))
* **deps:** update all non-major dependencies ([#8](https://github.com/ecomplus/application-starter/issues/8)) ([feba5b9](https://github.com/ecomplus/application-starter/commit/feba5b9cdc54e8304beff2b12658a6343ef37569))
* **deps:** update dependency firebase-functions to ^3.6.0 ([#15](https://github.com/ecomplus/application-starter/issues/15)) ([5f7f0a2](https://github.com/ecomplus/application-starter/commit/5f7f0a2bf5c744000996e2a0b78690b363462ee7))
* **deps:** update dependency firebase-tools to ^7.16.1 ([#14](https://github.com/ecomplus/application-starter/issues/14)) ([b8e4798](https://github.com/ecomplus/application-starter/commit/b8e479851bd02bf5929a7df8a71a761f1c1c1654))
* **deps:** update dependency firebase-tools to v8 ([#16](https://github.com/ecomplus/application-starter/issues/16)) ([b72560e](https://github.com/ecomplus/application-starter/commit/b72560e4fc86496499d553e47094ace25436272b))
* **ecom-modules:** fix parsing mod names to filenames and vice versa ([99c185a](https://github.com/ecomplus/application-starter/commit/99c185afebeae77deb61537ed9de1c77132c16ce))

## [1.0.0-starter.5](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.4...v1.0.0-starter.5) (2020-03-05)


### Features

* **market-publication:** handle full featured app publication to Market ([28379dc](https://github.com/ecomplus/application-starter/commit/28379dc3c4784e757c8f25e5d737f6143682b0db))
* **static:** handle static with server app files from public folder ([827d000](https://github.com/ecomplus/application-starter/commit/827d00079b0dc169b2eef31b8e0ac73c596307a8))

## [1.0.0-starter.4](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.3...v1.0.0-starter.4) (2020-02-21)


### Features

* **calculate-shipping:** basic setup for calculate shipping module ([db77595](https://github.com/ecomplus/application-starter/commit/db7759514bb25d151dd4508fb96b84c52b3e94ba))


### Bug Fixes

* **home:** fix replace accets regex exps to generate slug from title ([198cc0b](https://github.com/ecomplus/application-starter/commit/198cc0b911d4874d96f3cd5254d30cab5fe89765))
* **home:** gen slug from pkg name or app title if not set or default ([25c20bf](https://github.com/ecomplus/application-starter/commit/25c20bfade65a86e4f4b1026ef59a5694a022a74))

## [1.0.0-starter.3](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.2...v1.0.0-starter.3) (2020-02-21)

## [1.0.0-starter.2](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.1...v1.0.0-starter.2) (2020-02-21)


### Bug Fixes

* **config:** stop reading app from functions config ([7b9aab7](https://github.com/ecomplus/application-starter/commit/7b9aab727fefe8a5b84695e90a0d68e02b8c3f62))

## [1.0.0-starter.1](https://github.com/ecomplus/application-starter/compare/v1.0.0-starter.0...v1.0.0-starter.1) (2020-02-20)


### Features

* **get-auth:** endpoint to return auth id and token for external usage ([40a8ae2](https://github.com/ecomplus/application-starter/commit/40a8ae2e895d6e32c7032ca500040ec82c80dc5d))
* **server:** also supporting passing Store Id from query ([111f3a7](https://github.com/ecomplus/application-starter/commit/111f3a716fbfd2e155e3fb24242bddcae7cb065c))


### Bug Fixes

* **server:** remove 'routes' path when setting filename for routes ([119524c](https://github.com/ecomplus/application-starter/commit/119524c523a11364ed912769637a6f8e479af5f1))

## [1.0.0-starter.0](https://github.com/ecomplus/application-starter/compare/v0.1.1...v1.0.0-starter.0) (2020-02-18)


### Features

* **router:** recursive read routes dir to auto setup server routes ([ff2b456](https://github.com/ecomplus/application-starter/commit/ff2b45604723a8146c9481ea36a9400da5ccc2bc))


### Bug Fixes

* **home:** fix semver on for app.version (remove version tag if any) ([ad36461](https://github.com/ecomplus/application-starter/commit/ad364614a7f5599850ad39e00a94d310742e8f80))
* **middlewares:** update route files exports (named exports by methods) ([6a22e67](https://github.com/ecomplus/application-starter/commit/6a22e67135bc6110e6da6b4ab25f67ad8d77f597))

### [0.1.1](https://github.com/ecomplus/application-starter/compare/v0.1.0...v0.1.1) (2020-02-18)


### Features

* **env:** get 'pkg' from functions config ([bf45ec3](https://github.com/ecomplus/application-starter/commit/bf45ec33a2147d5be91fdc4955bd6cfa1b0867e2))
* **home:** set version and slug from root package, fix with uris ([d4b61fa](https://github.com/ecomplus/application-starter/commit/d4b61fab427aefdb2ac485d90eb1abe15d6aafc6))


### Bug Fixes

* **env:** firebase doesnt uppercase config ([502185e](https://github.com/ecomplus/application-starter/commit/502185ed30f346d8db77b849d6ba0eb48cb777cb))
* **require:** update @ecomplus/application-sdk dependency name ([d4174ac](https://github.com/ecomplus/application-starter/commit/d4174ac5425b85590db0e92d4b1d69a8567a6c55))

## [0.1.0](https://github.com/ecomplus/application-starter/compare/v0.0.4...v0.1.0) (2020-02-17)

### [0.0.4](https://github.com/ecomclub/firebase-app-boilerplate/compare/v0.0.3...v0.0.4) (2020-02-16)


### Bug Fixes

* **server:** update routes names (refresh-tokens) ([79a2910](https://github.com/ecomclub/firebase-app-boilerplate/commit/79a2910817cf4193b40e02b2b1e6b920e7fefb2d))

### [0.0.3](https://github.com/ecomclub/express-app-boilerplate/compare/v0.0.2...v0.0.3) (2020-02-15)


### Features

* **server:** start reading env options, handle operator token ([ce107b7](https://github.com/ecomclub/express-app-boilerplate/commit/ce107b74cde375e875a85cc3ba0cc6a73740785d))
* **update-tokens:** adding route to start update tokens service (no content) ([20c62ec](https://github.com/ecomclub/express-app-boilerplate/commit/20c62ec6800fc326b89e8cf54b2916f56e5910e4))


### Bug Fixes

* **auth-callback:** fix handling docRef (desn't need to get by id again) ([629ca5a](https://github.com/ecomclub/express-app-boilerplate/commit/629ca5ab9849e3822cc190f423da5bf2e0c4daab))
* **auth-callback:** save procedures if not new, check and set 'settep_up' ([#3](https://github.com/ecomclub/express-app-boilerplate/issues/3)) ([4a01f86](https://github.com/ecomclub/express-app-boilerplate/commit/4a01f86c37e09cd7c0363f6fbc80de6eeef3ba20))
* **ECOM_AUTH_UPDATE_INTERVAL:** disable set interval (no daemons on cloud functions) ([2aa2442](https://github.com/ecomclub/express-app-boilerplate/commit/2aa2442061f0308be9eb9430552fa04ad148788c))
* **env:** fixed to get appInfor variable ([e9b1a3c](https://github.com/ecomclub/express-app-boilerplate/commit/e9b1a3ce0d17ee74a5eada70589340fd5a70e786))
* **env:** fixed to get appInfor variable ([22687e2](https://github.com/ecomclub/express-app-boilerplate/commit/22687e25f611d49f8c01494af114e0289cec251e))
* **middleware:** check standard http headers for client ip ([5045113](https://github.com/ecomclub/express-app-boilerplate/commit/504511329afe9277d540f0f542a316d04634ce9e))

### 0.0.2 (2020-02-11)


### Bug Fixes

* **lib:** remove unecessary/incorrect requires with new deps ([69f2b77](https://github.com/ecomclub/express-app-boilerplate/commit/69f2b77))
* **routes:** fix handling appSdk (param) ([0cf2dde](https://github.com/ecomclub/express-app-boilerplate/commit/0cf2dde))
* **setup:** added initializeApp() to firebase admin ([e941e59](https://github.com/ecomclub/express-app-boilerplate/commit/e941e59))
* **setup:** manually setup ecomplus-app-sdk with firestore ([64e49f8](https://github.com/ecomclub/express-app-boilerplate/commit/64e49f8))
* **setup:** manually setup ecomplus-app-sdk with firestore ([c718bd0](https://github.com/ecomclub/express-app-boilerplate/commit/c718bd0))
* **setup:** manually setup ecomplus-app-sdk with firestore ([33909bf](https://github.com/ecomclub/express-app-boilerplate/commit/33909bf)), closes [/github.com/ecomclub/ecomplus-app-sdk/blob/master/main.js#L45](https://github.com/ecomclub//github.com/ecomclub/ecomplus-app-sdk/blob/master/main.js/issues/L45)
* **startup:** setup routes after appSdk ready, add home route ([d182555](https://github.com/ecomclub/express-app-boilerplate/commit/d182555))


### Features

* **firestore-app-boilerplate:** Initial commit ([c9963f0](https://github.com/ecomclub/express-app-boilerplate/commit/c9963f0))
* **firestore-app-boilerplate:** Initial commit ([be493ea](https://github.com/ecomclub/express-app-boilerplate/commit/be493ea))
* **firestore-support:** minor changes ([3718cba](https://github.com/ecomclub/express-app-boilerplate/commit/3718cba))
* **firestore-support:** refactoring to  use saveProcedures function ([62971ef](https://github.com/ecomclub/express-app-boilerplate/commit/62971ef))
* **firestore-support:** removed sqlite error clausule ([2d47996](https://github.com/ecomclub/express-app-boilerplate/commit/2d47996))
* **routes:** add home route (app json) ([42a3f2b](https://github.com/ecomclub/express-app-boilerplate/commit/42a3f2b))

# [LEGACY] Express App Boilerplate

### [0.1.1](https://github.com/ecomclub/express-app-boilerplate/compare/v0.1.0...v0.1.1) (2019-07-31)


### Bug Fixes

* **procedures:** fix checking for procedures array to run configureSetup ([1371cdc](https://github.com/ecomclub/express-app-boilerplate/commit/1371cdc))

## [0.1.0](https://github.com/ecomclub/express-app-boilerplate/compare/v0.0.2...v0.1.0) (2019-07-31)

### 0.0.2 (2019-07-31)


### Bug Fixes

* chain promise catch on lib getConfig ([281abf9](https://github.com/ecomclub/express-app-boilerplate/commit/281abf9))
* fix mergin hidden data to config ([8b64d58](https://github.com/ecomclub/express-app-boilerplate/commit/8b64d58))
* fix path to require 'get-config' from lib ([11425b0](https://github.com/ecomclub/express-app-boilerplate/commit/11425b0))
* get storeId from header and set on req object ([a3bebaa](https://github.com/ecomclub/express-app-boilerplate/commit/a3bebaa))
* handle error on get config instead of directly debug ([f182589](https://github.com/ecomclub/express-app-boilerplate/commit/f182589))
* routes common fixes ([2758a57](https://github.com/ecomclub/express-app-boilerplate/commit/2758a57))
* using req.url (from http module) instead of req.baseUrl ([d9057ca](https://github.com/ecomclub/express-app-boilerplate/commit/d9057ca))


### Features

* authentication callback ([8f18892](https://github.com/ecomclub/express-app-boilerplate/commit/8f18892))
* conventional store api error handling ([bcde87e](https://github.com/ecomclub/express-app-boilerplate/commit/bcde87e))
* function to get app config from data and hidden data ([ba470f5](https://github.com/ecomclub/express-app-boilerplate/commit/ba470f5))
* getting store id from web.js ([72f18c6](https://github.com/ecomclub/express-app-boilerplate/commit/72f18c6))
* handling E-Com Plus webhooks ([63ba19f](https://github.com/ecomclub/express-app-boilerplate/commit/63ba19f))
* main js file including bin web and local ([6b8a71a](https://github.com/ecomclub/express-app-boilerplate/commit/6b8a71a))
* pre-validate body for ecom modules endpoints ([f06bdb0](https://github.com/ecomclub/express-app-boilerplate/commit/f06bdb0))
* setup app package dependencies and main.js ([b2826ed](https://github.com/ecomclub/express-app-boilerplate/commit/b2826ed))
* setup base app.json ([015599a](https://github.com/ecomclub/express-app-boilerplate/commit/015599a))
* setup daemon processes, configure store setup ([db3ca8c](https://github.com/ecomclub/express-app-boilerplate/commit/db3ca8c))
* setup procedures object ([c5e8627](https://github.com/ecomclub/express-app-boilerplate/commit/c5e8627))
* setup web app with express ([d128430](https://github.com/ecomclub/express-app-boilerplate/commit/d128430))
