# CPChain Staking

![Test Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/zgljl2012/c622d70b5cc670c03e07cf2e04828696/raw/cpchain-dapps-staking__heads_master.json)

## Build & Deploy

```bash

truffle build

export KEYSTORE="<your keystore file>"

bin/admin deploy --keystore $KEYSTORE --contract-file build/contracts/Staking.json

export ADDRESS="<contract address>"

# check configurations
bin/admin show-configs --contract-file build/contracts/Staking.json --contract-addr $ADDRESS

```

## Unit Tests

```bash

truffle test

truffle run coverage

```

## Workers Manage

### Add Worker

```bash

bin/admin add-worker --keystore $KEYSTORE --contract-file build/contracts/Staking.json --contract-addr $ADDRESS

```

### Remove Worker

```bash

bin/admin remove-worker --keystore $KEYSTORE --contract-file build/contracts/Staking.json --contract-addr $ADDRESS

```
