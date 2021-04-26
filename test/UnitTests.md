# UnitTest

UnitTest list

## Update Parameters

|#|Name|Expect|Done|
|---|----|------|---|
|1|设置 withdraw_fee_numerator 为 0|Success|Done|
|2|设置 withdraw_fee_numerator 为 50|Success|Done|
|3|设置 withdraw_fee_numerator 为 100|Success|Done|
|4|设置 withdraw_fee_numerator 为 10000|Fail|Done|
|5|设置 withdraw_fee_numerator 为 10001|Fail|Done|
|6|设置 withdraw_fee_numerator 为 101|Fail|Done|
|7|设置 worker_balance_limit 为 0| Fail|Done|
|8|设置 worker_balance_limit 为 0.1 CPC| Fail|Done|
|9|设置 worker_balance_limit 为 1 CPC| Success|Done|
|10|设置 worker_balance_limit 为 1200000 CPC| Success|Done|
|11|设置 user_balance_limit 为 0 | Fail|Done|
|12|设置 user_balance_limit 为 0.1 CPC | Fail|Done|
|13|设置 user_balance_limit 为 1 CPC | Success|Done|
|14|设置 user_balance_limit 为 100000 CPC | Success|Done|
|15|设置 tx_upper_limit 为 0 | Fail|Done|
|16|设置 tx_upper_limit 为 0.1 CPC | Fail|Done|
|17|设置 tx_upper_limit 为 1 CPC | Success|Done|
|18|设置 tx_upper_limit 为 100000 CPC | Success|Done|
|19|设置 tx_lower_limit 为 0 | Fail|Done|
|20|设置 tx_lower_limit 为 0.1 CPC | Fail|Done|
|21|设置 tx_lower_limit 为 1 CPC | Success|Done|
|22|设置 tx_lower_limit 为 100000 CPC | Success|Done|
|23|设置 allowOwnerBeContract 为 true，可将 Owner 更改为 Contract address| Success|Done|
|24|设置 allowOwnerBeContract 为 false，将 Owner 更改为 Contract address| Fail|Done|

## Worker Manager

|#|Name|Done|
|-|----|---|
|1|增加一个 Worker，检查其是否存在，Balance 是否为 0，检查 Worker 总数，检查是否产生了 AddWorker 事件|Done
|2|增加一个 重复 Worker，检查其是否存在，Balance 是否为 0，检查 Worker 总数|Done
|3|批量增加 10 个 Worker，检查 10 个是否都存在，检查 Worker 总数|Done
|4|增加一个 Worker，随即删除，检查其是否存在，检查 Worker 总数，检查是否产生了 RemoveWorker 事件|Done
|5|批量增加 10 个 Worker，随即删除 5 个，随后检查其是否存在，检查 Worker 总数|Done
|6|删除一个不存在的 Worker|Done

## Deposit and Withdraw

|#|Name|Done|
|-|----|---|
|1|存入 10 CPC，需失败，因为没有矿工|Done
|2|初始化 3 个矿工，用户存入 0 CPC，需失败，下限|Done
|3|初始化 3 个矿工，存入 100 CPC，获取其合约中的 Balance，结果为 100 CPC，根据事件获取指定的矿工，获取其余额及其合约 Balance，均需增加了 100 CPC，其余两个需不变，校验用户总 Balane|Done
|4|初始化 3 个矿工，存入 1000000 CPC，需失败，超了上限|Done
|5|初始化 3 个矿工，存入 10 笔资金，每笔 100 CPC，依次获取 Balance，根据事件获取指定矿工的合约中的、与真正的Balance，需有相应数额增加，校验用户总 Balane
|6|初始化 3 个矿工，5 个用户，5 个用户同时开始，依次存入随机 10 笔交易（1000 以下，防止超过上限），每个块后校验用户 Balance 及矿工 Balance，校验用户总 Balane
|7|提取 100 CPC，需失败，因为没有矿工
|8|初始化 3 个矿工，提取 100 CPC，需失败，因为没有存入过
|9|初始化 3 个矿工，存入 100 个 CPC，提取 99 个 CPC，检查提取事件是否产生
|10|初始化 3 个矿工，存入 100 个 CPC，提取 101个 CPC，需失败
|11|初始化 3 个矿工，存入 20001 CPC，失败，超单笔交易上限
|12|初始化 3 个矿工，存入 0.1 个 CPC，失败，超单笔交易下限
|13|初始化 3 个矿工，分批存入 200000 CPC，成功，再存入 100001，失败，超单个账户上限
|14|初始化 3 个矿工，分批存入 200000 CPC 成功，单笔提取 2000 CPC，成功
|14|初始化 3 个矿工，分批存入 200000 CPC 成功，单笔提取 20001 CPC，失败，超单笔提取上限
|15|初始化 3 个矿工，分批存入 200000 CPC 成功，单笔提取 0.1 CPC，失败，超单笔提取下限
|16|初始化 3 个矿工，存入 100 CPC，取出 100 CPC，成功，需检查 Balance 和 Withdrawn balance
|17|初始化 3 个矿工，存入 100 CPC，取出 1 CPC，成功，需检查 Balance 和 Withdrawn balance
|18|初始化 3 个矿工，存入 100 CPC，取出 50 CPC，成功；再取出 50 CPC，失败，因为上笔提现尚未处理

## Worker Refund

## User Appeal and Admin Refund

## Interest Stats

## Transfer
