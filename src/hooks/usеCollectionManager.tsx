import { ethers, Contract } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { JsonRpcSigner } from '@ethersproject/providers';

import NFTAbi from "../contractsData/NFT.json";
import collectionType from '../types/Collection';

const useCollectionManager = (marketplace: Contract, signer: JsonRpcSigner) => {

    const navigate = useNavigate();

    const fetchCollections = async (account: string) => {
        
        let collections = await marketplace.returnCollections()
        let _collections: collectionType[] = [];
        
        for (let i = 0; i < collections.length; i++) {
        
            let nftcontract = new ethers.Contract(collections[i].Contract, NFTAbi.abi, signer)
            let nftname = await nftcontract.name()
            let nftsymbol = await nftcontract.symbol()
            
            _collections.push({
                id: i,
                name: nftname,
                symbol: nftsymbol,
                contract: collections[i].Contract,
                owner: collections[i].owner,
                image: collections[i].imageLink,
                info: collections[i].info
            })
        }
        
        return _collections;
    }

    return {
        fetchCollections}

}

export default useCollectionManager