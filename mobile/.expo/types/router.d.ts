/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/alunos` | `/(tabs)/boletim` | `/(tabs)/disciplinas` | `/(tabs)/notas` | `/(tabs)/perfil` | `/(tabs)/professores` | `/_sitemap` | `/alunos` | `/boletim` | `/disciplinas` | `/login` | `/notas` | `/perfil` | `/professores`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
