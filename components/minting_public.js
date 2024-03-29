import styles from "./minting.module.css";
import {
  useAccount,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useSWR from "swr";
import LittleDarlings from "../contracts/LittleDarlings.json";
import { useEffect, useMemo, useState } from "react";
const littleDarlingsContract = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  abi: LittleDarlings,
};
import { ethers } from "ethers";

export default function minting_public() {
  // State hooks
  const [mintQuantity, setMintQuantity] = useState(1);

  // Address hooks
  const { address } = useAccount();

  // Read contract hooks
  const getIsMintActive = useContractRead({
    ...littleDarlingsContract,
    functionName: "getIsMintActive",
  });
  const getMaxPerWallet = useContractRead({
    ...littleDarlingsContract,
    functionName: "getMaxPerWallet",
  });
  const getPublicMintPrice = useContractRead({
    ...littleDarlingsContract,
    functionName: "getPublicMintPrice",
  });
  const getOwnerAllowlistUBMintCount = useContractRead({
    ...littleDarlingsContract,
    functionName: "getOwnerAllowlistUBMintCount",
    args: [address || "0x0"],
    watch: true,
  });
  const getOwnerAllowlistMintCount = useContractRead({
    ...littleDarlingsContract,
    functionName: "getOwnerAllowlistMintCount",
    args: [address || "0x0"],
    watch: true,
  });
  const getOwnerGiftsCount = useContractRead({
    ...littleDarlingsContract,
    functionName: "getOwnerGiftsCount",
    args: [address || "0x0"],
    watch: true,
  });
  const numberMinted = useContractRead({
    ...littleDarlingsContract,
    functionName: "numberMinted",
    args: [address || "0x0"],
    watch: true,
  });

  // Write contract hooks
  const configMint = usePrepareContractWrite({
    ...littleDarlingsContract,
    functionName: "mint",
    args: [ethers.BigNumber.from(mintQuantity || "1")],
    overrides: {
      value: ethers.BigNumber.from(getPublicMintPrice?.data || "0").mul(
        ethers.BigNumber.from(mintQuantity || "1")
      ),
    },
  });
  const mint = useContractWrite(configMint?.data);
  const mintWait = useWaitForTransaction({
    hash: mint.data?.hash,
  });

  const mintLeft = useMemo(() => {
    // TODO: Double check this calculations
    return (
      getMaxPerWallet?.data?.toNumber() -
      (numberMinted?.data - getOwnerGiftsCount?.data)
    );
  }, [
    getMaxPerWallet?.data,
    numberMinted?.data,
    getOwnerAllowlistMintCount?.data,
    getOwnerAllowlistUBMintCount?.data,
    getOwnerGiftsCount?.data,
  ]);

  const handleDecrease = () => {
    setMintQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  const handleIncrease = () => {
    setMintQuantity((prevQuantity) =>
      Math.min(prevQuantity + 1, mintLeft || 1)
    );
  };

  return (
    <>
      {getIsMintActive?.data ? (
        <p>
          The public mint is open <br />
          {mintLeft == 0 ? (
            <>You have minted your maximum allocation for this tier.</>
          ) : (
            <>
              <button
                className={`${styles.mintButton} ${styles.plusMinusButton}`}
                onClick={handleDecrease}
              >
                -
              </button>{" "}
              {mintQuantity}{" "}
              <button
                className={`${styles.mintButton} ${styles.plusMinusButton}`}
                onClick={handleIncrease}
              >
                +
              </button>{" "}
              Little Darling{mintQuantity > 1 && "s"} ={" "}
              {(
                Number(
                  ethers.utils.formatEther(
                    ethers.BigNumber.from(getPublicMintPrice?.data || 0)
                  )
                ) * mintQuantity
              ).toFixed(4)}{" "}
              ETH{" "}
              <button
                className={styles.mintButton}
                onClick={() => {
                  mint?.write?.();
                }}
              >
                MINT!
              </button>
              {/* <br />
              <br />
              Debugging <br />
              getMaxPerWallet: {getMaxPerWallet?.data?.toNumber()} <br />
              numberMinted: {numberMinted?.data?.toNumber()} <br />
              getOwnerAllowlistMintCount: {
                getOwnerAllowlistMintCount?.data
              }{" "}
              <br />
              getOwnerAllowlistUBMintCount: {
                getOwnerAllowlistUBMintCount?.data
              }{" "}
              <br />
              mintLeft: {mintLeft} <br />
              getPublicMintPrice:{" "}
              {Number(
                ethers.utils.formatEther(
                  ethers.BigNumber.from(getPublicMintPrice?.data || 0)
                )
              )}{" "} */}
              <br />
            </>
          )}
        </p>
      ) : (
        <p>The public mint is not open</p>
      )}
    </>
  );
}
