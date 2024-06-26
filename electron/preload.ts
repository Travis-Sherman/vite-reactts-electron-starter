/* eslint-disable no-underscore-dangle */
/* eslint-disable no-redeclare */
/* eslint-disable no-else-return */
/* eslint-disable no-case-declarations */
/* eslint-disable no-fallthrough */
/* eslint-disable @typescript-eslint/ban-types */
import { ipcRenderer, contextBridge } from 'electron';
import axios from 'axios';
import { ethers } from 'ethers';
// import WalletProvider = require('../main/accountProvider.cjs');

declare global {
  interface Window {
    Main: typeof api;
    ipcRenderer: typeof ipcRenderer;
  }
}

declare global {
  interface Window {
    electronAPI?: {
      sendUrl: (...args: any[]) => Promise<any>;
      sendUserData: (...args: any[]) => Promise<any>;
      requestUserData: (...args: any[]) => Promise<any>;
    };
  }
}

declare global {
  interface Window {
    ethereum?: {
      // Define the properties and methods of 'ethereum' you use, for example:
      userAddress: string;
      privateKey: string;
      isMetaMask: boolean;
      isConnected: boolean;
      autoRefreshOnNetworkChange: boolean;
      request: (...args: any[]) => Promise<any>;
    };
  }
}
const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message);
  },
  /**
    Here function for AppBar
   */
  Minimize: () => {
    ipcRenderer.send('minimize');
  },
  Maximize: () => {
    ipcRenderer.send('maximize');
  },
  Close: () => {
    ipcRenderer.send('close');
  },
  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  }
};

// const { contextBridge } = require('electron');
// const WalletProvider = require(`${__dirname}/newWalletProvider.cjs`);

// const walletProvider = new WalletProvider()
// console.log(walletProvider);
// contextBridge.exposeInMainWorld('ethereum', walletProvider);

// // contextBridge.exposeInMainWorld('wallet', {
// //     walletProvider: new WalletProvider(),
// //     createPopup: (...args) => global.createPopup(...args)
// // });

// In your preload.js
// const { contextBridge } = require('electron');
// const WalletProvider = require(`${__dirname}/walletProvider.cjs`);

// const walletProvider = new WalletProvider();

// Simplified EventEmitter for the renderer context
class SimpleEventEmitter {
  private listeners: { [event: string]: Function[] };

  constructor() {
    this.listeners = {};
  }

  on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(...args));
    }
  }

  off(event: string, listenerToRemove: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((listener) => listener !== listenerToRemove);
    }
  }
}

const ethereumEmitter = new SimpleEventEmitter();

const walletApi = axios.create({
  // baseURL: 'http://localhost:8080',
  baseURL: 'https://dapphub-account-provider.fly.dev',
  withCredentials: true
});

const ethMainnetUrl = 'https://ethereum-rpc.publicnode.com';
const etherprovider = new ethers.JsonRpcProvider(ethMainnetUrl);

