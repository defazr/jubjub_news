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

/** SEO description templates for topic pages — used in metadata + visible About section */
const TOPIC_DESCRIPTIONS: Record<string, string> = {
  // Concept topics
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

  // Major brand/product topics
  nvidia:
    "NVIDIA news covering GPU launches, AI chip developments, data center hardware, and semiconductor market impact.",
  apple:
    "Apple news including iPhone updates, macOS releases, services expansion, and product launches worldwide.",
  tesla:
    "Tesla news on electric vehicles, Autopilot developments, energy products, and Elon Musk's business updates.",
  microsoft:
    "Microsoft news covering Windows updates, Azure cloud, Copilot AI integration, and enterprise technology.",
  google:
    "Google news including Search updates, Gemini AI, Android developments, and Alphabet business strategy.",
  meta:
    "Meta news on Facebook, Instagram, WhatsApp, Reality Labs, and metaverse technology developments.",
  amazon:
    "Amazon news covering e-commerce, AWS cloud services, Alexa AI, and logistics innovation.",
  openai:
    "OpenAI news including ChatGPT updates, GPT model releases, AI safety research, and industry partnerships.",
  chatgpt:
    "ChatGPT news covering new features, model improvements, plugins, and real-world AI applications.",
  bitcoin:
    "Bitcoin news including price movements, mining updates, regulatory developments, and institutional adoption.",
  samsung:
    "Samsung news on Galaxy smartphones, semiconductor manufacturing, display technology, and consumer electronics.",
  iphone:
    "iPhone news covering new model releases, iOS updates, camera improvements, and Apple ecosystem integration.",
  android:
    "Android news including OS updates, Google Play, device launches, and mobile technology trends.",
  gpu:
    "GPU news covering graphics card launches, AI accelerator chips, gaming performance, and data center hardware.",
  "5g":
    "5G network news on deployment progress, carrier updates, device compatibility, and next-gen connectivity.",
  climate:
    "Climate news covering environmental policy, carbon emissions, renewable energy, and sustainability efforts.",
  economy:
    "Global economy news including GDP updates, central bank policies, trade developments, and market analysis.",
  anthropic:
    "Anthropic news covering Claude AI, safety research, model releases, and responsible AI development.",
  deepseek:
    "DeepSeek news on AI model releases, open-source developments, and Chinese AI technology advances.",
  gemini:
    "Google Gemini news covering multimodal AI capabilities, model updates, and integration across Google products.",
  copilot:
    "Microsoft Copilot news including AI assistant features, Office integration, and enterprise productivity tools.",
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
