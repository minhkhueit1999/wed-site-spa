import fs from 'node:fs';
import path from 'node:path';
import { KnowledgeDocument, KnowledgeFrontmatter } from '../types';

export function parseFrontmatter(fileContent: string, filePath: string): KnowledgeDocument {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`Tài liệu "${filePath}" thiếu phần frontmatter YAML (---\\n...\\n---).`);
  }

  const rawYaml = match[1] ?? '';
  const content = (match[2] ?? '').trim();

  const metadata: Record<string, string> = {};
  const lines = rawYaml.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let val = trimmed.slice(colonIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    metadata[key] = val;
  }

  const requiredFields: (keyof KnowledgeFrontmatter)[] = [
    'title',
    'type',
    'slug',
    'reviewedBy',
    'updatedAt',
  ];

  for (const field of requiredFields) {
    if (!metadata[field]) {
      throw new Error(`Tài liệu "${filePath}" thiếu trường bắt buộc "${field}" trong frontmatter.`);
    }
  }

  return {
    title: metadata.title ?? '',
    type: metadata.type ?? '',
    slug: metadata.slug ?? '',
    reviewedBy: metadata.reviewedBy ?? 'CHƯA DUYỆT',
    updatedAt: metadata.updatedAt ?? '',
    content,
    filePath,
  };
}

export function loadKnowledgeDocuments(dirPath: string): KnowledgeDocument[] {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Thư mục tri thức "${dirPath}" không tồn tại.`);
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));
  const docs: KnowledgeDocument[] = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const doc = parseFrontmatter(content, fullPath);
    docs.push(doc);
  }

  return docs;
}
