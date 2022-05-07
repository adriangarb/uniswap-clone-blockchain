import {useState, useEffect, createContext} from "react";
export const TransactionContext = createContext();
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import {contractABI, contractAddress} from '../lib/constants';
import { client } from '../lib/sanityClient'
let eth
if(typeof window !== 'undefined'){
    eth = window.ethereum
}
const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer,
  )
  return transactionContract
}
export const TransactionProvider = ({children}) =>{
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: ''
    })
    const [currentAccount,setCurrentAccount] = useState()
    const router = useRouter()
    const connectWallet = async (metamask = eth) => {
        try {
          if (!metamask) return alert('Please install metamask ')
    
          let accounts = await metamask.request({ method: 'eth_requestAccounts' })
    
          setCurrentAccount(accounts[0])
        } catch (error) {
          console.error(error)
          throw new Error('No ethereum object.')
        }
      }
      const checkIfWalletIsConnected = async (metamask = eth) => {
        try {
          if (!metamask) return alert('Please install metamask ')
    
          let accounts = await metamask.request({ method: 'eth_accounts' })
    
          if (accounts.length) {
            setCurrentAccount(accounts[0])
          }
        } catch (error) {
          console.error(error)
          throw new Error('No ethereum object.')
        }
      }
      const sendTransaction = async (
        metamask = eth,
        connectedAccount = currentAccount,
      ) => {
        try {
          if (!metamask) return alert('Please install metamask ')
          const { addressTo, amount } = formData
          const transactionContract = getEthereumContract()
    
          const parsedAmount = ethers.utils.parseEther(amount)
    
          await metamask.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: connectedAccount,
                to: addressTo,
                gas: '0x7EF40', // 520000 Gwei
                value: parsedAmount._hex,
              },
            ],
          })
    
          const transactionHash = await transactionContract.publishTransaction(
            addressTo,
            parsedAmount,
            `Transferring ETH ${parsedAmount} to ${addressTo}`,
            'TRANSFER',
          )
    
          setIsLoading(true)
    
          await transactionHash.wait()
    
          await saveTransaction(
            transactionHash.hash,
            amount,
            connectedAccount,
            addressTo,
          )
          setIsLoading(false)
        } catch (error) {
          console.log(error)
        }
      }
      useEffect(() => {
        if (!currentAccount) return
        ;(async () => {
          const userDoc = {
            _type: 'users',
            _id: currentAccount,
            userName: 'Unnamed',
            address: currentAccount,
          }
    
          await client.createIfNotExists(userDoc)
        })()
      }, [currentAccount])
    const handleChange = (e, name) =>{
        setFormData(prevState=>({...prevState, [name]: e.target.value}))
    } 
    const saveTransaction = async (
      txHash,
      amount,
      fromAddress = currentAccount,
      toAddress,
    ) => {
      const txDoc = {
        _type: 'transactions',
        _id: txHash,
        fromAddress: fromAddress,
        toAddress: toAddress,
        timestamp: new Date(Date.now()).toISOString(),
        txHash: txHash,
        amount: parseFloat(amount),
      }
  
      await client.createIfNotExists(txDoc)
  
      await client
        .patch(currentAccount)
        .setIfMissing({ transactions: [] })
        .insert('after', 'transactions[-1]', [
          {
            _key: txHash,
            _ref: txHash,
            _type: 'reference',
          },
        ])
        .commit()
  
      return
    }
    useEffect(()=>{
        checkIfWalletIsConnected()
    },[])
    useEffect(()=>{
      if(isLoading){
        router.push(`/?loading=${currentAccount}`)
      } else {
        router.push(`/`)
      }
    },[isLoading])
    return (
        <TransactionContext.Provider value={{
            currentAccount,
            connectWallet,
            sendTransaction,
            handleChange,
            formData,
            isLoading
        }}>
            {children}
        </TransactionContext.Provider>
    )
}
