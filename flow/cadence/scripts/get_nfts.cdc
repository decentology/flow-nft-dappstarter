import ExampleNFT from "../ExampleNFT.cdc"

pub fun main(address: Address): [&ExampleNFT.NFT] {
  let collection = getAccount(address).getCapability(ExampleNFT.CollectionPublicPath)
                    .borrow<&ExampleNFT.Collection{ExampleNFT.CollectionPublic}>()
                    ?? panic("Could not borrow a reference to the collection")
  let ids = collection.getIDs()

  let answer: [&ExampleNFT.NFT] = []
  for id in ids {
    let nft = collection.borrowExampleNFT(id: id)
    answer.append(nft)
  }

  return answer
}