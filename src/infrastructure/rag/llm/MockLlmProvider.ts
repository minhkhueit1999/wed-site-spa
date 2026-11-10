import { LlmProvider, LlmGenerateParams } from './LlmProvider';

export class MockLlmProvider implements LlmProvider {
  async generate({ context, question }: LlmGenerateParams): Promise<string> {
    if (!context || context.trim().length === 0) {
      return 'Hiện tại tôi chưa có đủ dữ liệu từ tài liệu spa để giải đáp câu hỏi này. Vui lòng liên hệ trực tiếp với chuyên viên hoặc kỹ thuật viên spa để được tư vấn chính xác.';
    }

    // Tách các đoạn ngữ cảnh [1], [2], ...
    const chunkMatches = Array.from(
      context.matchAll(/\[(\d+)\]\s+([^\n]+)\n([\s\S]*?)(?=\n\[\d+\]|$)/g),
    );

    if (chunkMatches.length === 0) {
      return `Dựa trên tài liệu chăm sóc của Digital Wellness Spa, câu hỏi "${question}" của bạn được hướng dẫn thực hiện theo đúng quy chuẩn phác đồ [1].`;
    }

    const firstChunk = chunkMatches[0];
    if (!firstChunk) {
      return `Dựa trên tài liệu spa, câu hỏi "${question}" của bạn được giải đáp theo quy chuẩn phác đồ [1].`;
    }
    const index = firstChunk[1] ?? '1';
    const heading = (firstChunk[2] ?? 'Tài liệu').trim();
    const content = (firstChunk[3] ?? '').trim().split('\n')[0] || '';

    let answer = `Dựa trên tài liệu về "${heading}" [${index}], `;

    if (question.toLowerCase().includes('sử dụng') || question.toLowerCase().includes('dùng')) {
      answer += `bạn nên tuân thủ đúng hướng dẫn sử dụng trong toa chăm sóc tại nhà: ${content.slice(0, 160)}... Để đạt hiệu quả tối ưu, hãy kết hợp đều đặn giữa các buổi trị liệu tại spa và dưỡng tại nhà. [${index}]`;
    } else if (
      question.toLowerCase().includes('chống chỉ định') ||
      question.toLowerCase().includes('lưu ý')
    ) {
      answer += `bạn cần đặc biệt lưu ý các nguyên tắc an toàn: ${content.slice(0, 160)}... Nếu có các triệu chứng bất thường, hãy trao đổi ngay với kỹ thuật viên phụ trách. [${index}]`;
    } else {
      answer += `Digital Wellness Spa giải thích như sau: ${content.slice(0, 180)}... Đây là thông tin tham khảo từ quy chuẩn chuyên môn của spa nhằm hỗ trợ bạn hiểu rõ hơn về liệu trình. [${index}]`;
    }

    return answer;
  }
}
