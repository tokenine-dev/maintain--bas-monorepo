import {IConfig} from "./config";
import {IKeyProvider, IPendingTx, Web3Address} from "./types";
import Web3 from "web3";
import {sendTransactionAsync, waitForExpectedNetworkOrThrow} from "./metamask";
import {Contract} from "web3-eth-contract";
import detectEthereumProvider from "@metamask/detect-provider";

const STAKING_ABI = require('./abi/Staking.json')
const SLASHING_INDICATOR_ABI = require('./abi/SlashingIndicator.json')
const SYSTEM_REWARD_ABI = require('./abi/SystemReward.json')
const STAKING_POOL_ABI = require('./abi/StakingPool.json')
const GOVERNANCE_ABI = require('./abi/Governance.json')
const CHAIN_CONFIG_ABI = require('./abi/ChainConfig.json')
const RUNTIME_UPGRADE_ABI = require('./abi/RuntimeUpgrade.json')
const DEPLOYER_PROXY_ABI = require('./abi/DeployerProxy.json')

export class KeyProvider implements IKeyProvider {

  public accounts?: Web3Address[];
  public web3?: Web3;

  // addresses
  public stakingAddress?: Web3Address;
  public slashingIndicatorAddress?: Web3Address;
  public systemRewardAddress?: Web3Address;
  public stakingPoolAddress?: Web3Address;
  public governanceAddress?: Web3Address;
  public chainConfigAddress?: Web3Address;
  public runtimeUpgradeAddress?: Web3Address;
  public deployerProxyAddress?: Web3Address;
  // contracts
  public stakingContract?: Contract;
  public slashingIndicatorContract?: Contract;
  public systemRewardContract?: Contract;
  public stakingPoolContract?: Contract;
  public governanceContract?: Contract;
  public chainConfigContract?: Contract;
  public runtimeUpgradeContract?: Contract;
  public deployerProxyContract?: Contract;

  constructor(
    private readonly config: IConfig,
  ) {
  }

  public isConnected(): boolean {
    return !!this.web3;
  }

  public async connect(web3: Web3): Promise<void> {
    const remoteChainId = await web3.eth.getChainId();
    if (remoteChainId != this.config.chainId) {
      await waitForExpectedNetworkOrThrow(web3, this.config);
    }
    // init web3 state
    this.accounts = await this.unlockAccounts(web3);
    this.web3 = web3;
    // init system smart contracts
    // addresses
    this.stakingAddress = this.config.stakingAddress;
    this.slashingIndicatorAddress = this.config.slashingIndicatorAddress;
    this.systemRewardAddress = this.config.systemRewardAddress;
    this.stakingPoolAddress = this.config.stakingPoolAddress;
    this.governanceAddress = this.config.governanceAddress;
    this.chainConfigAddress = this.config.chainConfigAddress;
    this.runtimeUpgradeAddress = this.config.runtimeUpgradeAddress;
    this.deployerProxyAddress = this.config.deployerProxyAddress;
    // contracts
    this.stakingContract = new web3.eth.Contract(STAKING_ABI, this.config.stakingAddress);
    this.slashingIndicatorContract = new web3.eth.Contract(SLASHING_INDICATOR_ABI, this.config.slashingIndicatorAddress);
    this.systemRewardContract = new web3.eth.Contract(SYSTEM_REWARD_ABI, this.config.systemRewardAddress);
    this.stakingPoolContract = new web3.eth.Contract(STAKING_POOL_ABI, this.config.stakingPoolAddress);
    this.governanceContract = new web3.eth.Contract(GOVERNANCE_ABI, this.config.governanceAddress);
    this.chainConfigContract = new web3.eth.Contract(CHAIN_CONFIG_ABI, this.config.chainConfigAddress);
    this.runtimeUpgradeContract = new web3.eth.Contract(RUNTIME_UPGRADE_ABI, this.config.runtimeUpgradeAddress);
    this.deployerProxyContract = new web3.eth.Contract(DEPLOYER_PROXY_ABI, this.config.deployerProxyAddress);
  }

  public async connectFromInjected(): Promise<void> {
    const provider = await detectEthereumProvider()
    if (!provider) throw new Error(`There is no injected provider`)
    const web3 = new Web3(provider as any);
    try {
      await web3.eth.requestAccounts()
    } catch (e) {
      console.error(e)
      throw new Error(`Can't request provider's account`);
    }
    return this.connect(web3);
  }

  private async unlockAccounts(web3: Web3): Promise<Web3Address[]> {
    let unlockedAccounts: Web3Address[] = [];
    try {
      unlockedAccounts = await web3.eth.requestAccounts();
    } catch (e) {
      console.error(e);
      throw new Error('User denied access to account');
    }
    console.log(`Unlocked accounts: ${unlockedAccounts}`);
    if (!unlockedAccounts.length || !unlockedAccounts[0]) {
      throw new Error('Unable to detect unlocked MetaMask account');
    }
    return unlockedAccounts;
  }

  public async disconnect(): Promise<void> {
    this.web3 = undefined;
    this.accounts = undefined;
  }

  public getAccounts(): Web3Address[] {
    return this.accounts || []
  }

  public async getBlockNumber(): Promise<number> {
    return this.web3!.eth.getBlockNumber()
  }

  public async sendTx(sendOptions: { to: string; data?: string; value?: string; }): Promise<IPendingTx> {
    return await sendTransactionAsync(this.web3!, {
      from: this.accounts![0],
      to: sendOptions.to,
      data: sendOptions.data,
    })
  }
}