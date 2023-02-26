import { JsonRpcSigner } from '@ethersproject/providers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ethers, Contract } from 'ethers';
import marketNFT from '../../../types/marketNFT';
import Status from '../../../components/steps';
import unlistPropType from "./unlistPropType";

export const useUnlistNFT = (marketplace: Contract) => {

    const queryClient = useQueryClient();
    
    const unlistNFT = async ({item, changeModalState, setTx} : {item: marketNFT, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.cancelSell(item.itemId)
        changeModalState(Status.AwaitConfirmation)
        setTx(transaction.hash)

        const result = await new Promise<marketNFT> (async (resolve, reject) => {
            marketplace.once("nft", async (action, id, issuer) => {
                if (action === "CancelSell") {
                    await new Promise(r => setTimeout(r, 1000));
                    changeModalState(Status.Confirmed);
                    return resolve(item);
                }
            })
        })

        return result;
    }

    return useMutation<marketNFT, Error, unlistPropType>(unlistNFT, {
        onSuccess: (data) => {
            // queryClient.invalidateQueries(["itemsForSell"]);
            let items: marketNFT[] | undefined = queryClient.getQueryData(["itemsForSell"]);
            items = items?.filter(item => item.itemId != data.itemId)
            queryClient.setQueryData(["itemsForSell"], items);
        }
    })
}
