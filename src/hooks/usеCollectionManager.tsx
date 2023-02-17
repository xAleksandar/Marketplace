import { ethers, Contract } from 'ethers';
import { useState, useEffect } from 'react';
import { JsonRpcSigner } from '@ethersproject/providers';

import NFTAbi from "../contractsData/NFT.json";
import collectionType from '../types/Collection';

const useCollectionManager = (marketplace: Contract, signer: JsonRpcSigner, initialUser: string) => {

    const [loading, setLoading] = useState <boolean> (true);
    const [zeroItems, setZeroItems] = useState <boolean> (false);
    const [collections, setCollections] = useState <collectionType[]> ([]);

    const [collectionName, setCollectionName] = useState <string> ('');
    const [collectionTicker, setCollectionTicker] = useState <string> ('');
    const [collectionImage, setCollectionImage] = useState <string> ('');
    const [collectionDescription, setCollectionDescription] = useState <string> ('');
    const [collectionIsRentable, setCollectionIsRentable] = useState <boolean> (false);

    useEffect(() => {
        async function load() {
          
          const _collections = await fetchCollections(initialUser);
          if (_collections.length === 0) {
            setZeroItems(true)
            
            } else {
                setCollections(_collections);
            }
      
          setLoading(false)
        }
        
        load()}, [])

    

    const mintCollection = async (image: string, changeModalState: (state:number) => void, setTx: (tx: string) => void) => {
        const transaction = await marketplace.createCollection(
            collectionName, 
            collectionTicker, 
            image, 
            collectionDescription,
            collectionIsRentable);

        setTx(transaction.hash)
        changeModalState(2)

        marketplace.once("newCollection", async (collectionAddress, owner) => {

        if (initialUser.toString().toLowerCase() == owner.toLowerCase()) {
            changeModalState(3)
        }
        })
    }



    const fetchCollections = async (account: string) => {
        
        let collections = await marketplace.returnCollections();
        let _collections: collectionType[] = [];

        for (let i = 0; i < collections.length; i++) {
        
            let nftcontract = new ethers.Contract(collections[i].Contract, NFTAbi.abi, signer)
            let nftname = await nftcontract.name()
            let nftsymbol = await nftcontract.symbol()
            
            if (initialUser === "") {
                _collections.push({
                    id: i,
                    name: nftname,
                    symbol: nftsymbol,
                    contract: collections[i].Contract,
                    owner: collections[i].Owner,
                    image: collections[i].imageLink,
                    info: collections[i].info
                })
            }
            
            else if (initialUser === collections[i].Owner.toLowerCase()) {
                _collections.push({
                    id: i,
                    name: nftname,
                    symbol: nftsymbol,
                    contract: collections[i].Contract,
                    owner: collections[i].Owner,
                    image: collections[i].imageLink,
                    info: collections[i].info
                })
            }
        }
        
        return _collections;
    }

    return {
        loading,
        zeroItems,
        collections,
        setCollectionName,
        setCollectionTicker,
        setCollectionImage,
        setCollectionDescription,
        setCollectionIsRentable,
        fetchCollections,
        mintCollection}

}

export default useCollectionManager