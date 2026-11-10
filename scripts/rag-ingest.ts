import path from 'node:path';
import { loadKnowledgeDocuments } from '../src/infrastructure/rag/ingest/loader';
import { chunkAllDocuments } from '../src/infrastructure/rag/ingest/chunker';
import { createEmbeddingProvider } from '../src/infrastructure/rag/embedding';
import { SqliteVectorStore } from '../src/infrastructure/rag/store/SqliteVectorStore';
import { prisma } from '../src/infrastructure/db/prisma';

async function main() {
  console.log('--- KHỞI ĐỘNG QUÁ TRÌNH NẠP DỮ LIỆU TRI THỨC RAG ---');

  const knowledgeDir = path.resolve(process.cwd(), 'data/knowledge');
  console.log(`1. Đọc tài liệu từ: ${knowledgeDir}`);
  const docs = loadKnowledgeDocuments(knowledgeDir);
  console.log(`   -> Tìm thấy ${docs.length} tài liệu hợp lệ.`);

  console.log('2. Phân đoạn tài liệu (Chunking)...');
  const chunks = chunkAllDocuments(docs);
  console.log(`   -> Tạo ra ${chunks.length} đoạn tri thức (chunks).`);

  console.log('3. Tính toán Vector Embedding...');
  const embeddingProvider = createEmbeddingProvider();
  const textsToEmbed = chunks.map((c) => c.text);
  const embeddings = await embeddingProvider.embed(textsToEmbed);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const emb = embeddings[i];
    if (chunk && emb) {
      chunk.embedding = emb;
    }
  }
  console.log(`   -> Hoàn thành nhúng vector cho ${embeddings.length} đoạn.`);

  console.log('4. Lưu trữ vào VectorStore (SQLite KnowledgeChunk)...');
  const vectorStore = new SqliteVectorStore();
  await vectorStore.upsert(chunks);

  const totalInDb = await vectorStore.count();
  console.log(`   -> Đã lưu thành công. Tổng số bản ghi trong bảng KnowledgeChunk: ${totalInDb}`);
  console.log('--- NẠP TRI THỨC HOÀN TẤT THÀNH CÔNG ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi nạp dữ liệu tri thức:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
