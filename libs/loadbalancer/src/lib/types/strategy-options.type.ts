export type LoadBalanceStrategy =
  | 'RoundRobinStrategy'
  | 'RandomStrategy'
  | 'StaticStrategy'
  | 'WeightedRandomStrategy'
  | 'WeightedRoundRandomStrategy'
  | string;
