import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Contract } from 'ethers';
import marketNFT from '../../../types/marketNFT';
import Status from '../../../components/steps';
import buyPropType from "./buyPropType";

export const useBuyNFT = (marketplace: Contract) => {

    const queryClient = useQueryClient();
    
    const buyNFT = async ({item, changeModalState, setTx} : {item: marketNFT, changeModalState: (state:number) => void, setTx: (tx: string) => void}) => {    
        const transaction = await marketplace.buyNFT(item.itemId)
        changeModalState(Status.AwaitConfirmation)
        setTx(transaction.hash)

        const result = await new Promise<marketNFT> (async (resolve, reject) => {
            marketplace.once("nft", async (action, id, issuer) => {
                if (action === "Buy") {
                    await new Promise(r => setTimeout(r, 1000));
                    changeModalState(Status.Confirmed);
                    return resolve(item);
                }
            })
        })

        return result;
    }

    return useMutation<marketNFT, Error, buyPropType>(buyNFT, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(["itemsForSell"]);
        }
    })
}
