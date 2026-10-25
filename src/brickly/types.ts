export const BRICKLY_VERSION = "0.1.0" as const;
export const BRICKLY_SCHEMA_VERSION = 1 as const;

export type BrickId = string;
export type ConnectionId = string;
export type VariableName = string;
export type ListName = string;
export type ProcedureName = string;
export type ThreadId = string;

export type CategoryName =
  | "motion"
  | "looks"
  | "sound"
  | "events"
  | "control"
  | "sensing"
  | "operators"
  | "variables"
  | "lists"
  | "custom";

export type ValueType = "number" | "string" | "boolean" | "list" | "any" | "void";

export type FieldKind =
  | "text"
  | "number"
  | "angle"
  | "color"
  | "dropdown"
  | "boolean"
  | "variable"
  | "list"
  | "procedure";

export type InputShape = "round" | "square" | "stack" | "hat" | "c-block" | "cap";

export type BrickShape = "stack" | "reporter" | "boolean" | "hat" | "c-block" | "cap";

export type BlockDropZone =
  | "next"
  | "previous"
  | "input"
  | "branch"
  | "workspace"
  | "none";

export interface ValueTypeMap {
  number: number;
  string: string;
  boolean: boolean;
  list: readonly unknown[];
  any: unknown;
  void: null;
}

export type PrimitiveValue = number | string | boolean;

export interface ValueLiteral<T extends ValueType = ValueType> {
  readonly type: T;
  readonly value: ValueTypeMap[T];
}

export interface BrickFieldDefinition {
  readonly name: string;
  readonly kind: FieldKind;
  readonly label: string;
  readonly defaultValue: string | number | boolean;
  readonly options?: readonly string[];
  readonly acceptsDrop?: boolean;
}

export interface BrickInputDefinition {
  readonly name: string;
  readonly label: string;
  readonly shape: InputShape;
  readonly acceptsReporter: boolean;
  readonly acceptsBoolean: boolean;
  readonly acceptsStack: boolean;
  readonly defaultValue?: unknown;
}

export interface BrickDefinition {
  readonly opcode: string;
  readonly category: CategoryName;
  readonly shape: BrickShape;
  readonly label: string;
  readonly inputs: readonly BrickInputDefinition[];
  readonly fields: readonly BrickFieldDefinition[];
  readonly hasNextConnection: boolean;
  readonly hasPreviousConnection: boolean;
  readonly hasBranchConnections: readonly string[];
  readonly returnType: ValueType | null;
  readonly isTerminal: boolean;
  readonly isHat: boolean;
  readonly documentation: string;
  readonly searchableTerms: readonly string[];
}

export interface VariableReference {
  readonly id: VariableName;
  readonly scope: "local" | "global";
}

export interface ProcedureReference {
  readonly name: ProcedureName;
  readonly parameterIds: readonly VariableName[];
}

export interface BrickInstance {
  readonly id: BrickId;
  readonly opcode: string;
  readonly x: number;
  readonly y: number;
  readonly fields: Readonly<Record<string, string | number | boolean>>;
  readonly inputs: Readonly<Record<string, InputConnection | null>>;
  readonly next: BrickId | null;
  readonly parent: BrickId | null;
  readonly branchTargets: Readonly<Record<string, BrickId | null>>;
  readonly disabled: boolean;
  readonly collapsed: boolean;
}

export type InputConnection =
  | { readonly kind: "literal"; readonly value: ValueLiteral }
  | { readonly kind: "brick"; readonly brickId: BrickId }
  | { readonly kind: "variable"; readonly variable: VariableReference }
  | { readonly kind: "empty" };

export interface WorkspaceMetadata {
  readonly id: string;
  readonly name: string;
  readonly createdAt: number;
  readonly modifiedAt: number;
  readonly version: string;
  readonly description: string;
  readonly author: string;
}

export interface VariableDefinition {
  readonly id: VariableName;
  readonly name: string;
  readonly type: ValueType;
  readonly defaultValue: PrimitiveValue | readonly unknown[];
  readonly isGlobal: boolean;
}

export interface ListDefinition {
  readonly id: ListName;
  readonly name: string;
  readonly initialContents: readonly PrimitiveValue[];
}

export interface ProcedureParameter {
  readonly id: VariableName;
  readonly name: string;
  readonly defaultValue: PrimitiveValue;
}

export interface ProcedureDefinition {
  readonly name: ProcedureName;
  readonly parameters: readonly ProcedureParameter[];
  readonly definitionBrickId: BrickId;
  readonly prototypeBrickId: BrickId;
  readonly isWarp: boolean;
}

export interface BrickComment {
  readonly id: string;
  readonly brickId: BrickId | null;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly text: string;
  readonly minimized: boolean;
}

export interface Workspace {
  readonly metadata: WorkspaceMetadata;
  readonly bricks: Readonly<Record<BrickId, BrickInstance>>;
  readonly topLevelBricks: readonly BrickId[];
  readonly variables: Readonly<Record<VariableName, VariableDefinition>>;
  readonly lists: Readonly<Record<ListName, ListDefinition>>;
  readonly procedures: Readonly<Record<ProcedureName, ProcedureDefinition>>;
  readonly comments: Readonly<Record<string, BrickComment>>;
}

