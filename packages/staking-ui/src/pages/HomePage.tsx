import {observer} from "mobx-react";
import {ReactElement, useEffect, useState} from "react";
import {Button, Divider, Drawer, Menu} from "antd";
import {
  LockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ProposalTable from "../components/ProposalTable";
import {useChilizStore} from "../stores";
import CreateProposalForm from "../components/CreateProposalForm";
import DeployerTable from "../components/DeployerTable";
import SmartContractTable from "../components/SmartContractTable";
import ValidatorTable from "../components/ValidatorTable";

const ProposalNav = observer((props: any): ReactElement => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  return (
    <div>
      <Drawer
        title="Create proposal"
        width={500}
        onClose={() => {
          setDrawerVisible(false)
        }}
        bodyStyle={{paddingBottom: 80}}
        visible={drawerVisible}
      >
        <CreateProposalForm/>
      </Drawer>
      <ProposalTable/>
      <br/>
      <Button size={"large"} type={"primary"} onClick={() => {
        setDrawerVisible(true)
      }} icon={<PlusOutlined translate/>}>Create Proposal</Button>
    </div>
  );
})

const DeployerNav = observer((props: any): ReactElement => {
  return (
    <div>
      <DeployerTable/>
    </div>
  );
})

const SmartContractNav = observer((props: any): ReactElement => {
  return (
    <div>
      <SmartContractTable/>
    </div>
  );
})

const ValidatorNav = observer((props: any): ReactElement => {
  const store = useChilizStore()
  const [stakingRewards, setStakingRewards] = useState('0')
  useEffect(() => {

  }, [store])
  return (
    <div>
      <ValidatorTable/>
    </div>
  );
})

interface IHomePageProps {
}

const HomePage = observer((props: IHomePageProps): ReactElement => {
  const store = useChilizStore()
  const [currentTab, setCurrentTab] = useState('governance')
  const [blockInfo, setBlockInfo] = useState({} as any)
  useEffect(() => {
    setInterval(async () => {
      if (!store.isConnected) return;
      setBlockInfo(await store.getBlockNumber())
    }, 1_000)
  }, [store])
  if (!store.isConnected) {
    return <h1>Connecting...</h1>
  }
  return (
    <div>
      <Menu
        selectedKeys={[currentTab]}
        onSelect={({selectedKeys}) => {
          setCurrentTab(selectedKeys[0])
        }}
        mode="horizontal"
      >
        <Menu.Item key="governance" icon={<LockOutlined translate/>}>
          Governance
        </Menu.Item>
        <Menu.Item key="voting_power" icon={<LockOutlined translate/>}>
          Voting Power
        </Menu.Item>
        <Menu.Item key="deployer" icon={<LockOutlined translate/>}>
          Deployers
        </Menu.Item>
        <Menu.Item key="smart_contract" icon={<LockOutlined translate/>}>
          Smart Contracts
        </Menu.Item>
        <Menu.Item key="validator" icon={<LockOutlined translate/>}>
          Validators
        </Menu.Item>
      </Menu>
      <br/>
      {currentTab === 'governance' && <ProposalNav/>}
      {currentTab === 'deployer' && <DeployerNav/>}
      {currentTab === 'smart_contract' && <SmartContractNav/>}
      {currentTab === 'validator' && <ValidatorNav/>}
      <Divider/>
      <b>blockNumber</b>: {blockInfo.blockNumber}<br/>
      <b>currentEpoch</b>: {blockInfo.epoch}<br/>
      <b>nextEpochBlock</b>: {blockInfo.nextEpochBlock}&nbsp;(in {blockInfo.nextEpochInSec} sec
      or {(blockInfo.nextEpochInSec / 60).toFixed(1)} min)<br/>
      <b>blockTime</b>: {blockInfo.blockTime}<br/>
      <br/>
      <b>activeValidatorsLength</b>: {blockInfo.activeValidatorsLength}<br/>
      <b>epochBlockInterval</b>: {blockInfo.epochBlockInterval}<br/>
      <b>misdemeanorThreshold</b>: {blockInfo.misdemeanorThreshold}<br/>
      <b>felonyThreshold</b>: {blockInfo.felonyThreshold}<br/>
      <b>validatorJailEpochLength</b>: {blockInfo.validatorJailEpochLength}<br/>
      <b>undelegatePeriod</b>: {blockInfo.undelegatePeriod}<br/>
      <b>minValidatorStakeAmount</b>: {blockInfo.minValidatorStakeAmount}<br/>
      <b>minStakingAmount</b>: {blockInfo.minStakingAmount}<br/>
      <br/>
      P.S: MetaMask caches responses for 12 seconds
      <Divider/>
    </div>
  );
});

export default HomePage
