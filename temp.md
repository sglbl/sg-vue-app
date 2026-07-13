# Pinia Options API → Composition API store

Quick-reference mapping when converting Pinia stores.

## Concept mapping (the whole story in one table)

| Options API store | Composition API store |
|---|---|
| `state: () => ({ x: ..., y: ... })` | `const x = ref(...)` etc. |
| `actions: { foo() { this.x = ... } }` | plain `function foo() { x.value = ... }` |
| `this.x` | `x.value` (just like components) |
| `persist: true` (bare option at root) | `{ persist: true }` (third argument to `defineStore`) |
| `getters: { ... }` | `computed(() => ...)` inside the setup, returned in the object |

## `defineStore` signature

```ts
// Options API style:
defineStore('id', { state, actions, getters, persist: true })

// Composition API style:
defineStore('id', () => { /* setup */ return { ... } }, { persist: true })
//                                  ^ setup fn      ^ third arg = options
```

## Notes

- The third argument to `defineStore` is the same options object you'd pass to an options store — that's where `persist: true` goes in the composition style.
- The store's external API (`useStore().x`, `useStore().foo()`) is identical between the two styles — consumers don't need to change.
- Add `import { ref } from 'vue'` (and `computed` if you need getters).