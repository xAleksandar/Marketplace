import { ethers, Contract } from 'ethers';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JsonRpcSigner } from '@ethersproject/providers';

import blockchainNFT from '../types/blockchainNFT';
import marketNFT from '../types/marketNFT';
import NFTAbi from "../contractsData/NFT.json";;

const useNFTManager = (marketplace: Contract, signer: JsonRpcSigner) => {

    
    const [nftTrigger, setNftTrigger] = useState <number> (0)
    const [loading, setLoading] = useState <boolean> (true);
    const [items, setItems] = useState <marketNFT[]> ([]);
    const [zeroItems, setZeroItems] = useState <boolean> (false);
    const [userAddress, setUserAddress] = useState <string> ("")
    const [trigger, setTrigger] = useState <string> ("")

    const [openModal, setOpenModal] = useState <boolean> (false);
    const [modalStep, setModalStep] = useState <number> (1);
    const [transactionHash, setTransactionHash] = useState <string> ("");

    useEffect(() => {
        async function load() {
          
          let items = await fetchAllItems("");
          if (items.length === 0) {
            setZeroItems(true)
            
            } else {
                setItems(items);
            }
      
          setLoading(false)
        }
        
        load()}, [])

    const buyNFT = async (marketItem: marketNFT) => {
        const totalitems = (await marketplace.returnItemsLength()).toString()
        
        for (let i = 0; i <=totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            let price = nft.price
            
            if (nftid == marketItem.tokenId && nftaddress == marketItem.collection) {
                await marketplace.buyNFT(i, { value: price})
                marketplace.once("nft", async (action, id, issuer) => {
                    if(action === "Buy" && nftid === id) {
                        console.log('ok')
                    }
                })
            }
        }
    }

    const showModal = (show: boolean) => {
        setOpenModal(show);
    } 

    const bidForNFT = async (marketItem: marketNFT, price: string) => {

        setModalStep(1)
        //setOpenModal(true)
        console.log('Modal is: ', openModal)
        const totalitems: number = parseInt((await marketplace.returnItemsLength()).toString())
        const weiprice: number = parseInt(ethers.utils.parseEther(price).toString())
        
        for (let i = 0; i <= totalitems; i++) {
            let nft = await marketplace.items(i)
            let nftid = nft.tokenId.toString()
            let nftaddress = nft.nft
            
            if (nftid == marketItem.tokenId && nftaddress == marketItem.collection) {
                await marketplace.bidOnNFT(i, { value: weiprice});
                setModalStep(2)
                marketplace.once("nft", async (action, id, issuer) => {
                    if(action === "Bid") {
                        setModalStep(3)
                    }
                })
            }
        }

        marketItem.bidPrice = price;
        return marketItem
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
                        isMarketplaceApproved: false
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
                    isMarketplaceApproved: false
                })
            }
        }
        
        items.sort((a, b) => a.name.localeCompare(b.name))
        return items;
    }

    return {buyNFT, 
            bidForNFT, 
            nftTrigger,
            fetchAllItems,
            items,
            loading,
            zeroItems,
            setUserAddress,
            setTrigger,
            openModal,
            setOpenModal,
            modalStep,
            transactionHash,
            showModal}

}

export default useNFTManager