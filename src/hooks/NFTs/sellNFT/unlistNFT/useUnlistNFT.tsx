import { JsonRpcSigner } from '@ethersproject/providers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ethers, Contract } from 'ethers';
import marketNFT from '../../../../types/marketNFT';
import Status from '../../../../components/steps';
import unlistPropType from "./unlistPropType";

export const useUnlistNFT = (marketplace: Contract, signer: JsonRpcSigner, initialUser:string, itemType: number) => {

    const queryClient = useQueryClient();
    
    const unlistNFT = async ({item, changeModalState, setTx} : {item: marketNFT, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.cancelSell(item.itemId)
        setTx(transaction.hash)
        changeModalState(Status.AwaitConfirmation)
        marketplace.once("nft", async (action, id, issuer) => {
            if(action === "CancelSell") {
                changeModalState(Status.Confirmed)
                queryClient.invalidateQueries(["itemsForSell"])
            }
        })

        return item;
    }

    return useMutation<marketNFT, Error, unlistPropType>(unlistNFT, {
        onSuccess: (data) => {
            const items: marketNFT[] | undefined = queryClient.getQueryData(["itemsForSell"]);
            if (items) {
                console.log('Before: ', items.length)
                const index = items.indexOf(data);
                if (index >= 0) { 
                    items.splice(index, 1);
                    console.log('After: ', items.length)
                    queryClient.setQueryData(["itemsForSell"], items);
                }
            }
        }
    })
}
