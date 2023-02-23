import { JsonRpcSigner } from '@ethersproject/providers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ethers, Contract } from 'ethers';
import marketNFT from '../../../types/marketNFT';
import Status from '../../../components/steps';
import sellPropType from "./sellPropType";

export const useSellNFT = (marketplace: Contract, signer: JsonRpcSigner, initialUser:string, itemType: number) => {

    const queryClient = useQueryClient();
    
    const sellNFT = async ({item, price, changeModalState, setTx} : {item: marketNFT, price: string, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.sellNFT(item.itemId, ethers.utils.parseEther(price))
        setTx(transaction.hash)
        changeModalState(Status.AwaitConfirmation)
        marketplace.once("nft", async (action, id, issuer) => {
            if(action === "Sell") {
                changeModalState(Status.Confirmed)
            }
        })

        return item;
    }

    return useMutation<marketNFT, Error, sellPropType>(sellNFT, {
        onSuccess: (data) => {
            console.log('test ok')
            const items: marketNFT[] | undefined = queryClient.getQueryData(["itemsNotForSell"]);
            if (items) {
                console.log('Items before: ', items.length)
                const index = items.indexOf(data);
                if (index >= 0) { 
                    items.splice(index, 1);
                    console.log('Items after: ', items.length)
                    queryClient.setQueryData(["itemsNotForSell"], items);
                    const newitems: marketNFT[] | undefined = queryClient.getQueryData(["itemsNotForSell"]);
                    if (newitems) {console.log('NewItems: ', newitems.length)}
                }
            }
        }
    })
}
