"""

Deploy the contract by raw transaction

"""
import json
import getpass

from cpc_fusion import Web3

cf = Web3(Web3.HTTPProvider('https://civilian.cpchain.io'))


def deploy():
    """ deploy contract
    """
    # load contract
    with open('./build/contracts/Greeter.json', 'r') as fr:
        contract_data = json.load(fr)
    contract = cf.cpc.contract(
        abi=contract_data['abi'], bytecode=contract_data['bytecode'])

    # build tx
    keystorePath = '/Users/liaojinlong/.cpchain/cpc-home/cpc-operating-cpchain-tech/keystore/key'
    with open(keystorePath, 'r') as fr:
        ks = json.load(fr)
        addr = cf.toChecksumAddress(ks['address'])
    gas_price = cf.cpc.gasPrice
    nonce = cf.cpc.getTransactionCount(addr)
    estimated_gas = contract.constructor("Hello world").estimateGas()
    tx = contract.constructor("Hello world").buildTransaction({
        'gasPrice': gas_price,
        "nonce": nonce,
        "gas": estimated_gas,
        "from": addr,
        "value": cf.toWei(0, 'ether'),
        "type": 0,
        "chainId": 337
    })

    # send tx
    password = getpass.getpass("Please input your password:")
    decrypted_key = cf.cpc.account.decrypt(ks, password)
    password = ""
    signed_txn = cf.cpc.account.signTransaction(tx, decrypted_key)
    tx_hash = cf.cpc.sendRawTransaction(signed_txn.rawTransaction)
            
    # get tx receipt to get contract address
    tx_receipt = cf.cpc.waitForTransactionReceipt(tx_hash)
    address = tx_receipt['contractAddress']
    print(f'{contract_data["contractName"]} Address: {address}')
    return address

def greet():
    # load contract
    with open('./build/contracts/Greeter.json', 'r') as fr:
        contract_data = json.load(fr)
    instance = cf.cpc.contract(
        abi=contract_data['abi'], address='0xfBdf228C0d67C33Bb28DCE6ac68Ee758a3b9dbb3')
    print(instance.functions.greet().call())


if __name__ == '__main__':
    # deploy()
    greet()
