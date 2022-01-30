import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

interface ITransactionContext {
  connectWallet: () => void;
  connectedAccount: string;
}
declare global {
  interface Window {
    ethereum: any;
  }
}
export const TransactionContext = createContext<ITransactionContext>({
  connectWallet: () => {},
  connectedAccount: "",
});

export const useTransactionContext = () => useContext(TransactionContext);

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const TransactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  console.log({ provider, signer, TransactionContract });
};

export const TransactionProvider = ({ children }: { children: any }) => {
  const [connectedAccount, setConnectedAccount] = useState<string>("");

  const isWalletConnected = async () => {
    if (!ethereum) {
      return alert("Please Install metamask");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    try {
      if (!accounts.length) {
        setConnectedAccount(accounts[0]);
      } else {
        console.log("No Accounts found");
      }
      console.log(accounts);
    } catch (error) {
      console.error(error);

      throw new Error("No Ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("Please Install metamask");
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setConnectedAccount(accounts[0]);
      console.log("set account", accounts[0]);
    } catch (err) {
      console.warn(err);
      throw new Error("No Ethereum object");
    }
  };

  useEffect(() => {
    isWalletConnected();
  }, []);

  return (
    <TransactionContext.Provider value={{ connectWallet, connectedAccount }}>
      {children}
    </TransactionContext.Provider>
  );
};
