import { apiGet, apiPost } from '@/utils/http';

export const walletApi = {
  getBalance: () => apiGet<number>('/wallet'),
  recharge: (amount: number) => apiPost<number>('/wallet/recharge', { amount }),
};
