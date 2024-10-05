const express = require('express');
const { Account, Aptos, AptosConfig, Network,Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const app = express();

app.use(express.json());

app.post('/campaign',async (req, res) => {
    const { campaign_id, eligible_participants, number_of_likes } = req.body;
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    const privateKey = new Ed25519PrivateKey("0x0151d21635bb42f9dca064f105dfaed85571ef83f7073a26847278baaab6c6b4");
const alice = Account.fromPrivateKey({ privateKey });

   
    console.log(alice);
    const transaction = await aptos.transaction.build.simple({
        sender: alice.accountAddress,
        data: {
            // The Move entry-function
            function: "0xf0c37761c0d644014c98bec8255d5836f13b4120b9059a0dab21a49355dded53::stream::distribute_rewards",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [campaign_id, eligible_participants, number_of_likes],   
        },
    });
    const pendingTransaction = await aptos.signAndSubmitTransaction({
        signer: alice,
        transaction,
    });
    console.log(pendingTransaction);
    res.json({ error: false, data: 'success' });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
