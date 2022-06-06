import ExampleNFT from "../ExampleNFT.cdc"

pub fun main(address: Address, id: UInt64): &ExampleNFT.NFT {
  let collection = getAccount(address).getCapability(ExampleNFT.CollectionPublicPath)
                    .borrow<&ExampleNFT.Collection{ExampleNFT.CollectionPublic}>()
                    ?? panic("Could not borrow a reference to the collection")

  return collection.borrowExampleNFT(id: id)
}