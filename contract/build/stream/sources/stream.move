module kenil::stream {
    use std::vector;
    use std::signer;
    use aptos_framework::aptos_account;

    struct Campaign has copy, drop, store {
        creator: address,
        pool_amount: u64
    }

  

    // Store campaigns with unique ids
     struct CampaignManager has key {
        campaigns: vector<Campaign>,
        campaign_counter: u64,
    }

    public entry fun create_campaign<CoinType>(
        sig: &signer,
        pool_amount: u64,
    ) acquires CampaignManager{

        let manager = borrow_global_mut<CampaignManager>(@kenil);
        assert!(pool_amount > 0, 1); // Pool amount must be greater than 0

        let new_campaign = Campaign {
            creator: signer::address_of(sig),
            pool_amount
        };
        aptos_account::transfer_coins<CoinType>(sig, @kenil, pool_amount);
        //    let coin = aptos_framework::coin::withdraw(sig, pool_amount);
    // aptos_framework::coin::deposit(&manager.contract_address, coin);

        vector::push_back(&mut manager.campaigns, new_campaign);
        manager.campaign_counter = manager.campaign_counter + 1;
    }


    public entry fun distribute_rewards<CoinType>(sig:&signer, campaign_id: u64, userAddress : vector<address>, likes : vector<u64> ) acquires CampaignManager{
        assert!(signer::address_of(sig) == @kenil, 1); // Only the owner can distribute rewards
        let totalLikes:u64=0;
       for(i in 0..vector::length(&likes)){
          totalLikes = totalLikes + *vector::borrow(&likes, i)
       };

            
        let manager = borrow_global_mut<CampaignManager>(signer::address_of(sig));
        let campaign =  vector::borrow_mut(&mut manager.campaigns, campaign_id);
        let totalAmount = campaign.pool_amount;
        let rewardPerLike = totalAmount / totalLikes;

        for(j in 0..vector::length(&userAddress)){
            let userAddress = *vector::borrow(&userAddress, j);
            let numberOfLikes = *vector::borrow(&likes, j);
            let reward = numberOfLikes * rewardPerLike;
            aptos_account::transfer_coins<CoinType>(sig, userAddress , reward);
        }
    
    }

    public fun get_campaign(campaign_id: u64, sig:&signer): (address, u64) acquires CampaignManager {
        let manager = borrow_global_mut<CampaignManager>(signer::address_of(sig));
        let campaign = vector::borrow(&manager.campaigns, campaign_id);
        (
            campaign.creator,     
            campaign.pool_amount
        )
    }

     fun init_module(sig:&signer) {
        let manager = CampaignManager {
            campaigns: vector::empty<Campaign>(),
            campaign_counter: 0,
        };
        move_to<CampaignManager>(sig,manager);
    }
}
