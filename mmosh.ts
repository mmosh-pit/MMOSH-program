import * as token from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  TokenStandard,
  createV1,
  createFungible,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import * as dotenv from "dotenv";
dotenv.config();

async function createNewMint(
  connection: Connection,
  payer: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey,
  decimals: number
): Promise<PublicKey> {
  const tokenMint = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=testnet`
  );

  return tokenMint;
}

async function createTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
) {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );

  console.log(
    `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=testnet`
  );

  return tokenAccount;
}

async function mintTokens(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  destination: PublicKey,
  authority: Keypair,
  amount: number
) {
  //const mintInfo = await token.getMint(connection, mint)

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount
  );

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=testnet`
  );
}

async function main() {
  const endpoint = clusterApiUrl("devnet");
  const connection = new Connection(endpoint, "confirmed");

  const payer = getKeypairFromEnvironment("SECRET_KEY");
  const mintAuthority = getKeypairFromEnvironment("SECRET_KEY");
  const freezeAuthority = getKeypairFromEnvironment("SECRET_KEY");
  const owner = new PublicKey("5NwEZHn1yAe9xPHAGuJX8dbwPykNPXtrjL7Q2fK4hjMc");
  const TOKEN_DECIMALS = 9;
  const MAX_SUPPLY = 10000000000;

  const umi = createUmi(endpoint);
  const payer_keypair = fromWeb3JsKeypair(payer);
  const signer = createSignerFromKeypair(umi, payer_keypair);
  umi.identity = signer;
  umi.payer = signer;

  // const mint = fromWeb3JsPublicKey(
  //   new PublicKey("E1pXbzx4SMd1oUtbXz8crcNezykEZgbVS6dCjns5ZARe")
  // );

  const mint = await createNewMint(
    connection,
    payer, // We'll pay the fees
    mintAuthority.publicKey, // We're the mint authority
    freezeAuthority.publicKey, // And the freeze authority >:)
    TOKEN_DECIMALS // !
  );

  //const mint = new PublicKey('CcYGhbFFSx1wCU4RrFJAXF93G995wf1PmcH3qBST4i1g');// DKD Test 1
  //const mint = new PublicKey('9rLMQhLGZ6f855VuNfcS7tMQ4EiYjSqRPj1rYY6cwpkg');// DKD Test 2

  const tokenAccount = await createTokenAccount(
    connection,
    payer,
    mint,
    owner // Associating owner address with the token account
  );

  // Mint tokens to our address
  await mintTokens(
    connection,
    payer,
    mint,
    tokenAccount.address,
    mintAuthority,
    MAX_SUPPLY * 10 ** TOKEN_DECIMALS
  );

  const updateAuthority = createSignerFromKeypair(umi, payer_keypair);

  // SET THESE VALUESz
  const mintAddress = "29Xg3Q4xqj76fN6HukwuNdZhLFqKmnSbtEJpTT7GQV1J";
  // const mint = fromWeb3JsPublicKey(new PublicKey(mintAddress));
  const token_standard = TokenStandard.Fungible;
  const shadowURL =
    "https://bafkreiakhpegkfvz2qhpwpr3aazobyeohgkvrdz2ld4o3bgpzkewinwhda.ipfs.nftstorage.link/";
  const offChainMetadata = {
    name: "DKD test 1",
    symbol: "DKDTest1",
    description: "This is a test of a big token",
    image: "https://i.stack.imgur.com/kqhKa.png",
  };

  await createV1(umi, {
    mint: fromWeb3JsPublicKey(mint),
    updateAuthority: updateAuthority.publicKey,
    name: offChainMetadata.name,
    symbol: offChainMetadata.symbol,
    uri: shadowURL,
    sellerFeeBasisPoints: percentAmount(0),
    tokenStandard: token_standard,
  }).sendAndConfirm(umi);

  await token.setAuthority(
    connection,
    payer,
    mint,
    mintAuthority, //mintAuthoritys
    token.AuthorityType.MintTokens,
    null // this sets the mint authority to null
  );
}

main();
