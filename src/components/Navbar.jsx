import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const { isConnected, connectWallet, disconnectWallet, walletAddress } = useWallet();

    return (
        <nav className="bg-white shadow">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">CCMS</Link>
                <div>
                    {isConnected ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </span>
                            <button
                                onClick={disconnectWallet}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
