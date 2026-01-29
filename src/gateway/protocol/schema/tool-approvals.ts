import { Type } from "@sinclair/typebox";
import { NonEmptyString } from "./primitives.js";

export const ToolApprovalRequestParamsSchema = Type.Object(
  {
    id: Type.Optional(NonEmptyString),
    toolName: NonEmptyString,
    params: Type.Record(Type.String(), Type.Unknown()),
    agentId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    sessionKey: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    summary: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    timeoutMs: Type.Optional(Type.Integer({ minimum: 1 })),
  },
  { additionalProperties: false },
);

export type ToolApprovalRequestParams = typeof ToolApprovalRequestParamsSchema.static;

export const ToolApprovalResolveParamsSchema = Type.Object(
  {
    id: NonEmptyString,
    decision: NonEmptyString, // "approve" or "deny"
  },
  { additionalProperties: false },
);

export type ToolApprovalResolveParams = typeof ToolApprovalResolveParamsSchema.static;
