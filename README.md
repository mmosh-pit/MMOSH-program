# MMOSH-program

# Solana Fungible Token with Metadata

This repository contains the source code and information for a Solana-based fungible token with metadata support. This token adheres to the Solana Token Program standards and utilizes the SPL-Token and Metaplex libraries.

## Overview

### Token Features

- **Fungible Token**: Implements a standard Solana fungible token adhering to the SPL-Token standard.
- **Metadata Support**: Enhances the token with metadata, allowing for additional information about each token.

### Token Properties

- **Limited Supply**: The total supply of the token is limited to a 10,000,000,000.
- **Owner**: [Check Owner](https://solscan.io/account/7zP1BjWppJNpVj1ioxpKE9SaejxSismd8J7d3ortEcNn) has the authority to transfer, and manage the token. No one has ability to mint more token.

- **MetaData** [Check the Metadata](https://shdw-drive.genesysgo.net/7nPP797RprCMJaSXsyoTiFvMZVQ6y1dUgobvczdWGd35/MMOSH.json)

## Libraries Used

### SPL-Token

[SPL-Token](https://spl.solana.com/token) is a standard for fungible tokens on the Solana blockchain. This library provides the foundation for creating, managing, and transferring tokens.

To install SPL-Token in your Solana project, use the following:

```bash
npm install @solana/spl-token


```

### Metaplex Token Metadata

[MPL-Token-Metadata](https://developers.metaplex.com/token-metadata)
Program to attach additional data to Fungible or Non-Fungible tokens on Solana. It achieves this using Program Derived Addresses (PDAs) that are derived from the address of Mint accounts.

[MPL Source Code] ((https://github.com/metaplex-foundation/mpl-token-metadata))

To install MPL-Token-Metadata in your Solana project, use the following:

```bash
@metaplex-foundation/mpl-token-metadata


```
