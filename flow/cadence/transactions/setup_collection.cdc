import ExampleNFT from "../ExampleNFT.cdc"
import NonFungibleToken from "../NonFungibleToken.cdc"

transaction() {
  
  prepare(signer: AuthAccount) {
    if signer.borrow<&ExampleNFT.Collection>(from: ExampleNFT.CollectionStoragePath) == nil {
      signer.save(<- ExampleNFT.createEmptyCollection(), to: ExampleNFT.CollectionStoragePath)
      signer.link<&ExampleNFT.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, ExampleNFT.CollectionPublic}>(ExampleNFT.CollectionPublicPath, target: ExampleNFT.CollectionStoragePath)
    }
  }

  execute {
    
  }
}