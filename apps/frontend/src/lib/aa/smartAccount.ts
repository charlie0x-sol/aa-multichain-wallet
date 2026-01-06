import { createPimlicoBundlerClient } from 'permissionless/clients/pimlico';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { http } from 'viem';

export async function sendGaslessTransaction(
  userOp: any, // In a real app, define a proper UserOperation type
  chainId: number
) {
  try {
    const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
    if (!pimlicoApiKey) {
      throw new Error('PIMLICO_API_KEY is not set');
    }

    const bundlerUrl = `https://api.pimlico.io/v1/${chainId}/rpc?apikey=${pimlicoApiKey}`;
    
    const bundler = createPimlicoBundlerClient({
      transport: http(bundlerUrl),
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });

    const userOpHash = await bundler.sendUserOperation({
      userOperation: userOp,
    });

    console.log('UserOp sent:', userOpHash);
    
    // Wait for confirmation
    const receipt = await bundler.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return { success: true, receipt };
  } catch (error) {
    console.error('Gasless tx failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Transaction failed. Please try again.');
  }
}
