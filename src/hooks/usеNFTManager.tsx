import { ethers, Contract } from 'ethers';
import { useState, useEffect } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import blockchainNFT from '../types/blockchainNFT';
import marketNFT from '../types/marketNFT';
import NFTAbi from "../contractsData/NFT.json";
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import axios from 'axios';

const useNFTManager = (marketplace: Contract, signer: JsonRpcSigner, initialUser:string, itemType: number) => {

    
    const [nftTrigger, setNftTrigger] = useState <number> (0)
    const [loading, setLoading] = useState <boolean> (true);
    const [items, setItems] = useState <marketNFT[]> ([]);
    const [zeroItems, setZeroItems] = useState <boolean> (false);
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
            return await fetchUserItems(initialUser, false);
        }
    })

    const mintNFT = async (collectionId: number, image: string, changeModalState: (state:number) => void, setTx: (tx: string) => void) => {
        const transaction = await marketplace.mintNFT(collectionId, image);
        changeModalState(2)
        setTx(transaction.hash)
        
        marketplace.once("nft", async (action, id, issuer) => {
            if (initialUser.toString().toLowerCase() == issuer.toLowerCase() && action === "Mint") {
            changeModalState(3)
            }
        })
        }



    const buyNFT = async (marketItem: marketNFT, changeModalState: (state:number) => void, setTx: (tx: string) => void) => {
        const totalitems = (await marketplace.returnItemsLength()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            let price = nft.price
            
            if (nftid == marketItem.tokenId && nftaddress == marketItem.collection) {
                const transaction = await marketplace.buyNFT(i, { value: price})
                changeModalState(2)
                setTx(transaction.hash);
                marketplace.once("nft", async (action, id, issuer) => {
                    if(action === "Buy") {
                        changeModalState(3)
                    }
                })
            }
        }

        marketItem.forSell = false;
        return marketItem;
    } 



    const unlistNFT = async (marketItem: marketNFT, changeModalState: (state:number) => void, setTx: (tx: string) => void) => {
        const totalitems = (await marketplace.returnItemsLength()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            let price = nft.price
            
            if (nftid == marketItem.tokenId && nftaddress == marketItem.collection) {
                const transaction = await marketplace.cancelSell(i);
                changeModalState(2)
                setTx(transaction.hash);
                marketplace.once("nft", async (action, id, issuer) => {
                    if(action === "CancelSell") {
                        changeModalState(3)
                    }
                })
            }
        }

        marketItem.forSell = false;
        return marketItem;
    } 



    const bidForNFT = async (marketItem: marketNFT, price: string, changeModalState: (state:number) => void, setTx: (tx: string) => void) => {

        const totalitems: number = parseInt((await marketplace.returnItemsLength()).toString())
        const weiprice: number = parseInt(ethers.utils.parseEther(price).toString())
        
        for (let i = 0; i <= totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == marketItem.tokenId && nftaddress == marketItem.collection) {
                const transaction = await marketplace.bidOnNFT(i, { value: weiprice});
                changeModalState(2)
                setTx(transaction.hash);
                marketplace.once("nft", async (action, id, issuer) => {
                    if(action === "Bid") {
                        changeModalState(3)
                    }
                })
            }
        }

        marketItem.bidPrice = price;
        return marketItem
    }



    const sellNFT = async (item: marketNFT, price: string, changeModalState: (state:number) => void, setTx: (tx: string) => void) => {
        const weiprice = ethers.utils.parseEther(price)
        const totalitems = parseInt((await marketplace.returnItemsLength()).toString())
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == item.tokenId && nftaddress == item.collection) {
                const transaction = await marketplace.sellNFT(i, weiprice)
                setTx(transaction.hash)
                changeModalState(2)
                marketplace.once("nft", async (action, id, issuer) => {
                    if(action === "Sell") {
                        changeModalState(3)
                    }
                })
            }
        }
    }



    const acceptBid = async (item: marketNFT) => {
        const totalitems = parseInt((await marketplace.returnItemsLength()).toString())

        for (let i = 0; i <= totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == item.tokenId && nftaddress == item.collection) {
                await marketplace.acceptBid(i)
            }
        }
    }



    const fetchUserItems = async (address: string, forSell: boolean) => {
        const result = await axios.get('http://localhost:5000/api/items');
        const allItems = result.data;
        
        let items: marketNFT[] = [];

        for (let i = 0; i < allItems.length; i++) {
            if (allItems[i].owner.toLowerCase().includes(address.toLowerCase()) && allItems[i].forSell == forSell) {
                items.push({
                    name: allItems[i].name,
                    tokenId: allItems[i].tokenId,
                    itemId: allItems[i].tokenId,
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



    const approveMarketplace = async (marketItem: marketNFT) => {
        const NFTcontract = new ethers.Contract(marketItem.collection, NFTAbi.abi, signer)
        await NFTcontract.approve(MarketplaceAddress.address, marketItem.tokenId)
        marketItem.isMarketplaceApproved = true;
        console.log('MarketItem: ',)
        return marketItem
    }



    return {mintNFT,
            buyNFT,
            unlistNFT, 
            bidForNFT, 
            nftTrigger,
            fetchAllItems,
            items,
            loading,
            zeroItems,
            setUserAddress,
            setTrigger,
            approveMarketplace,
            sellNFT,
            acceptBid}

}

export default useNFTManager