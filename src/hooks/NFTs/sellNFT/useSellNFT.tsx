import { JsonRpcSigner } from '@ethersproject/providers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ethers, Contract } from 'ethers';
import marketNFT from '../../../types/marketNFT';
import Status from '../../../components/steps';
import sellPropType from "./sellPropType";

export const useSellNFT = (marketplace: Contract) => {

    const queryClient = useQueryClient();
    
    const sellNFT = async ({item, price, changeModalState, setTx} : {item: marketNFT, price: string, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.sellNFT(item.itemId, ethers.utils.parseEther(price))
        changeModalState(Status.AwaitConfirmation)
        setTx(transaction.hash)

        const result = await new Promise<marketNFT> (async (resolve, reject) => {
            marketplace.once("nft", async (action, id, issuer) => {
                if (action === "Sell") {
                    await new Promise(r => setTimeout(r, 1000));
                    changeModalState(Status.Confirmed);
                    return resolve(item);
                }
            })
        })

        return result;
    }

    return useMutation<marketNFT, Error, sellPropType>(sellNFT, {
        onSuccess: (data) => {
            // queryClient.invalidateQueries(["itemsNotForSell"]);
            let items: marketNFT[] | undefined = queryClient.getQueryData(["itemsNotForSell"]);
            items = items?.filter(item => item.itemId != data.itemId)
            queryClient.setQueryData(["itemsNotForSell"], items);
        }
    })
}