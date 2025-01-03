import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { type OnHomePageHandler } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Heading,
  Box,
  Text,
  Bold,
  Dropdown,
  Option,
} from '@metamask/snaps-sdk/jsx';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */

type GasFeeEstimates = {
  low: {
    suggestedMaxPriorityFeePerGas: string;
    suggestedMaxFeePerGas: string;
    minWaitTimeEstimate: number;
    maxWaitTimeEstimate: number;
  };
  medium: {
    suggestedMaxPriorityFeePerGas: string;
    suggestedMaxFeePerGas: string;
    minWaitTimeEstimate: number;
    maxWaitTimeEstimate: number;
  };
  high: {
    suggestedMaxPriorityFeePerGas: string;
    suggestedMaxFeePerGas: string;
    minWaitTimeEstimate: number;
    maxWaitTimeEstimate: number;
  };
  estimatedBaseFee: string;
  networkCongestion: number;
  latestPriorityFeeRange: [string, string];
  historicalPriorityFeeRange: [string, string];
  historicalBaseFeeRange: [string, string];
  priorityFeeTrend: 'up' | 'down';
  baseFeeTrend: 'up' | 'down';
  version: string;
};

// let chainId = 1;

const GasFeeExplorer: SnapComponent<GasFeeEstimates> = ({
  low,
  medium,
  high,
  estimatedBaseFee,
  networkCongestion,
  latestPriorityFeeRange,
  historicalPriorityFeeRange,
  historicalBaseFeeRange,
  priorityFeeTrend,
  baseFeeTrend,
}) => {
  return (
    <Box>
      <Heading>Gas Fee Explorer ⛽</Heading>
      <Dropdown name="chainId">
        <Option value="1">ETH</Option>
        <Option value="11155111">SEPOLIA</Option>
        <Option value="137">POLYGON</Option>
        <Option value="80001">MUMBAI</Option>
        <Option value="10">OPTIMISM</Option>
        <Option value="420">OPTIMISM-GOERLI</Option>
        <Option value="42161">ARBITRUM</Option>
        <Option value="421613">ARBITRUM-GOERLI</Option>
        <Option value="43114">AVALANCHE</Option>
        <Option value="43113">AVALANCHE-FUJI</Option>
        <Option value="56">BSC</Option>
        <Option value="97">BSC-TESTNET</Option>
        <Option value="8453">BASE</Option>
        <Option value="84531">BASE-GOERLI</Option>
        <Option value="59144">LINEA</Option>
        <Option value="59141">LINEA-SEPOLIA</Option>
      </Dropdown>
      <Box>
        <Text key="lowHeader">Low</Text>
        {Object.entries(low).map(([key, value]) => (
          <Text key={key}>
            {key}:{' '}
            {key.includes('WaitTimeEstimate')
              ? `${Number(value) / 1000} seconds`
              : `${value} GWEI `}
          </Text>
        ))}
        <Text key="mediumHeader">Medium</Text>
        {Object.entries(medium).map(([key, value]) => (
          <Text key={key}>
            {key}:{' '}
            {key.includes('WaitTimeEstimate')
              ? `${Number(value) / 1000} seconds`
              : `${value} GWEI `}
          </Text>
        ))}
        <Text key="highHeader">High</Text>
        {Object.entries(high).map(([key, value]) => (
          <Text key={key}>
            {key}:{' '}
            {key.includes('WaitTimeEstimate')
              ? `${Number(value) / 1000} seconds`
              : `${value} GWEI `}
          </Text>
        ))}
        <Text key="estimatedBaseFee">
          estimatedBaseFee: {estimatedBaseFee} GWEI
        </Text>
        <Text key="networkCongestion">
          networkCongestion: {networkCongestion.toString()} GWEI
        </Text>
        <Text key="latestPriorityFeeRange">
          latestPriorityFeeRange:{' '}
          {latestPriorityFeeRange.map((fee) => fee).join(', ')} GWEI
        </Text>
        <Text key="historicalPriorityFeeRange">
          historicalPriorityFeeRange:{' '}
          {historicalPriorityFeeRange.map((fee) => fee).join(', ')} GWEI
        </Text>
        <Text key="historicalBaseFeeRange">
          historicalBaseFeeRange:{' '}
          {historicalBaseFeeRange.map((fee) => fee).join(', ')} GWEI
        </Text>
        <Text key="priorityFeeTrend">
          priorityFeeTrend: {priorityFeeTrend}{' '}
          {priorityFeeTrend === 'up' ? '⬆️' : '⬇️'}
        </Text>
        <Text key="baseFeeTrend">
          baseFeeTrend: {baseFeeTrend} {baseFeeTrend === 'up' ? '⬆️' : '⬇️'}
        </Text>
      </Box>
    </Box>
  );
};

const fetchGasFeeData = async (chainId: number): Promise<any> => {
  try {
    const response = await fetch(
      `https://gas.api.infura.io/v3/${process.env.INFURA_PROJECT_ID}/networks/${chainId}/suggestedGasFees`,
    );
    const data = await response.json();
    console.log('data ', data);
    return data;
  } catch (error) {
    console.error('Error fetching API data:', error);
    return null;
  }
};

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.name === 'chainId') {
    const chainId = event.value;
    const data = await fetchGasFeeData(chainId);

    const interfaceId = await snap.request({
      method: 'snap_updateInterface',
      params: {
        id,
        ui: <GasFeeExplorer {...data} />,
      },
    });
    return {
      id: interfaceId,
    };
  }
  return null;
};

export const onHomePage: OnHomePageHandler = async () => {
  const chainId = 1;

  const data = await fetchGasFeeData(chainId);

  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: <GasFeeExplorer {...data} />,
    },
  });
  return {
    id: interfaceId,
  };
};

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Text>
                Hello, <Bold>{origin}</Bold>!
              </Text>
              <Text>
                This custom confirmation is just for display purposes.
              </Text>
              <Text>
                But you can edit the snap source code to make it do something,
                if you want to!
              </Text>
            </Box>
          ),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
