import { supabase } from "./supabase";
import type { Article } from "@/types/database";

/**
 * Topic Concept Map — expands a topic slug into related query keywords.
 * This allows /topic/ai to also surface articles tagged with "nvidia", "gpu", etc.
 *
 * Rules:
 *   - Only map broad concept topics that naturally encompass sub-keywords
 *   - Individual brand/product topics (e.g. "nvidia") should NOT be expanded
 *   - Keep each list focused to avoid polluting results
 */
const TOPIC_CONCEPTS: Record<string, string[]> = {
  ai: [
    "ai",
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "llm",
    "openai",
    "chatgpt",
    "gpt5",
    "gemini",
    "copilot",
    "deepseek",
    "anthropic",
    "claude",
  ],
  crypto: ["crypto", "bitcoin", "ethereum", "blockchain", "defi"],
  ev: ["ev", "electric vehicle", "battery", "charging"],
  semiconductor: ["semiconductor", "chip", "chipmaker", "foundry", "tsmc"],
  cybersecurity: [
    "cybersecurity",
    "cyber security",
    "hacking",
    "ransomware",
    "data breach",
  ],
  cloud: ["cloud", "cloud computing", "aws", "azure", "gcp"],
  space: ["space", "nasa", "spacex", "satellite", "rocket"],
  quantum: ["quantum", "quantum computing", "qubit"],
  robot: ["robot", "robotics", "automation"],
  startup: ["startup", "venture capital", "vc", "funding", "unicorn"],
};

/** SEO description templates for concept topics */
const TOPIC_DESCRIPTIONS: Record<string, string> = {
  ai: "Latest news about artificial intelligence, machine learning, LLMs, ChatGPT, and AI industry developments.",
  crypto:
    "Breaking news on cryptocurrency, Bitcoin, Ethereum, blockchain technology, and DeFi markets.",
  ev: "Electric vehicle news including Tesla, battery technology, charging infrastructure, and EV market trends.",
  semiconductor:
    "Semiconductor industry news covering chip manufacturing, foundries, TSMC, and global chip supply.",
  cybersecurity:
    "Cybersecurity news on hacking incidents, ransomware, data breaches, and digital security.",
  cloud:
    "Cloud computing news covering AWS, Azure, GCP, and enterprise cloud technology.",
  space:
    "Space exploration news including NASA, SpaceX, satellites, and rocket launches.",
  quantum:
    "Quantum computing breakthroughs, qubit research, and quantum technology developments.",
  robot:
    "Robotics and automation news covering industrial robots, AI-powered automation, and humanoid robots.",
  startup:
    "Startup ecosystem news including funding rounds, venture capital, unicorns, and tech entrepreneurship.",
};

/**
 * Get the expanded keyword list for a topic.
 * If the topic has a concept map, returns all mapped keywords.
 * Otherwise returns just the original keyword.
 */
export function getConceptKeywords(topic: string): string[] {
  const lower = topic.toLowerCase();
  return TOPIC_CONCEPTS[lower] || [topic];
}

/**
 * Get SEO description for a topic, or null if no custom description exists.
 */
export function getTopicDescription(topic: string): string | null {
  return TOPIC_DESCRIPTIONS[topic.toLowerCase()] || null;
}

/**
 * Query articles using expanded concept keywords.
 * Builds a single Supabase .or() query with all concept keywords.
 * Does NOT modify articles.ts — uses supabase client directly.
 */
export async function getArticlesByConceptTopic(
  topic: string,
  limit: number = 50
): Promise<Article[]> {
  const keywords = getConceptKeywords(topic);

  // Build OR conditions: keywords.cs.{kw} for each concept keyword + title/excerpt.ilike for original topic
  const conditions = keywords
    .map((kw) => `keywords.cs.{${kw}}`)
    .concat([`title.ilike.%${topic}%`, `excerpt.ilike.%${topic}%`])
    .join(",");

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .or(conditions)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[topicConcepts] getArticlesByConceptTopic error:", error.message, topic);
  }

  // Deduplicate by source_url
  const articles = (data || []) as Article[];
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.source_url)) return false;
    seen.add(a.source_url);
    return true;
  });
}
