import marketNFT from "../../../types/marketNFT"

type bidPropType = {
    item: marketNFT,
    bidprice: string,
    changeModalState: (state:number) => void,
    setTx: (tx: string) => void
}

export default bidPropType