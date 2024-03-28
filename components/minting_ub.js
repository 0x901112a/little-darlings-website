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

export default function minting_ub() {
  // State hooks
  const [UBMintQuantity, setUBMintQuantity] = useState(1);

  // Address hooks
  const { address } = useAccount();

  // SWR fetcher
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const UBAllowlistMintProof = useSWR(
    `/api/UBAllowlistMintProof?address=${
      address ? address : "0x0000000000000000000000000000000000000000"
    }`,
    fetcher
  );

  // Read contract hooks
  const getIsUBAllowlistMintActive = useContractRead({
    ...littleDarlingsContract,
    functionName: "getIsUBAllowlistMintActive",
  });
  const getMaxPerWalletUBAllowlist = useContractRead({
    ...littleDarlingsContract,
    functionName: "getMaxPerWalletUBAllowlist",
  });
  const getAllowlistUBMintPrice = useContractRead({
    ...littleDarlingsContract,
    functionName: "getAllowlistUBMintPrice",
  });
  const getOwnerAllowlistUBMintCount = useContractRead({
    ...littleDarlingsContract,
    functionName: "getOwnerAllowlistUBMintCount",
    args: [address || "0x0"],
    watch: true,
  });

  // Write contract hooks
  const configUBAllowlistMint = usePrepareContractWrite({
    ...littleDarlingsContract,
    functionName: "UBAllowlistMint",
    args: [
      ethers.BigNumber.from(UBMintQuantity || "1"),
      UBAllowlistMintProof?.data?.proof,
    ],
    overrides: {
      value: ethers.BigNumber.from(getAllowlistUBMintPrice?.data || "0").mul(
        ethers.BigNumber.from(UBMintQuantity || "1")
      ),
    },
  });
  useEffect(() => {
    console.log("quantity", ethers.BigNumber.from(UBMintQuantity || "1"));
    console.log("proof", UBAllowlistMintProof?.data?.proof);
    console.log(
      "amount",
      ethers.BigNumber.from(getAllowlistUBMintPrice?.data || "0").mul(
        ethers.BigNumber.from(UBMintQuantity || "1")
      )
    );
  }, [
    UBMintQuantity,
    UBAllowlistMintProof?.data?.proof,
    getAllowlistUBMintPrice?.data,
  ]);
  const UBAllowlistMint = useContractWrite(configUBAllowlistMint?.data);
  const UBAllowlistMintWait = useWaitForTransaction({
    hash: UBAllowlistMint.data?.hash,
  });

  const UBAllowlistMintLeft = useMemo(() => {
    return (
      getMaxPerWalletUBAllowlist?.data?.toNumber() -
      getOwnerAllowlistUBMintCount?.data
    );
  }, [getMaxPerWalletUBAllowlist?.data, getOwnerAllowlistUBMintCount?.data]);

  const handleDecrease = () => {
    setUBMintQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  const handleIncrease = () => {
    setUBMintQuantity((prevQuantity) =>
      Math.min(prevQuantity + 1, UBAllowlistMintLeft || 1)
    );
  };

  return (
    <>
      {getIsUBAllowlistMintActive?.data ? (
        <p>
          The Ugly Bitches allowlist is open <br />
          {!UBAllowlistMintProof?.data?.valid ? (
            <span>You are not in the allowlist</span>
          ) : UBAllowlistMintLeft == 0 ? (
            <>You have minted your maximum allocation for this tier.</>
          ) : (
            <>
              <button
                className={`${styles.mintButton} ${styles.plusMinusButton}`}
                onClick={handleDecrease}
              >
                -
              </button>{" "}
              {UBMintQuantity}{" "}
              <button
                className={`${styles.mintButton} ${styles.plusMinusButton}`}
                onClick={handleIncrease}
              >
                +
              </button>{" "}
              Little Darling{UBMintQuantity > 1 && "s"} ={" "}
              {(
                Number(
                  ethers.utils.formatEther(
                    ethers.BigNumber.from(getAllowlistUBMintPrice?.data || 0)
                  )
                ) * UBMintQuantity
              ).toFixed(4)}{" "}
              ETH{" "}
              <button
                className={styles.mintButton}
                onClick={() => {
                  UBAllowlistMint?.write?.();
                }}
              >
                MINT!
              </button>
              <br />
              <br />
              Debugging <br />
              getMaxPerWalletUBAllowlist:{" "}
              {getMaxPerWalletUBAllowlist?.data?.toNumber()} <br />
              getOwnerAllowlistUBMintCount: {
                getOwnerAllowlistUBMintCount?.data
              }{" "}
              <br />
              UBAllowlistMintLeft: {UBAllowlistMintLeft} <br />
              getAllowlistUBMintPrice:{" "}
              {Number(
                ethers.utils.formatEther(
                  ethers.BigNumber.from(getAllowlistUBMintPrice?.data || 0)
                )
              )}{" "}
              <br />
            </>
          )}
        </p>
      ) : (
        <p>The Ugly Bitches allowlist is not open</p>
      )}
    </>
  );
}
