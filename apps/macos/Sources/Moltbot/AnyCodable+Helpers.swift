import FortclawKit
import FortclawProtocol
import Foundation

// Prefer the FortclawKit wrapper to keep gateway request payloads consistent.
typealias AnyCodable = FortclawKit.AnyCodable
typealias InstanceIdentity = FortclawKit.InstanceIdentity

extension AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: AnyCodable]? { self.value as? [String: AnyCodable] }
    var arrayValue: [AnyCodable]? { self.value as? [AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}

extension FortclawProtocol.AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: FortclawProtocol.AnyCodable]? { self.value as? [String: FortclawProtocol.AnyCodable] }
    var arrayValue: [FortclawProtocol.AnyCodable]? { self.value as? [FortclawProtocol.AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: FortclawProtocol.AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [FortclawProtocol.AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}
