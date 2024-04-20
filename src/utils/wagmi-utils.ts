import { type WalletClient } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { ethers, JsonRpcSigner } from "ethers";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";

export async function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  console.log("chain", chain);
  const network = {
    chainId: chain.id,
    name: chain.name,
    // ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(transport, network);
  return provider.getSigner(account.address);
}

export function useSigner() {
  const { wallet } = usePrivyWagmi();
  const { data: walletClient } = useWalletClient({
    chainId: Number(process.env.REACT_APP_CHAIN_ID),
  });
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
  useEffect(() => {
    async function getSigner() {
      if (!walletClient) return;
      console.log("walletClient", walletClient);

      try {
        const tmpSigner = await walletClientToSigner(walletClient);

        setSigner(tmpSigner);
      } catch (e) {
        console.log("error", e);
      }
    }

    getSigner();
  }, [wallet, walletClient]);
  return signer;
}

export const degenChain = {
  id: 666666666,
  network: "degen",
  name: "Degen",
  nativeCurrency: {
    name: "DEGEN",
    symbol: "DEGEN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.degen.tips"],
    },
    public: {
      http: ["https://rpc.degen.tips"],
    },
  },
  blockExplorers: {
    default: {
      name: "Degen",
      url: "https://explorer.degen.tips",
    },
    etherscan: {
      name: "Degen",
      url: "https://explorer.degen.tips",
    },
  },
  contracts: {
    multicall3: {
      address: "0x7645a7267bA6f746408009B86541a74f6aa2De97",
      blockCreated: 7727600,
    },
  },
  formatters: {
    block: {
      type: "block",
    },
    transaction: {
      type: "transaction",
    },
    transactionReceipt: {
      type: "transactionReceipt",
    },
  },
};
