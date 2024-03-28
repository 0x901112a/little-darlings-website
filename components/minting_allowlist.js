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

export default function minting_allowlist() {
  // State hooks
  const [allowlistMintQuantity, setAllowlistMintQuantity] = useState(1);

  // Address hooks
  const { address } = useAccount();

  // SWR fetcher
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const allowlistMintProof = useSWR(
    `/api/allowlistMintProof?address=${
      address ? address : "0x0000000000000000000000000000000000000000"
    }`,
    fetcher
  );

  // Read contract hooks
  const getIsAllowlistMintActive = useContractRead({
    ...littleDarlingsContract,
    functionName: "getIsAllowlistMintActive",
  });
  const getMaxPerWalletAllowlist = useContractRead({
    ...littleDarlingsContract,
    functionName: "getMaxPerWalletAllowlist",
  });
  const getAllowlistMintPrice = useContractRead({
    ...littleDarlingsContract,
    functionName: "getAllowlistMintPrice",
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

  // Write contract hooks
  const configAllowlistMint = usePrepareContractWrite({
    ...littleDarlingsContract,
    functionName: "allowlistMint",
    args: [
      ethers.BigNumber.from(allowlistMintQuantity || "1"),
      allowlistMintProof?.data?.proof,
    ],
    overrides: {
      value: ethers.BigNumber.from(getAllowlistMintPrice?.data || "0").mul(
        ethers.BigNumber.from(allowlistMintQuantity || "1")
      ),
    },
  });
  const allowlistMint = useContractWrite(configAllowlistMint?.data);
  const allowlistMintWait = useWaitForTransaction({
    hash: allowlistMint.data?.hash,
  });

  const allowlistMintLeft = useMemo(() => {
    return (
      getMaxPerWalletAllowlist?.data?.toNumber() -
      getOwnerAllowlistMintCount?.data - getOwnerAllowlistUBMintCount?.data
    );
  }, [getMaxPerWalletAllowlist?.data, getOwnerAllowlistMintCount?.data, getOwnerAllowlistUBMintCount?.data]);

  const handleDecrease = () => {
    setAllowlistMintQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  const handleIncrease = () => {
    setAllowlistMintQuantity((prevQuantity) =>
      Math.min(prevQuantity + 1, allowlistMintLeft || 1)
    );
  };

  return (
    <>
      {getIsAllowlistMintActive?.data ? (
        <p>
          The allowlist is open <br />
          {!allowlistMintProof?.data?.valid ? (
            <span>You are not in the allowlist</span>
          ) : allowlistMintLeft == 0 ? (
            <>You have minted your maximum allocation for this tier.</>
          ) : (
            <>
              <button
                className={`${styles.mintButton} ${styles.plusMinusButton}`}
                onClick={handleDecrease}
              >
                -
              </button>{" "}
              {allowlistMintQuantity}{" "}
              <button
                className={`${styles.mintButton} ${styles.plusMinusButton}`}
                onClick={handleIncrease}
              >
                +
              </button>{" "}
              Little Darling{allowlistMintQuantity > 1 && "s"} ={" "}
              {(
                Number(
                  ethers.utils.formatEther(
                    ethers.BigNumber.from(getAllowlistMintPrice?.data || 0)
                  )
                ) * allowlistMintQuantity
              ).toFixed(4)}{" "}
              ETH{" "}
              <button
                className={styles.mintButton}
                onClick={() => {
                  allowlistMint?.write?.();
                }}
              >
                MINT!
              </button>
              <br />
              <br />
              Debugging <br />
              getMaxPerWalletAllowlist:{" "}
              {getMaxPerWalletAllowlist?.data?.toNumber()} <br />
              getOwnerAllowlistMintCount: {
                getOwnerAllowlistMintCount?.data
              }{" "}
              <br />
              allowlistMintLeft: {allowlistMintLeft} <br />
              getAllowlistMintPrice:{" "}
              {Number(
                ethers.utils.formatEther(
                  ethers.BigNumber.from(getAllowlistMintPrice?.data || 0)
                )
              )}{" "}
              <br />
            </>
          )}
        </p>
      ) : (
        <p>The allowlist mint is not open</p>
      )}
    </>
  );
}
