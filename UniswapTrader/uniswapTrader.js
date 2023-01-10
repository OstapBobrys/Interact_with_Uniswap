const { ethers } = require('ethers')
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const { abi: SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json')
const { getPoolImmutables, getPoolState } = require('./helpers')
const ERC20ABI = require('./abi.json')

require('dotenv').config()
const INFURA_URL_TESTNET = process.env.INFURA_URL_TESTNET
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const PRIVATE_KEY = process.env.PRIVATE_KEY

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_TESTNET) // Goerli
const poolAddress = "0x4d1892f15B03db24b55E73F9801826a56d6f0755" // UNI/WETH
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

const name1 = 'Uniswap Token'
const symbol1 = 'UNI'
const decimals1 = 18
const address1 = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'

async function main() {
    const poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
    )

    const immutables = await getPoolImmutables(poolContract)
    const state = await getPoolState(poolContract)

    const wallet = new ethers.Wallet(PRIVATE_KEY)
    const connectedWallet = wallet.connect(provider)

    const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
    )

    const inputAmount = 0.001
    const amountIn = ethers.utils.parseUnits(
        inputAmount.toString(),
        decimals0
    )

    const approvalAmount = '1000000000000000000'
    const tokenContract0 = new ethers.Contract(
        address0,
        ERC20ABI,
        provider
    )

    await tokenContract0.connect(connectedWallet).approve(
        swapRouterAddress,
        approvalAmount
    )


// struct ExactInputSingleParams from ISwapRouter
    const params = {           
    tokenIn: immutables.token1,
    tokenOut: immutables.token0,
    fee: immutables.fee,
    recipient: WALLET_ADDRESS,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10), // deadline of 10 minutes for transaction
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
    }

    const transaction = await swapRouterContract.connect(connectedWallet).exactInputSingle(
        params,
        {
          gasLimit: ethers.utils.hexlify(10000000)
        }
      )

     console.log(transaction)
      
    }

main()
