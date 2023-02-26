import marketNFT from "../../../types/marketNFT";

type acceptBidPropType = {
    item: marketNFT,
    changeModalState: (state:number) => void,
    setTx: (tx: string) => void
}

export default acceptBidPropType