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

## Appeal and Refund

## Interest Stats

## Transfer
