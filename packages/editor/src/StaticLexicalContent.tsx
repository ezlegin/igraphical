// Pure, DOM-free renderer for serialized Lexical JSON. Used so blog post bodies
// are real HTML in the server response (SEO); the interactive read-only editor
// takes over after hydration. Uses the same theme classes as the editor.
import React, { CSSProperties, ReactNode } from "react";
import theme from "./themes/PlaygroundEditorTheme";

type LexNode = {
  type: string;
  children?: LexNode[];
  [key: string]: any;
};

const TEXT_FORMATS: [number, string][] = [
  [1, theme.text!.bold!],
  [2, theme.text!.italic!],
  [4, theme.text!.strikethrough!],
  [8, theme.text!.underline!],
  [16, theme.text!.code!],
  [32, theme.text!.subscript!],
  [64, theme.text!.superscript!],
  [128, theme.text!.highlight!],
];

function blockProps(node: LexNode, className?: string) {
  const classes = [className];
  if (node.direction === "rtl") classes.push(theme.rtl as string);
  if (node.direction === "ltr") classes.push(theme.ltr as string);
  const style: CSSProperties = {};
  if (typeof node.format === "string" && node.format) {
    style.textAlign = node.format as CSSProperties["textAlign"];
  }
  if (node.indent) style.paddingInlineStart = `${node.indent * 40}px`;
  return {
    className: classes.filter(Boolean).join(" ") || undefined,
    dir: node.direction || undefined,
    style: Object.keys(style).length ? style : undefined,
  };
}

function renderChildren(nodes: LexNode[] | undefined, depth = 0): ReactNode {
  return (nodes || []).map((child, i) => renderNode(child, i, depth));
}

function renderText(node: LexNode, key: number): ReactNode {
  const format = typeof node.format === "number" ? node.format : 0;
  const className = TEXT_FORMATS.filter(([bit]) => format & bit)
    .map(([, cls]) => cls)
    .join(" ");
  let el: ReactNode = node.text;
  if (format & 16) el = <code>{el}</code>;
  if (format & 32) el = <sub>{el}</sub>;
  if (format & 64) el = <sup>{el}</sup>;
  if (format & 1) el = <strong>{el}</strong>;
  if (format & 2) el = <em>{el}</em>;
  return (
    <span
      key={key}
      className={className || undefined}
      style={parseStyle(node.style)}
    >
      {el}
    </span>
  );
}

function parseStyle(css?: string): CSSProperties | undefined {
  if (!css) return undefined;
  const style: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop || !value) continue;
    style[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return Object.keys(style).length ? (style as CSSProperties) : undefined;
}

function renderNode(node: LexNode, key: number, depth: number): ReactNode {
  switch (node.type) {
    case "root":
      return (
        <React.Fragment key={key}>
          {renderChildren(node.children)}
        </React.Fragment>
      );
    case "paragraph": {
      // Same shortcode the editor's ReplacePrintPostPlugin swaps for a course
      // banner after mount; render nothing for it on the server.
      const text = (node.children || []).map((c) => c.text || "").join("");
      if (/\[print_post id="\d+"\]/.test(text)) return null;
      return (
        <p key={key} {...blockProps(node, theme.paragraph as string)}>
          {node.children?.length ? renderChildren(node.children) : <br />}
        </p>
      );
    }
    case "heading":
    case "custom-heading": {
      const Tag = (/^h[1-6]$/.test(node.tag) ? node.tag : "h2") as "h2";
      const cls = (theme.heading as Record<string, string>)[Tag];
      return (
        <Tag key={key} {...blockProps(node, cls)}>
          {renderChildren(node.children)}
        </Tag>
      );
    }
    case "quote":
      return (
        <blockquote key={key} {...blockProps(node, theme.quote as string)}>
          {renderChildren(node.children)}
        </blockquote>
      );
    case "list": {
      const ordered = node.listType === "number";
      const Tag = ordered ? "ol" : "ul";
      const cls = ordered
        ? (theme.list!.olDepth as string[])[depth % 5]
        : node.listType === "check"
          ? theme.list!.checklist
          : theme.list!.ul;
      return (
        <Tag
          key={key}
          {...blockProps(node, cls)}
          start={ordered && node.start !== 1 ? node.start : undefined}
        >
          {renderChildren(node.children, depth + 1)}
        </Tag>
      );
    }
    case "listitem": {
      const nested = node.children?.some((c) => c.type === "list");
      const cls = nested ? theme.list!.nested!.listitem : theme.list!.listitem;
      return (
        <li key={key} {...blockProps(node, cls)} value={node.value}>
          {renderChildren(node.children, depth)}
        </li>
      );
    }
    case "link":
    case "autolink":
      return (
        <a
          key={key}
          href={node.url}
          rel={node.rel || undefined}
          target={node.target || undefined}
          title={node.title || undefined}
          className={theme.link as string}
        >
          {renderChildren(node.children)}
        </a>
      );
    case "text":
    case "code-highlight":
    case "hashtag":
    case "keyword":
    case "mention":
    case "emoji":
    case "special-text":
      return renderText(node, key);
    case "linebreak":
      return <br key={key} />;
    case "tab":
      return <span key={key}>{"\t"}</span>;
    case "code":
      return (
        <code key={key} className={theme.code as string} dir="ltr">
          {renderChildren(node.children)}
        </code>
      );
    case "horizontalrule":
      return <hr key={key} className={theme.hr as string} />;
    case "image":
    case "inline-image":
      return (
        <span
          key={key}
          className={
            node.type === "image"
              ? (theme.image as string)
              : (theme.inlineImage as string)
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.src}
            alt={node.altText || ""}
            width={node.width || undefined}
            height={node.height || undefined}
            style={{
              maxWidth: node.maxWidth ? `${node.maxWidth}px` : "100%",
              height: "auto",
            }}
            loading="lazy"
          />
        </span>
      );
    case "table":
      return (
        <table key={key} className={theme.table as string}>
          <tbody>{renderChildren(node.children)}</tbody>
        </table>
      );
    case "tablerow":
      return <tr key={key}>{renderChildren(node.children)}</tr>;
    case "tablecell": {
      const Tag = node.headerState ? "th" : "td";
      return (
        <Tag
          key={key}
          className={theme.tableCell as string}
          colSpan={node.colSpan || undefined}
          rowSpan={node.rowSpan || undefined}
        >
          {renderChildren(node.children)}
        </Tag>
      );
    }
    case "youtube":
      return (
        <iframe
          key={key}
          width="560"
          height="315"
          src={`https://www.youtube-nocookie.com/embed/${node.videoID}`}
          allowFullScreen
          title="YouTube video"
          loading="lazy"
        />
      );
    default:
      // Unknown element nodes: keep their text/links in the HTML.
      return node.children ? (
        <div key={key}>{renderChildren(node.children, depth)}</div>
      ) : null;
  }
}

export default function StaticLexicalContent({ content }: { content: string }) {
  let root: LexNode | undefined;
  try {
    root = JSON.parse(content)?.root;
  } catch {
    return null;
  }
  if (!root) return null;
  return <div>{renderChildren(root.children)}</div>;
}
