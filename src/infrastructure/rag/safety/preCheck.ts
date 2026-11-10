import { RAGSafetyCheckResult } from '../types';

export const CANNED_RED_FLAG_RESPONSE =
  'CẢNH BÁO Y TẾ: Triệu chứng bạn mô tả có dấu hiệu khẩn cấp hoặc chống chỉ định nguy hiểm (đau dữ dội, sốt cao, xuất huyết, chấn thương hoặc nhiễm trùng cấp tính). Digital Wellness Spa không cung cấp chẩn đoán y tế. Vui lòng dừng mọi thao tác trị liệu và đến ngay bệnh viện hoặc cơ sở y tế chuyên khoa gần nhất để được thăm khám và cấp cứu kịp thời!';

export const CANNED_INJECTION_RESPONSE =
  'Yêu cầu của bạn vi phạm quy tắc an toàn hệ thống. Tôi là trợ lý tư vấn chăm sóc thể trạng của Digital Wellness Spa và chỉ hỗ trợ giải đáp các thắc mắc liên quan đến dịch vụ và toa chăm sóc dưỡng tại nhà của spa.';

export const RED_FLAG_KEYWORDS = [
  'đau dữ dội',
  'cơn đau thắt',
  'đau thắt ngực',
  'đau quằn quại',
  'đau nhói không chịu nổi',
  'sốt cao',
  'sốt 39',
  'sốt 40',
  'sốt trên 38.5',
  'sốt liên tục',
  'chảy máu',
  'xuất huyết',
  'nôn ra máu',
  'đi ngoài ra máu',
  'sốc phản vệ',
  'phù nề thanh quản',
  'khó thở cấp',
  'gãy xương',
  'rạn xương',
  'trật khớp cấp',
  'vết thương hở sâu',
  'chảy dịch mủ',
  'nhiễm trùng cấp',
  'tự tử',
  'tự hại',
  'muốn chết',
];

export const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /quên\s+(toàn bộ\s+)?(chỉ thị|hướng dẫn|câu lệnh)/i,
  /bỏ qua\s+(toàn bộ\s+)?(quy tắc|hướng dẫn|chỉ thị)/i,
  /đóng vai\s+(hacker|developer|dan|jailbreak)/i,
  /act as\s+(dan|jailbreak|unrestricted)/i,
  /system prompt/i,
  /tiết lộ\s+(mã nguồn|bí mật|lời nhắc hệ thống)/i,
  /reveal\s+(system\s+prompt|instructions)/i,
];

export function preCheckSafety(question: string): RAGSafetyCheckResult {
  const normalized = question.toLowerCase();

  // 1. Kiểm tra Cờ đỏ khẩn cấp (Medical Emergency / Red Flag)
  for (const kw of RED_FLAG_KEYWORDS) {
    if (normalized.includes(kw)) {
      return {
        safe: false,
        type: 'RED_FLAG',
        response: CANNED_RED_FLAG_RESPONSE,
      };
    }
  }

  // 2. Kiểm tra Prompt Injection / Jailbreak
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        type: 'PROMPT_INJECTION',
        response: CANNED_INJECTION_RESPONSE,
      };
    }
  }

  return { safe: true };
}
