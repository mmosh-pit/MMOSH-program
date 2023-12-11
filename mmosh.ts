import * as token from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  TokenStandard,
  createV1,
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
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=mainnet-beta`
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
    `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=mainnet-beta`
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
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet-beta`
  );
}

async function main() {
  const endpoint = clusterApiUrl("mainnet-beta");
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const payer = getKeypairFromEnvironment("SECRET_KEY");

  const mintAuthority = getKeypairFromEnvironment("SECRET_KEY");
  const freezeAuthority = getKeypairFromEnvironment("SECRET_KEY");
  const owner = new PublicKey("7zP1BjWppJNpVj1ioxpKE9SaejxSismd8J7d3ortEcNn");
  const TOKEN_DECIMALS = 9;
  const MAX_SUPPLY = 10000000000000000000;

  const umi = createUmi(endpoint);
  const payer_keypair = fromWeb3JsKeypair(payer);
  const signer = createSignerFromKeypair(umi, payer_keypair);
  umi.identity = signer;
  umi.payer = signer;

  const offChainMetadata = {
    name: "MMOSH: The Stoked Token",
    symbol: "MMOSH",
    description:
      "Join us in the MMOSH Pit, a Massively-Multiplayer On-chain Shared Hallucination.",
    image:
      "https://shdw-drive.genesysgo.net/7nPP797RprCMJaSXsyoTiFvMZVQ6y1dUgobvczdWGd35/MMoshCoin.png",
  };
  const shadowURL =
    "https://shdw-drive.genesysgo.net/7nPP797RprCMJaSXsyoTiFvMZVQ6y1dUgobvczdWGd35/MMOSH.json";

  const token_standard = TokenStandard.Fungible;

  const mint = await createNewMint(
    connection,
    payer, // We'll pay the fees
    mintAuthority.publicKey, // We're the mint authority
    freezeAuthority.publicKey, // And the freeze authority >:)
    TOKEN_DECIMALS // !
  );

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
    MAX_SUPPLY
  );

  const mintAddreess = fromWeb3JsPublicKey(new PublicKey(mint.toBase58()));

  setTimeout(async () => {
    await createV1(umi, {
      mint: mintAddreess,
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
      mintAuthority, //mintAuthority
      token.AuthorityType.MintTokens,
      null // this sets the mint authority to null
    );
  }, 10000);
}

main();
