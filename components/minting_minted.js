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

export default function minting_minted() {

  // Read contract hooks
  const totalSupply = useContractRead({
    ...littleDarlingsContract,
    functionName: "totalSupply",
  });
  const getCollectionSize = useContractRead({
    ...littleDarlingsContract,
    functionName: "getCollectionSize",
  });

  return (
    <>
      {totalSupply?.data ? (
        <p>
          {totalSupply?.data?.toNumber()} / {getCollectionSize?.data?.toNumber()} minted so far
        </p>
      ) : (
        <p>The public mint is not open</p>
      )}
    </>
  );
}
