# CPChain Staking

![Test Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/zgljl2012/c622d70b5cc670c03e07cf2e04828696/raw/cpchain-dapps-staking__heads_master.json)

## Build & Deploy

```bash

truffle build

export KEYSTORE="<your keystore file>"

bin/admin deploy --keystore $KEYSTORE --contract-file build/contracts/Staking.json

# check configurations
bin/admin show-configs --contract-file build/contracts/Staking.json

export ADDRESS="<contract address>"

```

## Unit Tests

```bash

truffle test

truffle run coverage

```

## Workers Manage

### Add Worker

```bash

bin/admin add-worker --keystore $KEYSTORE --contract-file build/contracts/Staking.json <worker address>

# check a address
bin/admin is-worker --contract-file build/contracts/Staking.json <worker address>

```

### Remove Worker

```bash

bin/admin remove-worker --keystore $KEYSTORE --contract-file build/contracts/Staking.json <worker address>

```

### List Workers

```bash

bin/admin list-workers --contract-file build/contracts/Staking.json

```

## User Deposit and Withdraw

```bash

# Deposit
bin/user deposit --keystore $KEYSTORE --contract-file build/contracts/Staking.json --contract-addr $ADDRESS 2

bin/user get-balance --contract-file build/contracts/Staking.json --contract-addr $ADDRESS

```
