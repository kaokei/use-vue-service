# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.0.3](https://github.com/kaokei/use-vue-service/compare/v4.0.2...v4.0.3) (2026-04-28)


### Features

* **examples:** add example 19 - nuxt auto imports demo ([73e4452](https://github.com/kaokei/use-vue-service/commit/73e44521ab0461bc4a63aa3a6891c565b7dd573c))
* **nuxt-plugin:** implement zero-config auto-imports module ([f284b3a](https://github.com/kaokei/use-vue-service/commit/f284b3aa25b0e92828c9d198ff4a49181b1f1d3c))


### Bug Fixes

* **examples/19:** add missing deps and fix declareAppProviders/useAppService calls ([ea83071](https://github.com/kaokei/use-vue-service/commit/ea83071ed38f8f08ed71f49cc6926568d35cdf08))
* **nuxt-plugin:** fix build config and align exports with @pinia/nuxt ([6e6648c](https://github.com/kaokei/use-vue-service/commit/6e6648cdaa1a2f2256daea408a6f0605224df38d))
* **nuxt-plugin:** move @kaokei/di and @kaokei/use-vue-service to peerDependencies ([283ce0d](https://github.com/kaokei/use-vue-service/commit/283ce0dbf5d8e6171dc2afd170b034dfd09cb444))
* **nuxt-plugin:** move @nuxt/kit to dependencies and trim auto-import list ([0830fac](https://github.com/kaokei/use-vue-service/commit/0830fac5333ad56c665e19702b1f4c5c3df762d8))
* **nuxt-plugin:** remove nuxt from peerDependencies, align with @pinia/nuxt ([f16a3e9](https://github.com/kaokei/use-vue-service/commit/f16a3e9e5c30df400dec54dddf978ba0dbd5d237))
* **nuxt-plugin:** support Nuxt 4 compatibility, bump to 1.0.1 ([cc6fe7f](https://github.com/kaokei/use-vue-service/commit/cc6fe7f8160840880b46dcdd71a81090c0ed04df))

### [4.0.2](https://github.com/kaokei/use-vue-service/compare/v4.0.1...v4.0.2) (2026-04-27)

### [4.0.1](https://github.com/kaokei/use-vue-service/compare/v4.0.0...v4.0.1) (2026-04-12)

## [4.0.0](https://github.com/kaokei/use-vue-service/compare/v3.0.2...v4.0.0) (2026-04-12)

### [3.0.2](https://github.com/kaokei/use-vue-service/compare/v3.0.1...v3.0.2) (2025-06-29)

### [3.0.1](https://github.com/kaokei/use-vue-service/compare/v3.0.0...v3.0.1) (2025-05-12)

## [3.0.0](https://github.com/kaokei/use-vue-service/compare/v2.0.5...v3.0.0) (2025-05-12)

## [3.0.0](https://github.com/kaokei/use-vue-service/compare/v2.0.5...v3.0.0) (2024-11-24)

### [2.0.5](https://github.com/kaokei/use-vue-service/compare/v2.0.4...v2.0.5) (2024-04-12)

### [2.0.4](https://github.com/kaokei/use-vue-service/compare/v2.0.3...v2.0.4) (2024-04-12)

### [2.0.3](https://github.com/kaokei/use-vue-service/compare/v2.0.2...v2.0.3) (2024-04-12)

### [2.0.2](https://github.com/kaokei/use-vue-service/compare/v2.0.0...v2.0.2) (2023-12-05)


### Features

* 增加exports ([0e32856](https://github.com/kaokei/use-vue-service/commit/0e32856380bdec38e9fdceb15fd7cd0103b06a13))
* 适配不支持emitDecoratorMetadata的场景 ([a62f3d2](https://github.com/kaokei/use-vue-service/commit/a62f3d274628f61e8a49c207bd6aa5e748b7ed56))

## [2.0.0](https://github.com/kaokei/use-vue-service/compare/v1.1.1...v2.0.0) (2023-11-25)


### Features

* 优化了Injector的逻辑 ([266c8ca](https://github.com/kaokei/use-vue-service/commit/266c8ca4bb323067cf20897dec5d086175a13b4b))

### [1.1.1](https://github.com/kaokei/use-vue-service/compare/v1.1.0...v1.1.1) (2022-03-30)


### Bug Fixes

* **useservice:** 支持InjectionKey ([17313cd](https://github.com/kaokei/use-vue-service/commit/17313cd116176b8e4a45aaf05e4901514c3125b8))

## [1.1.0](https://github.com/kaokei/use-vue-service/compare/v1.0.18...v1.1.0) (2022-02-16)


### Features

* **bootstrap:** 删除bootstrap功能 ([de43690](https://github.com/kaokei/use-vue-service/commit/de43690c532209859b94f53652e248a455a56eb1))
* **di:** 基于新版di重新重构了一般，并完善了单元测试用例 ([845c8f9](https://github.com/kaokei/use-vue-service/commit/845c8f9e2df5de19f7cef2b7035770a8070870be))

### [1.0.18](https://github.com/kaokei/use-vue-service/compare/v1.0.17...v1.0.18) (2021-11-24)


### Features

* **bootstrap:** 增加bootstrap启动vue应用的入口 ([d7f1fca](https://github.com/kaokei/use-vue-service/commit/d7f1fca7711a7c22e599bdf68278cdc8a66fdad5))
* **bootstrap:** 重构了bootstrap逻辑 ([9cb1cae](https://github.com/kaokei/use-vue-service/commit/9cb1cae170352ddb26e2451e0b97a2a2015c1b4b))

### [1.0.17](https://github.com/kaokei/use-vue-service/compare/v1.0.16...v1.0.17) (2021-10-12)


### Features

* **useservice:** 直接获取根injector中的服务 ([92f1d0d](https://github.com/kaokei/use-vue-service/commit/92f1d0d77661c582ed89cecc55bede01252330d0))

### [1.0.16](https://github.com/kaokei/use-vue-service/compare/v1.0.15...v1.0.16) (2021-10-07)

### [1.0.15](https://github.com/kaokei/use-vue-service/compare/v1.0.14...v1.0.15) (2021-08-22)


### Features

* **update:** 升级@kaokei/di ([6064c4e](https://github.com/kaokei/use-vue-service/commit/6064c4e1b7fcd102f287bea03a1984c1621d2884))

### [1.0.14](https://github.com/kaokei/use-vue-service/compare/v1.0.13...v1.0.14) (2021-08-06)


### Features

* **dispose:** 删除了vue-class-component，并支持了服务的dispose功能 ([cad0454](https://github.com/kaokei/use-vue-service/commit/cad045461b6fd617a85456cc98a45ecf42406341))
* **example:** 增加__DEV__ ([757b7ef](https://github.com/kaokei/use-vue-service/commit/757b7ef6866ad16d3a77b2d3ec4e0648bcba7369))
* **plugin:** 支持vue plugin ([a4cee12](https://github.com/kaokei/use-vue-service/commit/a4cee12f1607dbee81dae5f0cf55efdbcae29be1))

### [1.0.13](https://github.com/kaokei/use-vue-service/compare/v1.0.12...v1.0.13) (2021-06-30)


### Bug Fixes

* **ci:** add globals ([49b3d34](https://github.com/kaokei/use-vue-service/commit/49b3d3408d2caeaa767195551e7c152cd97cbff6))

### [1.0.12](https://github.com/kaokei/use-vue-service/compare/v1.0.11...v1.0.12) (2021-06-30)


### Bug Fixes

* **ci:** inline @kaokei/di ([7ced072](https://github.com/kaokei/use-vue-service/commit/7ced07291f45cd380f26da96a650a8581c9e6c8e))

### 1.0.11 (2021-06-30)


### Features

* **di:** use @kaokei/di to support di ([e937cba](https://github.com/kaokei/use-vue-service/commit/e937cba4379ec87a3b139a6132509b5216409c09))

### 1.0.3 (2021-06-30)


### Features

* **di:** use @kaokei/di to support di ([e937cba](https://github.com/kaokei/use-vue-service/commit/e937cba4379ec87a3b139a6132509b5216409c09))
