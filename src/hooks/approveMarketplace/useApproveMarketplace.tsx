import { JsonRpcSigner } from '@ethersproject/providers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ethers, Contract } from 'ethers';

import marketNFT from '../../types/marketNFT';
import NFTAbi from '../../contractsData/NFT.json';
import MarketplaceAddress from '../../contractsData/Marketplace-address.json';
import axios from "axios";

export const useApproveMarketplace = (marketplace: Contract, signer: JsonRpcSigner) => {

    const queryClient = useQueryClient();
    
    const approveMarketplace = async (item: marketNFT) => {    
        const NFTcontract = new ethers.Contract(item.collection, NFTAbi.abi, signer)
        await NFTcontract.approve(MarketplaceAddress.address, item.tokenId)
        
        await new Promise(r => setTimeout(r, 6000));
        item.isMarketplaceApproved = true;

        return item;
    }

    return useMutation<marketNFT, Error, marketNFT>(approveMarketplace, {
        onSuccess: (data) => {
            console.log('Success Mutate');
            axios.post('http://localhost:5000/api/items', data)
            queryClient.invalidateQueries(['itemsNotForSell']);
        }
    })
}