import * as React from 'react'
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

// `pages/_app.js`
import "../styles/global.css";

const { chains, provider } = configureChains(
  [process.env.NEXT_PUBLIC_VERCEL_ENV == 'production' ? mainnet : sepolia],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }),
    publicProvider(),
  ]
);
const { connectors } = getDefaultWallets({
  appName: "Little Darlings",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {setMounted(true)}, [])
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {mounted && <Component {...pageProps} />}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
