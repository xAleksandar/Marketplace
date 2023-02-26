import { ethers, Contract } from 'ethers';
import { useState } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useQuery } from '@tanstack/react-query';
import marketNFT from '../types/marketNFT';
import NFTAbi from "../contractsData/NFT.json";
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import axios from 'axios';

const useFetchItems = (marketplace: Contract, signer: JsonRpcSigner, initialUser:string, itemType: number) => {

    const [loading, setLoading] = useState <boolean> (true);
    const [items, setItems] = useState <marketNFT[]> ([]);
    const [userAddress, setUserAddress] = useState <string> ("")
    const [trigger, setTrigger] = useState <string> ("")

    useQuery({
        queryKey: ["allItems"],
        queryFn: async () => {
            setLoading(false)
            return await fetchAllItems();
        }
    })

    useQuery({
        queryKey: ["itemsForSell"],
        queryFn: async () => {
            return await fetchUserItems(initialUser, true);
        }
    })

    useQuery({
        queryKey: ["itemsNotForSell"],
        queryFn: async () => {
            const items = await fetchUserItems(initialUser, false);
            console.log('Sell Items: ', items)
            return items;
        }
    })

    const fetchUserItems = async (address: string, forSell: boolean) => {
        const result = await axios.get('http://localhost:5000/api/items');
        const allItems = result.data;
        
        let items: marketNFT[] = [];

        for (let i = 0; i < allItems.length; i++) {
            if (allItems[i].owner.toLowerCase().includes(address.toLowerCase()) && allItems[i].forSell == forSell) {
                items.push({
                    name: allItems[i].name,
                    tokenId: allItems[i].tokenId,
                    itemId: allItems[i].itemId,
                    collection: allItems[i].contract,
                    price: ethers.utils.formatEther(allItems[i].price),
                    bidPrice: ethers.utils.formatEther(allItems[i].bidPrice),
                    rentPrice: ethers.utils.formatEther(allItems[i].rentPrice),
                    rentPeriod: allItems[i].rentPeriod,
                    bidAddress: allItems[i].bidAddress,
                    forSell: allItems[i].forSell,
                    forRent: allItems[i].forSell,
                    image: allItems[i].image,
                    isMarketplaceApproved: allItems[i].isMarketplaceApproved
                })
            }
        }
        
        items.sort((a, b) => a.name.localeCompare(b.name))
        return items; 
    }



    const fetchAllItems = async () => {
        const result = await axios.get('http://localhost:5000/api/items');
        let items: marketNFT[] = result.data;
        items.map(x => {x.bidPrice = ethers.utils.formatEther(x.bidPrice)
                        x.price = ethers.utils.formatEther(x.price)})
        
        return items;
    }

    return {loading,
            setUserAddress,
            setTrigger}

}

export default useFetchItems