// Example of exposing a mock `window.ethereum` object
contextBridge.exposeInMainWorld('ethereum', {
  isMetaMask: true,
  isConnected: true,
  // Method to handle requests from dApps
  request: async ({ method, params }: { method: string; params: any[] }) => {
    const { Address, PrivateKey } = await ipcRenderer.invoke('get-user-data');
    const userAddress = [Address];
    const etherswallet = new ethers.Wallet(PrivateKey, etherprovider);
    // const walletProvider = new WalletProvider(PrivateKey);
    switch (method) {
      case 'eth_requestAccounts':
        // Return mock accounts
        return userAddress;
      case 'eth_accounts':
        return userAddress; // Return the currently connected accounts
      case 'eth_sendTransaction':
        const sendTransactionObj = { decryptedPrivateKey: PrivateKey, transaction: params[0] };
        walletApi.post('/eth_sendTransaction', sendTransactionObj).then((response) => {
          if (response.status === 200) {
            return response.data.txReceipt;
          } else {
            return {
              message: 'Internal Error',
              code: -32603
            };
          }
        });
        break;
      case 'personal_sign':
        return etherswallet.signMessage(params[0]);

      // must pass in the network id before the dapp is loaded
      case 'eth_chainId':
        return etherprovider._network;
      case 'eth_call':
        return etherswallet.call(params[0]);
      case 'eth_getBalance':
        return etherprovider.getBalance(Address);
      // case 'eth_signTypedData_v4':
      //   return walletProvider.signTypedData(params);
      case 'wallet_switchEthereumChain':
        console.log(params[0]);
        const chainId = parseInt(params[0].chainId, 16).toString();
        const chainIdObj = { decryptedPrivateKey: PrivateKey, chainId };
        await walletApi.post('/eth_switchEthereumChain', chainIdObj).then((response) => {
          if (response.status === 200) {
            return null;
          } else {
            return {
              message: 'Internal Error',
              code: 4902
            };
          }
        });
        break;
      // case 'wallet_addEthereumChain':
      //   console.log(params[0]);
      //   return;
      case 'eth_getTransactionCount':
        return etherprovider.getTransactionCount(params[0], params[1]);
      case 'eth_estimateGas':
        return etherprovider.estimateGas(params[0]);
      case 'eth_blockNumber':
        return etherprovider.getBlockNumber();
      case 'eth_getTransactionByHash':
        return null;
      case 'eth_getTransactionReceipt':
        return etherprovider.getTransactionReceipt(params[0]);
      default:
        throw new Error(`Method ${method} not implemented. with ${params}`);
    }
  },

  // Event subscription method
  on: (event: string, listener: Function) => {
    ethereumEmitter.on(event, listener);
  },
  // Method to remove event listeners if needed
  removeListener: (event: string, listener: Function) => {
    ethereumEmitter.off(event, listener);
  },
  // Emit chainChanged event for changing networks (mock example)
  emitChainChanged: (chainId: any) => {
    ethereumEmitter.emit('chainChanged', chainId);
  },
  // Emit accountsChanged event for account changes (mock example)
  emitAccountsChanged: (accounts: any) => {
    ethereumEmitter.emit('accountsChanged', accounts);
  },
  // Add a listener for the chainChanged event
  onChainChanged: (listener: Function) => {
    ethereumEmitter.on('chainChanged', listener);
  },

  onConnected: (listener: Function) => {
    ethereumEmitter.on('connected', listener);
  },

  // Optionally, add a method to remove a listener for the chainChanged event
  removeChainChangedListener: (listener: Function) => {
    ethereumEmitter.off('chainChanged', listener);
  }
  // // Additional utility methods like `isConnected` can also be added as needed
  // isConnected: () => {
  //   // Mock connected status
  //   ethereumEmitter.emit('isConnected', true);
  // }
});

contextBridge.exposeInMainWorld('electronAPI', {
  sendUrl: (url: string) => ipcRenderer.send('open-url', url),
  sendUserData: (data: any) => ipcRenderer.send('send-user-data', data),
  requestUserData: () => ipcRenderer.invoke('get-user-data'),
  createBrowserWindow: (data: any) => ipcRenderer.send('load-url', data),
  toggleBrowserView: () => ipcRenderer.send('toggle-view'),
  onVisibilityChanged: (callback: any) => ipcRenderer.on('update-view-visibility', callback),
  queryViewVisibility: () => ipcRenderer.invoke('query-view-visibility'),
  removeVisibilityChangedListener: (callback: any) => ipcRenderer.removeListener('update-view-visibility', callback),

  send: (channel: any, data: any) => {
    // whitelist channels
    let validChannels = ['create-browser-view'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: any, func: any) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (...args) => func(...args));
    }
  }
});
contextBridge.exposeInMainWorld('Main', api);
/**
 * Using the ipcRenderer directly in the browser through the contextBridge ist not really secure.
 * I advise using the Main/api way !!
 */
