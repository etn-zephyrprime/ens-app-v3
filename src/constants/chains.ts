import { match } from 'ts-pattern'
import { localhost, mainnet, sepolia } from 'viem/chains'
import type { Chain } from 'viem'

import type { Register } from '@app/local-contracts'
import { addEnsContractsWithSubgraphAndOverrides } from '@app/overrides/addEnsContractsWithSubgraphAndOverrides'
import { makeLocalhostChainWithEnsAndOverrides } from '@app/overrides/makeLocalhostChainWithEnsAndOverrides'
import { electroneumMainnet, electroneumTestnet } from '@app/utils/chains/electroneumChains'

const tryAddEnsContracts = <T,>(fn: () => T): T | undefined => {
  try {
    return fn()
  } catch {
    return undefined
  }
}

export const deploymentAddresses = JSON.parse(
  process.env.NEXT_PUBLIC_DEPLOYMENT_ADDRESSES || '{}',
) as Register['deploymentAddresses']

const localhostChain = { ...localhost, formatters: undefined } as Chain

export const localhostWithEns = makeLocalhostChainWithEnsAndOverrides<Chain>(
  localhostChain,
  deploymentAddresses,
)

export const electroneumDeploymentAddresses = JSON.parse(
  process.env.NEXT_PUBLIC_ETN_DEPLOYMENT_ADDRESSES || '{}',
) as Register['deploymentAddresses']

const activeElectroneumChain =
  process.env.NEXT_PUBLIC_ETN_NETWORK === 'mainnet' ? electroneumMainnet : electroneumTestnet

export const electroneumWithEns = makeLocalhostChainWithEnsAndOverrides<typeof activeElectroneumChain>(
  activeElectroneumChain,
  electroneumDeploymentAddresses,
)

const ENS_SUBGRAPH_API_KEY = '9ad5cff64d93ed2c33d1a57b3ec03ea9'

export const mainnetWithEns = tryAddEnsContracts(() =>
  addEnsContractsWithSubgraphAndOverrides({
    chain: mainnet,
    subgraphId: '5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH',
    apiKey: ENS_SUBGRAPH_API_KEY,
  }),
)

export const sepoliaWithEns = tryAddEnsContracts(() =>
  addEnsContractsWithSubgraphAndOverrides({
    chain: sepolia,
    subgraphId: 'G1SxZs317YUb9nQX3CC98hDyvxfMJNZH5pPRGpNrtvwN',
    apiKey: ENS_SUBGRAPH_API_KEY,
  }),
)

export const chainsWithEns = [
  mainnetWithEns,
  sepoliaWithEns,
  localhostWithEns,
  electroneumWithEns,
].filter((chain): chain is NonNullable<typeof chain> => !!chain)

export const getSupportedChainById = (chainId: number | undefined) =>
  chainId ? chainsWithEns.find((c) => c.id === chainId) : undefined

export type SupportedChain = typeof mainnetWithEns | typeof sepoliaWithEns | typeof localhostWithEns

export const getNetworkFromUrl = ():
  | 'mainnet'
  | 'sepolia'
  | 'localhost'
  | 'electroneum'
  | undefined => {
  // Chain override — checked first since it doesn't depend on `window`,
  // so server and client agree even during SSR.
  const chain = process.env.NEXT_PUBLIC_CHAIN_NAME
  if (chain === 'sepolia') return 'sepolia' as const
  if (chain === 'mainnet') return 'mainnet' as const
  if (chain === 'electroneum') return 'electroneum' as const

  if (typeof window === 'undefined') return undefined

  const { hostname } = window.location
  const segments = hostname.split('.')

  // Previews
  if (segments.length === 4) {
    /* Used for testing preview on mainnet at: test.app.ens.domains. Update by configuring dns */
    if (segments[0] === 'test') {
      return 'mainnet' as const
    }
    if (segments.slice(1).join('.') === 'ens-app-v3.pages.dev') {
      return 'sepolia' as const
    }
  }

  // Dev environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (process.env.NEXT_PUBLIC_PROVIDER) return 'localhost' as const
    return 'sepolia' as const
  }

  return match(segments[0])
    .with('sepolia', () => 'sepolia' as const)
    .otherwise(() => 'mainnet' as const)
}

export const getChainsFromUrl = () => {
  const network = getNetworkFromUrl()
  return match(network)
    .with('mainnet', () => [mainnetWithEns])
    .with('sepolia', () => [sepoliaWithEns])
    .with('localhost', () => [localhostWithEns])
    .with('electroneum', () => [electroneumWithEns])
    .otherwise(() => [mainnetWithEns])
}