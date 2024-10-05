import asyncio
from aptos_sdk.account import Account
from aptos_sdk.account_address import AccountAddress
from aptos_sdk.aptos_cli_wrapper import AptosCLIWrapper
from aptos_sdk.async_client import FaucetClient, ResourceNotFound, RestClient
from aptos_sdk.bcs import Serializer
from aptos_sdk.package_publisher import PackagePublisher
from aptos_sdk.transactions import (
    EntryFunction,
    TransactionArgument,
    TransactionPayload,
    TypeTag,
)
from aptos_sdk.type_tag import StructTag
import traceback 

class StreamBlockchain(RestClient):
    async def distribute_funds(self, campaign_id):
        try:
            eligible_participants = {
                "eligible_participants": [
                    "0x42bba19b820629bd95466ab17226a1e28c792903a40ced6dc5e85a019f1f4a9f",
                    "0x38919cfacc156727fc1097939cac86709d24b5beb2685dbd2a92706e4bb0c111"
                ],
                "number_of_likes": ["100", "50"]
            }

            contract_address = "0xf0c37761c0d644014c98bec8255d5836f13b4120b9059a0dab21a49355dded53"

            print('before payload')
         
            payload = EntryFunction.natural(
                f"{contract_address}::stream",
                "distribute_rewards",
                [TypeTag(StructTag.from_str("0x1::aptos_coin::AptosCoin"))],
                [TransactionArgument(8, Serializer.u64)],
            )
            print('after payload')

            # sender = {"address": "0xf0c37761c0d644014c98bec8255d5836f13b4120b9059a0dab21a49355dded53", "publicKey": "0xc7c64e5cbd60cf112b105c4b965539b210831e79bb09a1e4a89207bbe6f1d142"}
            private_key = "0x0151d21635bb42f9dca064f105dfaed85571ef83f7073a26847278baaab6c6b4"
            sender = Account.load_key(private_key)

            print('before signed_transaction')
            signed_transaction = await self.create_bcs_signed_transaction(
                sender, TransactionPayload(payload)
            )
            print('after signed_transaction')

            return await self.submit_bcs_transaction(signed_transaction)
        except Exception as e:
            print(traceback.format_exc())
            return {"error": True, "message": str(e)}


async def main():
    NODE_URL = "https://api.testnet.aptoslabs.com/v1"
    rest_client = StreamBlockchain(NODE_URL)

    txn_hash = await rest_client.distribute_funds(8)
    print(txn_hash)

if __name__ == "__main__":
    asyncio.run(main())