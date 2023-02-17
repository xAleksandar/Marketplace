import { ethers, Contract } from 'ethers';
import { useState, useEffect } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';

import blockchainNFT from '../types/blockchainNFT';
import marketNFT from '../types/marketNFT';
import NFTAbi from "../contractsData/NFT.json";
import MarketplaceAddress from '../contractsData/Marketplace-address.json';

const useNFTManager = (marketplace: Contract, signer: JsonRpcSigner, initialUser:string, itemType: number) => {

    
    const [nftTrigger, setNftTrigger] = useState <number> (0)
    const [loading, setLoading] = useState <boolean> (true);
    const [items, setItems] = useState <marketNFT[]> ([]);
    const [zeroItems, setZeroItems] = useState <boolean> (false);
    const [userAddress, setUserAddress] = useState <string> ("")
    const [trigger, setTrigger] = useState <string> ("")

    useEffect(() => {
        async function load() {
          
            // itemType 0: All Items
            // itemType 1: Items for Sell
            // itemType 2: items not for sell
            
            if (itemType === 0) {
                let items = await fetchAllItems(initialUser);
                if (items.length === 0) {
                    setZeroItems(true)
                    
                    } else {
                        setItems(items);
                    }
                
            } else if (itemType === 1) {
                let items = await fetchItems(initialUser, true);
                if (items.length === 0) {
                    setZeroItems(true)
                    
                    } else {
                        setItems(items);
                    }
                
            } else if (itemType === 2) {
                let items = await fetchItems(initialUser, false);
                if (items.length === 0) {
                    setZeroItems(true)
                    
                    } else {
                        setItems(items);
                    }
            }
            
            setLoading(false)
        }
        
        load()}, [userAddress])
    


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



    const fetchItems = async (address: string, forSell: boolean) => {

        const totalmarketitems = (await marketplace.returnItemsLength()).toString()
        const changeLoadingMessage = Math.round((totalmarketitems.length / 100 ) * 85)
        let items: marketNFT[] = []
        
        for (let i = 1; i <=totalmarketitems; i++) {
    
            let nft: blockchainNFT = await marketplace.items(i)
            if (nft.forSell === forSell) {
                let NFTcontract: Contract = new Contract(nft.nft, NFTAbi.abi, signer)
                let nftname = await NFTcontract.name()
                let uri = await NFTcontract.tokenURI(nft.tokenId.toString())
                let approvedAddress = await NFTcontract.getApproved(nft.tokenId);
                let isApproved = (approvedAddress === MarketplaceAddress.address)

                if (address.length >= 1) {
                    let nftowner = await NFTcontract.ownerOf(nft.tokenId);
                    if (nftowner.toLowerCase().includes(address.toLowerCase())) {
                        items.push({
                            name: nftname + " #" + nft.tokenId.toString(),
                            tokenId: nft.tokenId,
                            collection: nft.nft,
                            price: ethers.utils.formatEther(nft.price),
                            bidPrice: ethers.utils.formatEther(nft.bidPrice),
                            rentPrice: ethers.utils.formatEther(nft.rentPrice),
                            rentPeriod: nft.rentPeriod,
                            bidAddress: nft.bidAddress,
                            forSell: nft.forSell,
                            forRent: nft.forSell,
                            image: uri,
                            isMarketplaceApproved: isApproved
                        })
                    }
                } else {

                    items.push({
                        name: nftname + " #" + nft.tokenId.toString(),
                        tokenId: nft.tokenId,
                        collection: nft.nft,
                        price: ethers.utils.formatEther(nft.price),
                        bidPrice: ethers.utils.formatEther(nft.bidPrice),
                        rentPrice: ethers.utils.formatEther(nft.rentPrice),
                        rentPeriod: nft.rentPeriod,
                        bidAddress: nft.bidAddress,
                        forSell: nft.forSell,
                        forRent: nft.forSell,
                        image: uri,
                        isMarketplaceApproved: isApproved
                    })
                }
            }
        }

        items.sort((a, b) => a.name.localeCompare(b.name))
        return items;
    }



    const fetchAllItems = async (address: string) => {

        const totalmarketitems = (await marketplace.returnItemsLength()).toString()
        const changeLoadingMessage = Math.round((totalmarketitems.length / 100 ) * 85)
        let items: marketNFT[] = []
        
        for (let i = 1; i <=totalmarketitems; i++) {
    
            let nft: blockchainNFT = await marketplace.items(i)
            let NFTcontract: Contract = new Contract(nft.nft, NFTAbi.abi, signer)
            let nftname = await NFTcontract.name()
            let uri = await NFTcontract.tokenURI(nft.tokenId.toString())
            let approvedAddress = await NFTcontract.getApproved(nft.tokenId);
            let isApproved = (approvedAddress === MarketplaceAddress.address)

            if (address.length >= 1) {
                let nftowner = await NFTcontract.ownerOf(nft.tokenId);
                if (nftowner.toLowerCase().includes(address.toLowerCase())) {
                    items.push({
                        name: nftname + " #" + nft.tokenId.toString(),
                        tokenId: nft.tokenId,
                        collection: nft.nft,
                        price: ethers.utils.formatEther(nft.price),
                        bidPrice: ethers.utils.formatEther(nft.bidPrice),
                        rentPrice: ethers.utils.formatEther(nft.rentPrice),
                        rentPeriod: nft.rentPeriod,
                        bidAddress: nft.bidAddress,
                        forSell: nft.forSell,
                        forRent: nft.forSell,
                        image: uri,
                        isMarketplaceApproved: isApproved
                    })
                }
            } else {

                items.push({
                    name: nftname + " #" + nft.tokenId.toString(),
                    tokenId: nft.tokenId,
                    collection: nft.nft,
                    price: ethers.utils.formatEther(nft.price),
                    bidPrice: ethers.utils.formatEther(nft.bidPrice),
                    rentPrice: ethers.utils.formatEther(nft.rentPrice),
                    rentPeriod: nft.rentPeriod,
                    bidAddress: nft.bidAddress,
                    forSell: nft.forSell,
                    forRent: nft.forSell,
                    image: uri,
                    isMarketplaceApproved: isApproved
                })
            }
        }
        
        items.sort((a, b) => a.name.localeCompare(b.name))
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