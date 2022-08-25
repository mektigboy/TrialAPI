import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletWrapperProps {
  children: React.ReactNode;
  network: string;
}

const supportedWallets = [new PhantomWalletAdapter()];

const WalletWrapper: React.FC<WalletWrapperProps> = ({ children, network }) => {
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={supportedWallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletWrapper;
