// Wallet Integration for Godot Agar.io Game
// Supports Phantom Wallet for Solana

class WalletIntegration {
    constructor() {
        this.isConnected = false;
        this.walletAddress = null;
        this.walletType = null;
    }

    // Check if Phantom wallet is available
    isPhantomAvailable() {
        return window.solana && window.solana.isPhantom;
    }

    // Check if MetaMask is available (for future use)
    isMetaMaskAvailable() {
        return window.ethereum && window.ethereum.isMetaMask;
    }

    // Connect to Phantom wallet
    async connectPhantom() {
        try {
            if (!this.isPhantomAvailable()) {
                // Redirect to Phantom installation
                window.open('https://phantom.app/', '_blank');
                return {
                    success: false,
                    error: 'Phantom wallet not installed. Please install Phantom wallet first.'
                };
            }

            // Request connection
            const response = await window.solana.connect();
            
            this.isConnected = true;
            this.walletAddress = response.publicKey.toString();
            this.walletType = 'phantom';

            return {
                success: true,
                address: this.walletAddress,
                wallet: 'phantom'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Disconnect from wallet
    async disconnect() {
        try {
            if (this.walletType === 'phantom' && window.solana) {
                await window.solana.disconnect();
            }
            
            this.isConnected = false;
            this.walletAddress = null;
            this.walletType = null;

            return { success: true };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check if wallet is already connected
    checkConnection() {
        if (this.isPhantomAvailable() && window.solana.isConnected) {
            this.isConnected = true;
            this.walletAddress = window.solana.publicKey ? window.solana.publicKey.toString() : null;
            this.walletType = 'phantom';
            
            return {
                connected: true,
                address: this.walletAddress,
                wallet: 'phantom'
            };
        }

        return { connected: false };
    }

    // Get wallet balance (simplified version)
    async getBalance() {
        try {
            if (!this.isConnected || !this.walletAddress) {
                return { success: false, error: 'Wallet not connected' };
            }

            // In a real implementation, you would use Solana RPC to get balance
            // This is a placeholder
            return {
                success: true,
                balance: '0.0 SOL' // Placeholder
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Sign a message (for authentication)
    async signMessage(message) {
        try {
            if (!this.isConnected || this.walletType !== 'phantom') {
                return { success: false, error: 'Wallet not connected' };
            }

            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await window.solana.signMessage(encodedMessage);

            return {
                success: true,
                signature: signedMessage.signature,
                publicKey: signedMessage.publicKey
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Listen for wallet events
    setupEventListeners() {
        if (this.isPhantomAvailable()) {
            window.solana.on('connect', () => {
                console.log('Wallet connected');
                this.isConnected = true;
                this.walletAddress = window.solana.publicKey.toString();
                this.walletType = 'phantom';
            });

            window.solana.on('disconnect', () => {
                console.log('Wallet disconnected');
                this.isConnected = false;
                this.walletAddress = null;
                this.walletType = null;
            });

            window.solana.on('accountChanged', (publicKey) => {
                console.log('Account changed:', publicKey);
                if (publicKey) {
                    this.walletAddress = publicKey.toString();
                } else {
                    this.isConnected = false;
                    this.walletAddress = null;
                }
            });
        }
    }
}

// Create global instance
window.walletIntegration = new WalletIntegration();

// Setup event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.walletIntegration.setupEventListeners();
});

// Export functions for Godot to use
window.connectPhantomWallet = () => window.walletIntegration.connectPhantom();
window.disconnectWallet = () => window.walletIntegration.disconnect();
window.checkWalletConnection = () => window.walletIntegration.checkConnection();
window.getWalletBalance = () => window.walletIntegration.getBalance();
window.signWalletMessage = (message) => window.walletIntegration.signMessage(message);
