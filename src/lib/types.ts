// Aave Event Types
export type AaveEventType = 'Supply' | 'Borrow' | 'Withdraw' | 'Repay' | 'LiquidationCall';

// Base Event Interface
export interface AaveEvent {
  eventType: AaveEventType;
  protocol: string;
  network: string;
  reserve: string;
  user: string;
  amount: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;

  // Optional fields
  onBehalfOf?: string;
  to?: string;
  referralCode?: number;
  interestRateMode?: number;
  borrowRate?: string;
  repayer?: string;
  useATokens?: boolean;
  collateralAsset?: string;
  debtAsset?: string;
  liquidator?: string;
  liquidatedCollateralAmount?: string;
  debtToCover?: string;
}

// Arkiv Entity Response
export interface ArkivEntity {
  key: string;
  payload: Uint8Array;
  attributes: Array<{
    key: string;
    value: string;
  }>;
  contentType: string;
  expiration: number;
  owner: string;
  createdAtBlock: number;
  lastModifiedAtBlock: number;
}

// Query Result
export interface EventQueryResult {
  entities: ArkivEntity[];
  hasNextPage: () => boolean;
  next: () => Promise<EventQueryResult>;
}

// Parsed Event
export interface ParsedEvent extends AaveEvent {
  entityKey: string;
}

// Stats
export interface EventStats {
  totalEvents: number;
  eventsByType: Record<AaveEventType, number>;
  totalVolume: {
    [asset: string]: number;
  };
  uniqueUsers: number;
  recentEvents: ParsedEvent[];
}

// Filter Options
export interface EventFilters {
  eventType?: AaveEventType;
  asset?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}
