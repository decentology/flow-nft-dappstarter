import ExampleNFT from "../ExampleNFT.cdc"
import NonFungibleToken from "../NonFungibleToken.cdc"

transaction(name: String, description: String, thumbnail: String, recipient: Address) {
  let Minter: &ExampleNFT.Minter
  let RecipientCollection: &ExampleNFT.Collection{NonFungibleToken.Receiver}
  
  prepare(signer: AuthAccount) {
    self.Minter = signer.borrow<&ExampleNFT.Minter>(from: ExampleNFT.MinterStoragePath)
                    ?? panic("This is not the Minter")

    self.RecipientCollection = getAccount(recipient).getCapability(ExampleNFT.CollectionPublicPath)
                                .borrow<&ExampleNFT.Collection{NonFungibleToken.Receiver}>()
                                ?? panic("Receiver does not have an NFT Collection")
  }

  execute {
    self.Minter.mintNFT(recipient: self.RecipientCollection, name: name, description: description, thumbnail: thumbnail)
  }
}