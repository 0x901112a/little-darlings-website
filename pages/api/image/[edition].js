import fetch from 'node-fetch'
import { ethers, providers } from 'ethers'
import LittleDarlingsABI from '../../../contracts/LittleDarlings.json';
const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

export default async function handler(req, res) {
  const { edition } = req.query
  const editionNumber = parseInt(edition.replace(".png", ""))
  const lastMintedToken = parseInt(process.env.LAST_MINTED_TOKEN)
  try {
    if (editionNumber + 1 > lastMintedToken) {
      const provider = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? new providers.AlchemyProvider("mainnet", process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
        : new providers.AlchemyProvider("sepolia", process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
      const contract = new ethers.Contract(address, LittleDarlingsABI, provider)
      const totalSupply = await contract.totalSupply().then(token => token.toNumber())
      if (editionNumber + 1 > totalSupply) {
        res.status(400).json({ error: true, message: 'Image not found.' })
        return
      }
    }
    const url = `${process.env.IPFS_GATEWAY_URL}/${process.env.IPFS_IMAGES_CID}/${edition}`
    // Fetch image from url and send as response
    const response = await fetch(url)
    const file = await response.buffer()
    res.setHeader('Cache-Control', 's-maxage=15552000');
    res.setHeader('Content-Type', 'image/png')
    res.status(200).send(file)
  }
  catch (e) {
    console.log(e);
    res.status(400).json(e)
  }
}