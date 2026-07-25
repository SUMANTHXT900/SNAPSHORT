/// Detects text encoding of raw bytes using encoding_rs.
pub fn detect_encoding(bytes: &[u8]) -> String {
    if bytes.is_empty() {
        return "utf-8".to_string();
    }
    // Check BOM first
    if let Some((encoding, _bom_len)) = encoding_rs::Encoding::for_bom(bytes) {
        return encoding.name().to_lowercase();
    }
    // Check for UTF-16 LE/BE without BOM
    if bytes.len() >= 2 {
        if bytes[0] == 0xff && bytes[1] == 0xfe {
            return "utf-16le".to_string();
        }
        if bytes[0] == 0xfe && bytes[1] == 0xff {
            return "utf-16be".to_string();
        }
    }
    // Default / guess: check if valid UTF-8
    if std::str::from_utf8(bytes).is_ok() {
        return "utf-8".to_string();
    }
    // Fallback
    "utf-8".to_string()
}
