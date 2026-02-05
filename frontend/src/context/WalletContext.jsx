/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

const WalletContext = createContext();

// Initialize outside component to treat as singleton
const peraWallet = new PeraWalletConnect({
    chainId: 416002 // TestNet
});

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Reconnect session
        peraWallet.reconnectSession().then((accounts) => {
            peraWallet.connector?.on('disconnect', handleDisconnect);
            if (accounts.length) {
                setWalletAddress(accounts[0]);
                setIsConnected(true);
            }
        }).catch(error => console.log(error));
    }, []);

    const handleConnect = async () => {
        try {
            const newAccounts = await peraWallet.connect();
            peraWallet.connector?.on('disconnect', handleDisconnect);
            setWalletAddress(newAccounts[0]);
            setIsConnected(true);
        } catch (error) {
            // User closed modal
            if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
                console.error(error);
            }
        }
    };

    const handleDisconnect = () => {
        peraWallet.disconnect();
        setWalletAddress(null);
        setIsConnected(false);
    };

    return (
        <WalletContext.Provider value={{
            walletAddress,
            isConnected,
            connectWallet: handleConnect,
            disconnectWallet: handleDisconnect,
            peraWallet
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
