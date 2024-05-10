
import {} from 'hono'
import { ServerEnv } from './types/env';

declare module 'hono' {
  interface Env {
      Bindings: ServerEnv
  }
}
