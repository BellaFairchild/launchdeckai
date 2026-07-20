
import { colors } from "@/constants/colors";
import { parseMarkdown, type MdBlock } from "@/lib/markdown";
import { Text, View } from "@/tw";

const INLINE_RE = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g;

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(INLINE_RE).filter(Boolean);
  return (
    <Text className="font-body text-sm leading-6 text-text-secondary">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          const isLabel = inner.endsWith(":");
          return (
            <Text
              key={i}
              className={
                isLabel
                  ? "font-body text-sm font-semibold text-brand-teal"
                  : "font-body text-sm font-semibold text-text-primary"
              }
            >
              {inner}
            </Text>
          );
        }
        if (part.startsWith("_") && part.endsWith("_")) {
          return (
            <Text
              key={i}
              className="font-body text-sm italic text-text-tertiary"
            >
              {part.slice(1, -1)}
            </Text>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <Text
              key={i}
              className="font-mono text-xs text-brand-teal-light"
              style={{ backgroundColor: colors.bgCard }}
            >
              {part.slice(1, -1)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}

function Block({ block }: { block: MdBlock }) {
  switch (block.type) {
    case "h1":
      return (
        <View className="mb-4 border-b border-border-default pb-3">
          <Text className="font-display text-xl font-bold text-text-primary">
            {block.text}
          </Text>
        </View>
      );
    case "h2":
      return (
        <Text className="mb-2 mt-4 font-display text-base font-bold text-text-primary">
          {block.text}
        </Text>
      );
    case "h3":
      return (
        <Text className="mb-1.5 mt-3 font-display text-sm font-bold text-text-primary">
          {block.text}
        </Text>
      );
    case "hr":
      return <View className="my-4 border-t border-dashed border-border-med" />;
    case "ul":
      return (
        <View className="mb-3 gap-2">
          {block.items.map((item, i) => (
            <View key={i} className="flex-row gap-2.5">
              <View
                className="mt-2 h-1.5 w-1.5 rounded-sm"
                style={{ backgroundColor: colors.brandTeal }}
              />
              <View className="flex-1">
                <InlineMarkdown text={item} />
              </View>
            </View>
          ))}
        </View>
      );
    case "p":
      return (
        <View className="mb-2">
          <InlineMarkdown text={block.text} />
        </View>
      );
    default:
      return null;
  }
}

type Props = {
  content: string;
};

/** Renders forged markdown with LaunchDeck typography and teal accent labels. */
export function MarkdownPreview({ content }: Props) {
  const blocks = parseMarkdown(content);
  return (
    <View className="gap-0.5">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </View>
  );
}
