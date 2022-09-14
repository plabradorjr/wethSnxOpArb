### To construct a new coin arbitrage:

- [x] change immutables.js
- [x] change `.env` variables.
- - [x] WALLET_ADDRESS
- - [x] WALLET_SECRET
- - [x] OPTIMISM_WSS_MAINNET

- [x] fund wallet. Both ETH and WETH (or whichever token0 is)
- [x] approve coins - edit and run `node client/approveCoin.js` as approprite for each tokens.

to start listening and execute trade if profitable,
run `node client/calculateArb.js`

- [x] edit and run `node client/sandbox.js` to check if triangular trades succeeds.

## Deploy to Heroku

### Edit Heroku settings

- [x] push this repo to github
- [x] add Procfile
- [x] add engine on package.json

  ```
    "engines": {
      "node": "12.x"
    }
  ```

- [x] run `heroku create my-app-name`
- [x] run `git push heroku main`
- [x] set .env varaibles on heroku
- - [x] run `heroku config:set OPTIMISM_WSS_MAINNET=your-alchemy-key-here`
- - [x] run `heroku config:set WALLET_ADDRESS=your-wallet-address-here`
- - [x] run `heroku config:set WALLET_SECRET=your-walllet-key-here`

- [x] run `heroku scale web=0 arbitrage=1`

### random notes to self

- uniswap v3 fee percents as numbers:

  - 1% = 10000
  - 0.3% = 3000

- make sure package.json dependencies are not under devDependencies.

### Helpful Heroku Commands

- `heroku config` will show your hidden variables

- `heroku logs --tail` will show your script running
