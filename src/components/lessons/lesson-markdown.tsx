"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonMarkdownProps {
  content: string;
}

export function LessonMarkdown({ content }: LessonMarkdownProps) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
}
