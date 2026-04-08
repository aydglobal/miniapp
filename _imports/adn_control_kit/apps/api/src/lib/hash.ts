import crypto from "crypto";

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function stableJsonHash(value: unknown) {
  return sha256(JSON.stringify(value));
}
