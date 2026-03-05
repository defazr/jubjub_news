"use client";
import CategoryPageContent from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/lib/categories";

const category = getCategoryBySlug("sports")!;

export default function Page() {
  return <CategoryPageContent category={category} />;
}
