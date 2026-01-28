// swift-tools-version: 6.2
// Package manifest for the Fortclaw macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Fortclaw",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "FortclawIPC", targets: ["FortclawIPC"]),
        .library(name: "FortclawDiscovery", targets: ["FortclawDiscovery"]),
        .executable(name: "Fortclaw", targets: ["Fortclaw"]),
        .executable(name: "moltbot-mac", targets: ["FortclawMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/FortclawKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "FortclawIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "FortclawDiscovery",
            dependencies: [
                .product(name: "FortclawKit", package: "FortclawKit"),
            ],
            path: "Sources/FortclawDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Fortclaw",
            dependencies: [
                "FortclawIPC",
                "FortclawDiscovery",
                .product(name: "FortclawKit", package: "FortclawKit"),
                .product(name: "FortclawChatUI", package: "FortclawKit"),
                .product(name: "FortclawProtocol", package: "FortclawKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Fortclaw.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "FortclawMacCLI",
            dependencies: [
                "FortclawDiscovery",
                .product(name: "FortclawKit", package: "FortclawKit"),
                .product(name: "FortclawProtocol", package: "FortclawKit"),
            ],
            path: "Sources/FortclawMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "FortclawIPCTests",
            dependencies: [
                "FortclawIPC",
                "Fortclaw",
                "FortclawDiscovery",
                .product(name: "FortclawProtocol", package: "FortclawKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
