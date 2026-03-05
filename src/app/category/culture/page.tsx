"use client";
import CategoryPageContent from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/lib/categories";

const category = getCategoryBySlug("culture")!;

export default function Page() {
  return <CategoryPageContent category={category} />;
}
