# UnitTest

UnitTest list

## Update Parameters

|#|Name|Expect|Done|Success|
|---|----|------|---|-------|
|1|设置 withdraw_fee_numerator 为 0|Success
|2|设置 withdraw_fee_numerator 为 50|Success
|3|设置 withdraw_fee_numerator 为 100|Success
|4|设置 withdraw_fee_numerator 为 10000|Fail
|5|设置 withdraw_fee_numerator 为 10001|Fail
|6|设置 withdraw_fee_numerator 为 101|Fail
|7|设置 worker_balance_limit 为 0| Fail
|8|设置 worker_balance_limit 为 0.1| Fail
|9|设置 worker_balance_limit 为 1 CPC| Success
|10|设置 worker_balance_limit 为 1200000 CPC| Success
|11|设置 user_balance_limit 为 0 | Fail
|12|设置 user_balance_limit 为 0.1 CPC | Fail
|13|设置 user_balance_limit 为 1 CPC | Success
|14|设置 user_balance_limit 为 100000 CPC | Success
|15|设置 tx_upper_limit 为 0 | Fail
|16|设置 tx_upper_limit 为 0.1 CPC | Fail
|17|设置 tx_upper_limit 为 1 CPC | Success
|18|设置 tx_upper_limit 为 100000 CPC | Success
|19|设置 tx_lower_limit 为 0 | Fail
|20|设置 tx_lower_limit 为 0.1 CPC | Fail
|21|设置 tx_lower_limit 为 1 CPC | Success
|22|设置 tx_lower_limit 为 100000 CPC | Success
|23|设置 allowOwnerBeContract 为 true，可将 Owner 更改为 Contract address| Success
|设置 allowOwnerBeContract 为 false，将 Owner 更改为 Contract address| Fail
