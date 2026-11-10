import { KnowledgeDocument, KnowledgeChunkData } from '../types';

export interface ChunkOptions {
  maxChars?: number;
  overlapChars?: number;
}

export function chunkKnowledgeDocument(
  doc: KnowledgeDocument,
  options: ChunkOptions = {},
): KnowledgeChunkData[] {
  const maxChars = options.maxChars ?? 1200;
  const overlapChars = options.overlapChars ?? 200;

  const lines = doc.content.split(/\r?\n/);
  const sections: { headingPath: string; lines: string[] }[] = [];

  let currentHeadingPath = doc.title;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      if (currentLines.some((l) => l.trim().length > 0)) {
        sections.push({
          headingPath: currentHeadingPath,
          lines: currentLines,
        });
        currentLines = [];
      }
      const headingLevel = headingMatch[1];
      const headingText = headingMatch[2]?.trim() ?? '';
      if (headingLevel === '#') {
        currentHeadingPath = headingText;
      } else {
        currentHeadingPath = `${doc.title} > ${headingText}`;
      }
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.some((l) => l.trim().length > 0)) {
    sections.push({
      headingPath: currentHeadingPath,
      lines: currentLines,
    });
  }

  const chunks: KnowledgeChunkData[] = [];

  for (const section of sections) {
    const sectionText = section.lines.join('\n').trim();
    if (!sectionText) continue;

    if (sectionText.length <= maxChars) {
      chunks.push({
        slug: doc.slug,
        title: doc.title,
        type: doc.type,
        headingPath: section.headingPath,
        text: `[${section.headingPath}]\n${sectionText}`,
        reviewedBy: doc.reviewedBy,
      });
    } else {
      let start = 0;
      while (start < sectionText.length) {
        let end = Math.min(start + maxChars, sectionText.length);
        if (end < sectionText.length) {
          const lastPeriod = sectionText.lastIndexOf('. ', end);
          const lastNewline = sectionText.lastIndexOf('\n', end);
          const breakPoint = Math.max(lastPeriod, lastNewline);
          if (breakPoint > start + maxChars / 2) {
            end = breakPoint + 1;
          }
        }

        const slice = sectionText.slice(start, end).trim();
        if (slice.length > 30) {
          chunks.push({
            slug: doc.slug,
            title: doc.title,
            type: doc.type,
            headingPath: section.headingPath,
            text: `[${section.headingPath}]\n${slice}`,
            reviewedBy: doc.reviewedBy,
          });
        }

        if (end >= sectionText.length) break;
        start = end - overlapChars;
      }
    }
  }

  return chunks;
}

export function chunkAllDocuments(
  docs: KnowledgeDocument[],
  options?: ChunkOptions,
): KnowledgeChunkData[] {
  return docs.flatMap((doc) => chunkKnowledgeDocument(doc, options));
}
