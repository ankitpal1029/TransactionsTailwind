import { createContext, useContext, useEffect, useState } from "react";

import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

interface ITransactionContext {
  connectWallet: () => void;
  connectedAccount: string;
  formData: IFormData;
  setFormData: any;
  handleChange: (e: any, name: string) => void;
  sendTransaction: () => void;
  getEthereumContract: () => void;
  transactions: any[];
}

interface IFormData {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
}
declare global {
  interface Window {
    ethereum: any;
  }
}
export const TransactionContext = createContext<ITransactionContext>({
  connectWallet: () => {},
  connectedAccount: "",
  formData: { addressTo: "", amount: "", keyword: "", message: "" },
  setFormData: "",
  handleChange: () => {},
  sendTransaction: () => {},
  getEthereumContract: () => {},
  transactions: [],
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
  return TransactionContract;
};

export const TransactionProvider = ({ children }: { children: any }) => {
  const [connectedAccount, setConnectedAccount] = useState<string>("");
  const [formData, setFormData] = useState<IFormData>({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionCount, setTransactionCount] = useState<string | null>(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState<any[]>([]);

  const getAllTransactions = async () => {
    console.log("get transactions");
    try {
      if (!ethereum) {
        return alert("Please Install metamask");
      }
      const transactionContract = getEthereumContract();
      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structuredTransactions: any = availableTransactions.map(
        (transaction: any) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );

      setTransactions(structuredTransactions);
      console.log(structuredTransactions);
    } catch (error) {
      console.error(error);

      throw new Error("No Ethereum object");
    }
  };

  const handleChange = (e: any, name: string) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const isWalletConnected = async () => {
    if (!ethereum) {
      return alert("Please Install metamask");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    try {
      if (!accounts.length) {
        setConnectedAccount(accounts[0]);
        console.log("calling it..");
      } else {
        console.log("No Accounts found");
      }
      getAllTransactions();
      console.log(accounts);
    } catch (error) {
      console.error(error);

      throw new Error("No Ethereum object");
    }
  };

  const checkIfTransactionExists = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.warn(error);
      throw new Error("No Ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("Please Install metamask");
        return;
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

  const sendTransaction = async () => {
    try {
      if (!ethereum) {
        alert("Please Install metamask");

        return;
      }
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: connectedAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();

      setIsLoading(false);
      console.log(`Completed - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    isWalletConnected();
    checkIfTransactionExists();
    isWalletConnected();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        connectedAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        getEthereumContract,
        transactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
