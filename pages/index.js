import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import "../flow/config.js";

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false });
  const [list, setList] = useState([]);

  // For minting NFT
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [recipient, setRecipient] = useState('');

  // This keeps track of the logged in 
  // user for you automatically.
  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, [])

  useEffect(() => {
    setList([]);
  }, [user])

  async function getNFTs() {

    const result = await fcl.send([
      fcl.script`
      import ExampleNFT from 0xDeployer

      pub fun main(address: Address): [NFT] {
        let collection = getAccount(address).getCapability(ExampleNFT.CollectionPublicPath)
                          .borrow<&ExampleNFT.Collection{ExampleNFT.CollectionPublic}>()
                          ?? panic("Could not borrow a reference to the collection")

        let ids = collection.getIDs()

        let answer: [NFT] = []

        for id in ids {
          // Get the basic display information for this NFT
          let nft = collection.borrowExampleNFT(id: id)!
          answer.append(
            NFT(
              id: id, 
              name: nft.name, 
              description: nft.description, 
              thumbnail: nft.thumbnail
            )
          )
        }

        return answer
      }

      pub struct NFT {
        pub let id: UInt64
        pub let name: String 
        pub let description: String 
        pub let thumbnail: String
        
        init(id: UInt64, name: String, description: String, thumbnail: String) {
          self.id = id
          self.name = name 
          self.description = description
          self.thumbnail = thumbnail
        }
      }
      `,
      fcl.args([
        fcl.arg(user?.addr, t.Address)
      ])
    ]).then(fcl.decode);

    console.log(result)

    setList(result);

    console.log(list)
  }

  async function transferNFT(recipient, withdrawID) {

    const transactionId = await fcl.send([
      fcl.transaction`
      import ExampleNFT from 0xDeployer
      import NonFungibleToken from 0xDeployer

      transaction(recipient: Address, withdrawID: UInt64) {
        let ProviderCollection: &ExampleNFT.Collection{NonFungibleToken.Provider}
        let RecipientCollection: &ExampleNFT.Collection{NonFungibleToken.CollectionPublic}
        
        prepare(signer: AuthAccount) {
          self.ProviderCollection = signer.borrow<&ExampleNFT.Collection{NonFungibleToken.Provider}>(from: ExampleNFT.CollectionStoragePath)
                                      ?? panic("This user does not have a Collection.")

          self.RecipientCollection = getAccount(recipient).getCapability(ExampleNFT.CollectionPublicPath)
                                      .borrow<&ExampleNFT.Collection{NonFungibleToken.CollectionPublic}>()!
        }

        execute {
          self.RecipientCollection.deposit(token: <- self.ProviderCollection.withdraw(withdrawID: withdrawID))
        }
      }
      `,
      fcl.args([
        fcl.arg(recipient, t.Address),
        fcl.arg(withdrawID, t.UInt64)
      ]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(999)
    ]).then(fcl.decode);

    console.log({transactionId});
    setList(result);
  }

  async function mintNFT() {

    const transactionId = await fcl.send([
      fcl.transaction`
      import ExampleNFT from 0xDeployer
      import NonFungibleToken from 0xDeployer

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
      `,
      fcl.args([
        fcl.arg(name, t.String),
        fcl.arg(description, t.String),
        fcl.arg(image, t.String),
        fcl.arg(recipient, t.Address)
      ]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(999)
    ]).then(fcl.decode);

    console.log({transactionId});
  }

  async function setupCollection() {

    const transactionId = await fcl.send([
      fcl.transaction`
      import ExampleNFT from 0xDeployer
      import NonFungibleToken from 0xDeployer

      transaction() {
        
        prepare(signer: AuthAccount) {
          if signer.borrow<&ExampleNFT.Collection>(from: ExampleNFT.CollectionStoragePath) == nil {
            signer.save(<- ExampleNFT.createEmptyCollection(), to: ExampleNFT.CollectionStoragePath)
            signer.link<&ExampleNFT.Collection{ExampleNFT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>(ExampleNFT.CollectionPublicPath, target: ExampleNFT.CollectionStoragePath)
          }
        }

        execute {
          
        }
      }
      `,
      fcl.args([]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(999)
    ]).then(fcl.decode);

    console.log({transactionId});
  }

  return (
    <div>
    <Head>
      <title>NFT Module</title>
      <meta name="description" content="Decentology Flow Module" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main>
      <h1>{user?.addr}</h1>
      <button onClick={() => fcl.authenticate()}>Login</button>
      <button onClick={() => fcl.unauthenticate()}>Logout</button>
      <button onClick={setupCollection}>Setup Account</button>
      <button onClick={mintNFT}>Mint NFT</button>
      <input type="text" placeholder='name' onChange={e => setName(e.target.value)} />
      <input type="text" placeholder='description' onChange={e => setDescription(e.target.value)} />
      <input type="text" placeholder='image' onChange={e => setImage(e.target.value)} />
      <input type="text" placeholder='recipient' onChange={e => setRecipient(e.target.value)} />
      <button onClick={getNFTs}>Get NFTs</button>
      <p>{JSON.stringify(list)}</p>
    </main>
  </div>
  )
}
