import type { Entity } from '@arkiv-network/sdk';

// ============================================================================
// ENTITY TYPES - AAVE V3 ONLY
// ============================================================================

export type ProtocolType = 'aave-v3';
export type AaveEventType = 'Supply' | 'Withdraw' | 'FlashLoan' | 'LiquidationCall';
export type EventType = AaveEventType;

// ============================================================================
// AAVE V3 EVENT INTERFACES
// ============================================================================

/**
 * Base interface for all Aave V3 events
 */
interface BaseAaveEvent {
  protocol: 'aave-v3';
  eventType: AaveEventType;
  txHash: string;
}

/**
 * Withdraw Event
 * Emitted when a user withdraws from Aave V3
 */
export interface WithdrawEvent extends BaseAaveEvent {
  eventType: 'Withdraw';
  reserve: string;    // Asset address (e.g., USDC, WETH)
  user: string;       // User wallet address
  to: string;         // Recipient address
  amount: string;     // Amount withdrawn (BigInt as string)
}

/**
 * Supply Event
 * Emitted when a user supplies assets to Aave V3
 */
export interface SupplyEvent extends BaseAaveEvent {
  eventType: 'Supply';
  reserve: string;        // Asset address
  user: string;           // User wallet address
  onBehalfOf: string;     // Beneficiary receiving aTokens
  amount: string;         // Amount supplied (BigInt as string)
  referralCode: string;   // Referral code (BigInt as string)
}

/**
 * FlashLoan Event
 * Emitted when a flash loan is executed
 */
export interface FlashLoanEvent extends BaseAaveEvent {
  eventType: 'FlashLoan';
  target: string;             // Flash loan receiver contract
  initiator: string;          // Address initiating the flash loan
  asset: string;              // Asset being flash borrowed
  amount: string;             // Amount flash borrowed (BigInt as string)
  interestRateMode: string;   // 0=regular, 1=Stable (deprecated), 2=Variable
  premium: string;            // Fee for flash loan (BigInt as string)
  referralCode: string;       // Referral code (BigInt as string)
}

/**
 * LiquidationCall Event
 * Emitted when a liquidation occurs
 */
export interface LiquidationCallEvent extends BaseAaveEvent {
  eventType: 'LiquidationCall';
  collateralAsset: string;              // Asset used as collateral
  debtAsset: string;                    // Asset borrowed
  user: string;                         // User being liquidated
  debtToCover: string;                  // Amount of debt covered (BigInt as string)
  liquidatedCollateralAmount: string;   // Amount of collateral liquidated (BigInt as string)
  liquidator: string;                   // Address performing liquidation
  receiveAToken: string;                // Whether liquidator receives aTokens (boolean as string)
}

// ============================================================================
// UNION TYPES
// ============================================================================

export type AaveEvent = WithdrawEvent | SupplyEvent | FlashLoanEvent | LiquidationCallEvent;
export type ProtocolEvent = AaveEvent;
export type EntityData = AaveEvent;

// ============================================================================
// PARSED ENTITY
// ============================================================================

export type ParsedEntity<T extends EntityData = EntityData> = T & {
  entityKey: string;
};

export type ParsedEvent = ParsedEntity<ProtocolEvent>;
export type ParsedAaveEvent = ParsedEntity<AaveEvent>;

// ============================================================================
// ARKIV ENTITY RESPONSE
// ============================================================================

export type ArkivEntity = Entity;

// ============================================================================
// QUERY RESULT
// ============================================================================

export interface EventQueryResult {
  entities: ArkivEntity[];
  hasNextPage: () => boolean;
  next: () => Promise<EventQueryResult>;
}

// ============================================================================
// STATS
// ============================================================================

export interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  totalVolume: {
    [asset: string]: bigint;
  };
  uniqueUsers: number;
  recentEvents: ParsedEvent[];
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export interface EventFilters {
  protocol?: ProtocolType;
  eventType?: EventType | 'all';
  asset?: string;           // Can be reserve, asset, collateralAsset, or debtAsset
  user?: string;            // User, initiator, or liquidator
  txHash?: string;
  limit?: number;
  minAmount?: string;
  maxAmount?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isWithdrawEvent(entity: EntityData): entity is WithdrawEvent {
  return entity.eventType === 'Withdraw';
}

export function isSupplyEvent(entity: EntityData): entity is SupplyEvent {
  return entity.eventType === 'Supply';
}

export function isFlashLoanEvent(entity: EntityData): entity is FlashLoanEvent {
  return entity.eventType === 'FlashLoan';
}

export function isLiquidationCallEvent(entity: EntityData): entity is LiquidationCallEvent {
  return entity.eventType === 'LiquidationCall';
}

export function isAaveEvent(entity: EntityData): entity is AaveEvent {
  return entity.protocol === 'aave-v3';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely get the primary asset from any event type
 */
export function getEventAsset(event: ParsedEvent): string | undefined {
  const data = event as any;
  return data.reserve || data.asset || data.collateralAsset || data.debtAsset;
}

/**
 * Safely get the primary user from any event type
 */
export function getEventUser(event: ParsedEvent): string | undefined {
  const data = event as any;
  return data.user || data.initiator || data.liquidator;
}

/**
 * Safely get the primary amount from any event type
 */
export function getEventAmount(event: ParsedEvent): string | undefined {
  const data = event as any;
  return data.amount || data.debtToCover || data.liquidatedCollateralAmount;
}
