import ExampleNFT from "../ExampleNFT.cdc"
import NonFungibleToken from "../NonFungibleToken.cdc"

transaction(names: [String], descriptions: [String], thumbnails: [String], recipient: Address) {
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
    var i = 0
    while i < names.length {
      self.Minter.mintNFT(recipient: self.RecipientCollection, name: names[i], description: descriptions[i], thumbnail: thumbnails[i])
    }
  }
}