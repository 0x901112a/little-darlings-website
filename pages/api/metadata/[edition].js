
export default async function handler(req, res) {
  const { edition } = req.query;
  const editionNumber = parseInt(edition.replace(".json", ""));
  const totalSupply = 500;
  try {
    if (editionNumber < totalSupply) {
      const metadata =  {
        name: `#${editionNumber}`,
        description: "𝓤Ǥ𝕃¥ ᗷ✩𝓲tς𝐡є𝐒",
        "image": `${process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'https://www.uglybitches.exposed' : (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`: 'http://localhost:3000')}/api/image/${editionNumber}.png`
      }
      res.setHeader('Cache-Control', 's-maxage=15552000');
      res.setHeader('Content-Type', 'application/json')
      res.status(200).json(metadata)
    } else {
        res.status(400).json({ error: true, message: 'Token not found.' })
    }
  } catch (e) {
    res.status(400).json(e)
  }
}