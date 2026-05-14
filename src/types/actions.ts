export type ActionState = {
  success?: boolean
  error?: string | Record<string, string[]>
  data?: unknown
}