export interface ConnectionPoint {
  readonly brickId: BrickId;
  readonly kind: "next" | "previous" | "input" | "branch";
  readonly name: string | null;
}

export interface DragState {
  readonly brickId: BrickId;
  readonly originalParent: BrickId | null;
  readonly originalNext: BrickId | null;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly isDuplicating: boolean;
}

export interface BrickPickResult {
  readonly brickId: BrickId;
  readonly x: number;
  readonly y: number;
  readonly localX: number;
  readonly localY: number;
  readonly zone: BlockDropZone;
}

export interface DropTarget {
  readonly brickId: BrickId;
  readonly connection: ConnectionPoint;
  readonly zone: BlockDropZone;
  readonly distance: number;
  readonly valid: boolean;
  readonly rejectionReason: string | null;
}

export interface RuntimeValue {
  readonly type: ValueType;
  readonly value: unknown;
}

export interface ExecutionFrame {
  readonly brickId: BrickId;
  readonly loopCounter: number;
  readonly procedureName: ProcedureName | null;
  readonly returnAddress: BrickId | null;
  readonly branchName: string | null;
  readonly enteredAt: number;
}

export interface ExecutionContext {
  readonly id: string;
  readonly workspace: Workspace;
  readonly variables: Map<string, RuntimeValue>;
  readonly lists: Map<string, RuntimeValue[]>;
  readonly stack: ExecutionFrame[];
  readonly globalVariables: Map<string, RuntimeValue>;
  readonly startTime: number;
  readonly threadId: ThreadId;
  readonly signal: AbortSignal | null;
  readonly randomSeed: number | null;
}

export type ErrorCode =
  | "UNKNOWN_OPCODE"
  | "TYPE_MISMATCH"
  | "DIVISION_BY_ZERO"
  | "VARIABLE_NOT_FOUND"
  | "LIST_INDEX_OUT_OF_BOUNDS"
  | "STACK_OVERFLOW"
  | "INVALID_CONNECTION"
  | "EXECUTION_ABORTED"
  | "PROCEDURE_NOT_FOUND"
  | "INVALID_ARGUMENT_COUNT"
  | "PARSE_ERROR"
  | "SERIALIZATION_ERROR"
  | "VALIDATION_ERROR";

export interface ExecutionError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly brickId: BrickId | null;
  readonly stack: readonly BrickId[];
  readonly timestamp: number;
}

export interface ExecutionResult {
  readonly success: boolean;
  readonly value: RuntimeValue | null;
  readonly error: ExecutionError | null;
  readonly durationMs: number;
  readonly bricksExecuted: number;
  readonly maxStackDepth: number;
}

export interface SerializedWorkspace {
  readonly schemaVersion: number;
  readonly metadata: WorkspaceMetadata;
  readonly bricks: readonly BrickInstance[];
  readonly variables: readonly VariableDefinition[];
  readonly lists: readonly ListDefinition[];
  readonly procedures: readonly ProcedureDefinition[];
  readonly comments: readonly BrickComment[];
}

export interface ValidationIssue {
  readonly severity: "error" | "warning" | "info";
  readonly code: string;
  readonly message: string;
  readonly path: string;
  readonly brickId: BrickId | null;
}

export interface ValidationReport {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly checkedAt: number;
}

export interface StatementNode {
  readonly type: "statement";
  readonly brickId: BrickId;
  readonly opcode: string;
  readonly next: StatementNode | null;
  readonly inputs: Readonly<Record<string, ExpressionNode | null>>;
  readonly fields: Readonly<Record<string, string | number | boolean>>;
  readonly branches: Readonly<Record<string, StatementNode | null>>;
}

export interface ExpressionNode {
  readonly type: "expression";
  readonly brickId: BrickId;
  readonly opcode: string;
  readonly inputs: Readonly<Record<string, ExpressionNode | LiteralNode | null>>;
  readonly fields: Readonly<Record<string, string | number | boolean>>;
  readonly returnType: ValueType;
}

export interface LiteralNode {
  readonly type: "literal";
  readonly value: ValueLiteral;
}

export interface VariableNode {
  readonly type: "variable";
  readonly reference: VariableReference;
}

export type AstNode = StatementNode | ExpressionNode | LiteralNode | VariableNode;

export interface CompiledProgram {
  readonly workspaceId: string;
  readonly root: StatementNode | null;
  readonly procedures: Readonly<Record<ProcedureName, StatementNode>>;
  readonly compiledAt: number;
  readonly brickCount: number;
  readonly sourceHash: string;
}

export interface ReporterDefinition<T = unknown> {
  readonly opcode: string;
  readonly returnType: ValueType;
  readonly evaluate: (ctx: ExecutionContext, node: ExpressionNode) => T;
}

export interface StatementDefinition {
  readonly opcode: string;
  readonly execute: (
    ctx: ExecutionContext,
    node: StatementNode
  ) => StatementExecutionOutcome;
}

export type StatementExecutionOutcome =
  | { readonly kind: "continue" }
  | { readonly kind: "jump"; readonly target: BrickId }
  | { readonly kind: "return"; readonly value: RuntimeValue | null }
  | { readonly kind: "halt" }
  | { readonly kind: "error"; readonly error: ExecutionError };