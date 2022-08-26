import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Wallet = () => {
  const { publicKey } = useWallet();

  return (
    <div className="wallet mb-50">
      <WalletMultiButton />
    </div>
  );
};

export default Wallet;
