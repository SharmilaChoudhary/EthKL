// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {IWorldID} from "./IWorldID.sol";
import {ByteHasher} from "./Bytehasher.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CampaignManager {
    using ByteHasher for bytes;
    struct Campaign {
        address creator;
        uint256 poolAmount;
        bool exists;  // To track if the campaign is active
    }
    struct Proof{
uint256 _root;
 uint256 _nullifierHash;
  uint256[8]  _proof;
    }
    address signalArray;
mapping(address => Proof) userToProof;
    
    	error DuplicateNullifier(uint256 nullifierHash);

	/// @dev The World ID instance that will be used for verifying proofs
	IWorldID internal immutable worldId;

	/// @dev The contract's external nullifier hash
	uint256 internal immutable externalNullifier;

	/// @dev The World ID group ID (always 1)
	uint256 internal immutable groupId = 1;

	/// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
	mapping(uint256 => bool) internal nullifierHashes;

	/// @param nullifierHash The nullifier hash for the verified proof
	/// @dev A placeholder event that is emitted when a user successfully verifies with World ID
	event Verified(uint256 nullifierHash);

    	constructor(IWorldID _worldId, string memory _appId, string memory _actionId) {
		worldId = _worldId;
         campaignCounter = 0;
		externalNullifier = abi.encodePacked(abi.encodePacked(_appId).hashToField(), _actionId).hashToField();
	}

    mapping(uint256 => Campaign) public campaigns;  // Mapping to store campaigns by ID
    uint256 public campaignCounter;  // Incremental counter for campaigns

    // Modifier to ensure valid campaign ID
    modifier validCampaign(uint256 campaignId) {
        require(campaigns[campaignId].exists, "Invalid campaign ID");
        _;
    }


    // Create a new campaign with a specified pool of ERC20 tokens
    function createCampaign(address tokenAddress, uint256 poolAmount) public {
        require(poolAmount > 0, "Pool amount must be greater than 0");

            
    
        IERC20 token = IERC20(tokenAddress);


        
        // Transfer tokens to this contract
        require(token.transferFrom(msg.sender, address(this), poolAmount), "Token transfer failed");

        campaigns[campaignCounter] = Campaign({
            creator: msg.sender,
            poolAmount: poolAmount,
            exists: true
        });

        campaignCounter++;
    }

function verifyAndParticipate(address signal, uint256 root, uint256 nullifierHash, uint256[8] calldata proof) public{
if (nullifierHashes[nullifierHash]) revert DuplicateNullifier(nullifierHash);

		// We now verify the provided proof is valid and the user is verified by World ID
		worldId.verifyProof(
			root,
			groupId,
			abi.encodePacked(signal).hashToField(),
			nullifierHash,
			externalNullifier,
			proof
		);

		// We now record the user has done this, so they can't do it again (proof of uniqueness)
		nullifierHashes[nullifierHash] = true;

		// Finally, execute your logic here, for example issue a token, NFT, etc...
		// Make sure to emit some kind of event afterwards!
        userToProof[signal] =  Proof({
            _root : root,
            _nullifierHash : nullifierHash,
            _proof :proof

        });
		emit Verified(nullifierHash);

}

    // Distribute rewards to users in a fixed-size batch
    function distributeRewardsBatch(
        address tokenAddress,
        uint256 campaignId,
        address[] memory userAddresses,
        uint256[] memory likes

    ) public validCampaign(campaignId) {
        require(userAddresses.length == likes.length, "Mismatched user and like arrays");
     

        Campaign storage campaign = campaigns[campaignId];
        uint256 totalLikes = 0;

        // Calculate total likes for the specified batch size
        for (uint256 i = 0; i < userAddresses.length; i++) {
            totalLikes += likes[i];
        }

        require(totalLikes > 0, "Total likes must be greater than zero");
        require(campaign.poolAmount > 0, "Insufficient pool amount");

        uint256 rewardPerLike = campaign.poolAmount / totalLikes;
        IERC20 token = IERC20(tokenAddress);

        // Distribute rewards to users in the specified batch size
        for (uint256 j = 0; j < userAddresses.length; j++) {
            uint256 reward = likes[j] * rewardPerLike;
            require(token.transfer(userAddresses[j], reward), "Reward transfer failed");
        }

        // Update the campaign pool after distribution
        campaign.poolAmount -= (rewardPerLike * totalLikes);

        // Mark the campaign as inactive if the pool is depleted
        if (campaign.poolAmount == 0) {
            campaign.exists = false;
        }
    }

    // Get details of a campaign
    function getCampaign(uint256 campaignId) public view validCampaign(campaignId) returns (address, uint256) {
        Campaign memory campaign = campaigns[campaignId];
        return (campaign.creator, campaign.poolAmount);
    }
}
