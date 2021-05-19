# CPChain Staking

## User

### Balance

```bash

export KEYSTORE=<keystore file>
export ADDRESS=<address of contract>

bin/user get-balance --contract-file build/contracts/Staking.json --contract-addr $ADDRESS 1455d180e3ade94ebd9cc324d22a9065d1f5f575

```

### 存储

```bash

bin/user deposit --keystore $KEYSTORE --contract-file build/contracts/Staking.json --contract-addr $ADDRESS 5

```

### 提现

```bash

bin/user withdraw --keystore $KEYSTORE --contract-file build/contracts/Staking.json --contract-addr $ADDRESS 1

```

### 申诉

```bash

bin/user appeal --keystore $KEYSTORE --contract-file build/contracts/Staking.json --contract-addr $ADDRESS

```

## Worker

运行一个 worker 程序，将监听智能合约产生的提款事件，自动进行还款

```bash

export WORKER_KEYSTORE=<keystore file>
export PASSWORD=<password file>

bin/worker run --keystore $WORKER_KEYSTORE --contract-file build/contracts/Staking.json --contract-addr $ADDRESS --password $PASSWORD

```

## Admin

```bash

export ADMIN_KEYSTORE=<keystore file>
export ADMIN_PASSWORD=<keystore file>

bin/admin run --keystore $ADMIN_KEYSTORE --contract-file build/contracts/Staking.json --password $ADMIN_PASSWORD

bin/admin stats-interest --keystore $ADMIN_KEYSTORE --contract-file build/contracts/Staking.json --password $ADMIN_PASSWORD

```
