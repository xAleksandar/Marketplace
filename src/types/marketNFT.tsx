type marketNFT = {
    name: string
    tokenId: number
    itemId: number
    collection: string
    price: string
    bidPrice: string
    rentPrice: string
    rentPeriod: number
    bidAddress: string
    forSell: boolean
    forRent: boolean
    image: string
    isMarketplaceApproved: boolean
}

export default marketNFT;