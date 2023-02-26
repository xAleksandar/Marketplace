import { JsonRpcSigner } from '@ethersproject/providers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Contract } from 'ethers';
import marketNFT from '../../../types/marketNFT';
import Status from '../../../components/steps';
import acceptBidPropType from "./acceptBidPropType";

export const useAcceptBidNFT = (marketplace: Contract) => {

    const queryClient = useQueryClient();
    
    const acceptBid = async ({item, changeModalState, setTx} : {item: marketNFT, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.acceptBid(item.itemId)
        changeModalState(Status.AwaitConfirmation)
        setTx(transaction.hash)

        const result = await new Promise<marketNFT> (async (resolve, reject) => {
            marketplace.once("nft", async (action, id, issuer) => {
                if (action === "AcceptBid") {
                    await new Promise(r => setTimeout(r, 1000));
                    changeModalState(Status.Confirmed);
                    return resolve(item);
                }
            })
        })

        return result;
    }

    return useMutation<marketNFT, Error, acceptBidPropType>(acceptBid, {
        onSuccess: (data) => {
            // queryClient.invalidateQueries(["itemsNotForSell"]);
            let items: marketNFT[] | undefined = queryClient.getQueryData(["itemsNotForSell"]);
            items = items?.filter(item => item.itemId != data.itemId)
            queryClient.setQueryData(["itemsNotForSell"], items);
        }
    })
}
